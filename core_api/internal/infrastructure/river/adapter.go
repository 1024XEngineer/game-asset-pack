// Package river implements queue.Publisher using River as the job queue
// backend. This is the ONLY package (along with ioc) that imports River
// directly — business modules never see these types.
package river

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverpgxv5"

	"github.com/1024XEngineer/Holonic-Asset/pkg/queue"
)

const riverJobKind = "holonic_job"

type riverJobArgs struct {
	KindName string          `json:"kind_name"`
	Payload  json.RawMessage `json:"payload"`
}

func (r riverJobArgs) Kind() string { return riverJobKind }

type riverWorker struct {
	river.WorkerDefaults[riverJobArgs]
	handlers map[string]queue.Handler
}

func (w *riverWorker) Work(ctx context.Context, job *river.Job[riverJobArgs]) error {
	h, ok := w.handlers[job.Args.KindName]
	if !ok {
		return fmt.Errorf("river: no handler for %q", job.Args.KindName)
	}
	return h.Handle(ctx, []byte(job.Args.Payload))
}

type Publisher struct {
	client *river.Client[pgx.Tx]
}

func NewPublisher(client *river.Client[pgx.Tx]) *Publisher {
	return &Publisher{client: client}
}

func (p *Publisher) Publish(ctx context.Context, job queue.Job) (int64, error) {
	payload, err := json.Marshal(job)
	if err != nil {
		return 0, fmt.Errorf("river: marshal %q: %w", job.Kind(), err)
	}

	args := riverJobArgs{
		KindName: job.Kind(),
		Payload:  json.RawMessage(payload),
	}

	res, err := p.client.Insert(ctx, args, &river.InsertOpts{
		UniqueOpts: river.UniqueOpts{ByArgs: true},
	})
	if err != nil {
		return 0, fmt.Errorf("river: insert %q: %w", job.Kind(), err)
	}
	if res.UniqueSkippedAsDuplicate {
		return 0, queue.ErrDuplicateJob
	}
	return res.Job.ID, nil
}

func BuildClient(
	ctx context.Context,
	dbPool *pgxpool.Pool,
	config *river.Config,
	handlers ...queue.Handler,
) (*river.Client[pgx.Tx], error) {
	workers := river.NewWorkers()

	if len(handlers) > 0 {
		w := &riverWorker{
			handlers: make(map[string]queue.Handler, len(handlers)),
		}
		for _, h := range handlers {
			kind := h.JobKind()
			if _, exists := w.handlers[kind]; exists {
				return nil, fmt.Errorf("river: duplicate handler for %q", kind)
			}
			w.handlers[kind] = h
		}
		river.AddWorker(workers, w)
	}

	config.Workers = workers

	client, err := river.NewClient(riverpgxv5.New(dbPool), config)
	if err != nil {
		return nil, fmt.Errorf("river: create client: %w", err)
	}
	return client, nil
}
