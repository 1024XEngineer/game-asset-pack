package queue

import (
	"context"
	"errors"
)

// ErrDuplicateJob indicates that a job with identical unique arguments
// already exists in the queue and was not re-inserted.
// Publishers return this when unique-args deduplication prevents a duplicate.
var ErrDuplicateJob = errors.New("queue: duplicate job (unique constraint)")

type Job interface {
	Kind() string
}

type Handler interface {
	JobKind() string
	Handle(ctx context.Context, payload []byte) error
}

type Publisher interface {
	Publish(ctx context.Context, job Job) (int64, error)
}
