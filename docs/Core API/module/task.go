package module

import (
	"context"

	interfaces "../Interface"
)

// TaskModule describes the internal providers and public capabilities of the Task module.
type TaskModule interface {
	// RegisterProject provides project-scoped authorization and context.
	RegisterProject(project ProjectModule)

	// RegisterTaskService registers the Task application service.
	RegisterTaskService(service interfaces.TaskService)

	// Create creates a task in the initial pending state.
	Create(ctx context.Context, task *interfaces.Task) error

	GetTask(ctx context.Context, taskType interfaces.TaskType) *interfaces.Task

	// ListByProjectID returns tasks belonging to the specified project.
	ListByProjectID(ctx context.Context, projectID uint) ([]*interfaces.Task, error)

	// GetDetail returns the current state and details of a task.
	GetDetail(ctx context.Context, taskID uint) (*interfaces.Task, error)

	// Transition applies a guarded task state transition.
	Transition(ctx context.Context, request *interfaces.TaskTransitionRequest) error

	// Cancel requests cancellation of a task and its runnable steps.
	Cancel(ctx context.Context, taskID uint) error
}
