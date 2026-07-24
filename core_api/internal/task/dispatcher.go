package task

import (
	"context"
	"errors"
	"log"

	"github.com/1024XEngineer/Holonic-Asset/internal/task/repository"
	"github.com/1024XEngineer/Holonic-Asset/pkg/queue"
)

type Dispatcher struct {
	repo      repository.TaskRepository
	publisher queue.Publisher
}

func NewDispatcher(repo repository.TaskRepository, p queue.Publisher) *Dispatcher {
	return &Dispatcher{repo: repo, publisher: p}
}

func (d *Dispatcher) Run(ctx context.Context, batchSize int) (int, error) {
	records, err := d.repo.FetchPendingOutbox(ctx, batchSize)
	if err != nil {
		return 0, err
	}

	published := 0
	for _, outbox := range records {
		job, err := DeserializeJob(outbox.JobKind, []byte(outbox.Payload))
		if err != nil {
			log.Printf("task dispatcher: deserialize outbox %d (%s): %v",
				outbox.ID, outbox.JobKind, err)
			continue
		}

		jobID, err := d.publisher.Publish(ctx, job)
		if err != nil {
			if errors.Is(err, queue.ErrDuplicateJob) {
				if err := d.repo.MarkOutboxPublished(ctx, outbox.ID, 0); err != nil {
					log.Printf("task dispatcher: mark duplicate outbox %d: %v", outbox.ID, err)
					continue
				}
				published++
				continue
			}
			log.Printf("task dispatcher: publish outbox %d (%s): %v",
				outbox.ID, outbox.JobKind, err)
			continue
		}

		if err := d.repo.MarkOutboxPublished(ctx, outbox.ID, jobID); err != nil {
			log.Printf("task dispatcher: mark published outbox %d: %v", outbox.ID, err)
			continue
		}
		published++
	}

	return published, nil
}
