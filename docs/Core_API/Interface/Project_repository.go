package interfaces

import (
	"context"

	data "github.com/1024XEngineer/Holonic-Asset/docs/Core_API/data_structure"
)

// ProjectRepository defines the persistence operations required by ProjectService.
type ProjectRepository interface {
	// Insert persists a new Project and assigns its generated identity.
	Insert(
		ctx context.Context,
		project *data.Project,
	) error

	// FindByID returns a Project by its identity.
	FindByID(
		ctx context.Context,
		projectID uint,
	) (*data.Project, error)

	// FindByUserID returns Projects owned by the specified user.
	FindByUserID(
		ctx context.Context,
		userID uint,
	) ([]*data.Project, error)

	// Save persists the current state of an existing Project.
	Save(
		ctx context.Context,
		project *data.Project,
	) error

	// Remove deletes a Project by its identity.
	Remove(
		ctx context.Context,
		projectID uint,
	) error
}
