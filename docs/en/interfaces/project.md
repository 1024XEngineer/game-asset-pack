# Project Service Interfaces

This document defines the Project Service application service interface and external interface constraints. See the [system architecture design](../system-architecture-design.md) for responsibilities and boundaries, and the [Project Service data structures](<../data structure/project.md>) for referenced types.

## Application Service Interface

`ProjectService` defines project-related use cases and serves as the application-layer entry point through which the interface layer invokes Project business capabilities.

```go
type ProjectService interface {
	Create(ctx context.Context, project *Project) error

	// List projects by user ID.
	ListByUid(ctx context.Context, uid uint) ([]*Project, error)

	// GetDetail returns project details.
	GetDetail(ctx context.Context, id uint) (*Project, error)

	Update(ctx context.Context, project *Project) error
}
```

## External Interfaces

The Project Service provides the following business capabilities externally:

- Creating projects
- Querying projects by user
- Retrieving project details
- Updating project configuration

HTTP paths, gRPC methods, request and response DTOs, error codes, and interface versioning strategies will be defined separately in the external API design. The interface layer converts external DTOs into the parameters required by application services and does not expose domain objects or database models directly.
