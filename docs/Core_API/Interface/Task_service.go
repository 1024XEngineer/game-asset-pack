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

	// Transition applies a guarded task state transition.
	Transition(ctx context.Context, request *TaskTransitionRequest) error

	// Cancel requests cancellation of a task and its runnable steps.
	Cancel(ctx context.Context, taskID uint) error

	Consume(ctx context.Context)*Task
}