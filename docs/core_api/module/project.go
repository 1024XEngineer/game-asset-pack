package module

import (
	"context"

	interfaces "github.com/1024XEngineer/Holonic-Asset/docs/core_api/interface"
)

// ProjectModule describes the internal components and public capabilities of the Project module.
type ProjectModule interface {
	// RegisterProjectService registers the Project application service.
	RegisterProjectService(service interfaces.ProjectService)

	// Create creates a project for the authenticated actor.
	Create(ctx context.Context, project *interfaces.Project) error

	// ListByUID returns all projects visible to the specified user.
	ListByUID(ctx context.Context, userID uint) ([]*interfaces.Project, error)

	// GetDetail returns the details of the specified project.
	GetDetail(ctx context.Context, projectID uint) (*interfaces.Project, error)

	// Update updates mutable fields of the specified project.
	Update(ctx context.Context, project *interfaces.Project) error

	// Delete deletes the specified project.
	Delete(ctx context.Context, projectID uint) error
}
