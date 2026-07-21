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

	// RegisterTaskStepService registers the task-step query service.
	RegisterTaskStepService(service interfaces.TaskStepService)

	// RegisterTaskDispatcher registers the worker dispatch adapter.
	RegisterTaskDispatcher(dispatcher interfaces.TaskDispatcher)

	// RegisterTaskEventPublisher registers the task event publisher.
	RegisterTaskEventPublisher(publisher interfaces.TaskEventPublisher)

	// Create creates a task in the initial pending state.
	Create(ctx context.Context, task *interfaces.Task) error

	// ListByProjectID returns tasks belonging to the specified project.
	ListByProjectID(ctx context.Context, projectID uint) ([]*interfaces.Task, error)

	// GetDetail returns the current state and details of a task.
	GetDetail(ctx context.Context, taskID uint) (*interfaces.Task, error)

	// Update changes mutable task metadata without changing its state.
	Update(ctx context.Context, task *interfaces.Task) error

	// Transition applies a guarded task state transition.
	Transition(ctx context.Context, request *interfaces.TaskTransitionRequest) error

	// Delete removes a task according to the task retention policy.
	Delete(ctx context.Context, taskID uint) error

	// Replay requeues a failed or interrupted task as a new execution attempt.
	Replay(ctx context.Context, taskID uint) error

	// Cancel requests cancellation of a task and its runnable steps.
	Cancel(ctx context.Context, taskID uint) error

	// GetProgress returns the task progress and current state-machine state.
	GetProgress(ctx context.Context, taskID uint) (*interfaces.TaskProgress, error)

	// HandleResult applies a worker result idempotently and schedules dependent steps.
	HandleResult(ctx context.Context, result *interfaces.TaskResult) error

	// ListSteps returns the steps of a task in execution order.
	ListSteps(ctx context.Context, taskID uint) ([]*interfaces.TaskStep, error)

	// GetStepDetail returns the current state and details of a task step.
	GetStepDetail(ctx context.Context, stepID uint) (*interfaces.TaskStep, error)

	// TransitionStep applies a guarded task-step state transition.
	TransitionStep(ctx context.Context, request *interfaces.TaskStepTransitionRequest) error
}
