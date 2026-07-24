package interfaces

import "context"

// ProjectService defines the project lifecycle use cases.
type ProjectService interface {
	// Create creates a project for the authenticated actor.
	Create(
		ctx context.Context,
		project *Project,
	) error

	// ListByUID returns all projects visible to the specified user.
	ListByUID(
		ctx context.Context,
		userID uint,
	) ([]*Project, error)

	// GetDetail returns the details of the specified project.
	GetDetail(
		ctx context.Context,
		projectID uint,
	) (*Project, error)

	// Update updates mutable fields of the specified project.
	Update(
		ctx context.Context,
		project *Project,
	) error

	// Delete deletes the specified project.
	Delete(
		ctx context.Context,
		projectID uint,
	) error
}
