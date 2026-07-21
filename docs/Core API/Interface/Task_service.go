package interfaces

import "context"

// TaskService defines the lifecycle and orchestration use cases for a task.
type TaskService interface {
	// Create creates a task in the initial pending state.
	Create(ctx context.Context, task *Task) error

	// ListByProjectID returns tasks belonging to the specified project.
	ListByProjectID(ctx context.Context, projectID uint) ([]*Task, error)

	// GetDetail returns the current state and details of a task.
	GetDetail(ctx context.Context, taskID uint) (*Task, error)

	// Update changes mutable task metadata without changing its state.
	Update(ctx context.Context, task *Task) error

	// Transition applies a guarded task state transition.
	Transition(ctx context.Context, request *TaskTransitionRequest) error

	// Delete removes a task according to the task retention policy.
	Delete(ctx context.Context, taskID uint) error

	// Replay requeues a failed or interrupted task as a new execution attempt.
	Replay(ctx context.Context, taskID uint) error

	// Cancel requests cancellation of a task and its runnable steps.
	Cancel(ctx context.Context, taskID uint) error

	// GetProgress returns the task progress and current state-machine state.
	GetProgress(ctx context.Context, taskID uint) (*TaskProgress, error)

	// HandleResult applies a worker result idempotently and schedules dependent steps.
	HandleResult(ctx context.Context, result *TaskResult) error
}

// TaskStepService defines read operations for the steps owned by a task.
type TaskStepService interface {
	// ListByTaskID returns the steps of a task in execution order.
	ListByTaskID(ctx context.Context, taskID uint) ([]*TaskStep, error)

	// GetDetail returns the current state and details of a task step.
	GetDetail(ctx context.Context, stepID uint) (*TaskStep, error)

	// Transition applies a guarded task-step state transition.
	Transition(ctx context.Context, request *TaskStepTransitionRequest) error
}

// TaskDispatcher defines the port used to hand runnable steps to workers.
type TaskDispatcher interface {
	Dispatch(ctx context.Context, step *TaskStep) error
	Cancel(ctx context.Context, taskID uint) error
}

// TaskEventPublisher defines the port used to publish task state and result events.
type TaskEventPublisher interface {
	PublishStateChanged(ctx context.Context, task *Task) error
	PublishProgress(ctx context.Context, progress *TaskProgress) error
}
