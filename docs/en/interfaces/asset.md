# Asset Service Interfaces

This document defines the Asset Service current-state management, version-management, and external interface constraints. See the [system architecture design](../system-architecture-design.md) for responsibilities and boundaries, and the [Asset Service data structures](<../data structure/asset.md>) for referenced types.

## Application Service Interfaces

`AssetService` provides use cases for managing the current state of assets, while `AssetRecordService` provides use cases for asset version management.

```go
type AssetService interface {
	// Create creates an asset and its initial version snapshot.
	Create(ctx context.Context, asset *Asset) error

	// ListByProjectID returns all assets in a specified project.
	ListByProjectID(ctx context.Context, projectID uint) ([]*Asset, error)

	// GetDetail returns the current details of a specified asset.
	GetDetail(ctx context.Context, id uint) (*Asset, error)

	// Update updates an asset and creates a new version snapshot in the same transaction.
	Update(ctx context.Context, asset *Asset) error
}

type AssetRecordService interface {
	// CreateSnapshot creates a snapshot from the current state of an asset.
	// The service layer calculates and assigns the AssetVersion automatically.
	CreateSnapshot(ctx context.Context, assetID uint) (*AssetRecord, error)

	// ListByAssetID returns all snapshot records for a specified asset,
	// ordered by AssetVersion from highest to lowest.
	ListByAssetID(
		ctx context.Context,
		assetID uint,
	) ([]*AssetRecord, error)

	// GetDetail returns details of a specified asset snapshot record.
	GetDetail(ctx context.Context, recordID uint) (*AssetRecord, error)

	// Restore restores the editable asset state from a specified snapshot.
	// Restoring creates a new asset version and does not overwrite or delete history.
	Restore(ctx context.Context, assetID uint, recordID uint,
	) (*AssetRecord, error)
}
```

The current interfaces cover creation, list queries, detail queries, updates, snapshot creation, snapshot queries, and version restoration. Deletion, search, asset relationships, and tag management still need to be added to the application service interfaces.

## External Interfaces

The Asset Service provides two categories of external interfaces: asset management and record management.

Asset management interfaces include creation, duplication, querying, updating, deletion, search, relationships, and tag management. Version management interfaces include querying the version list, retrieving version details, and restoring a specified version.

The specific protocols, API paths, pagination rules, filter parameters, and error codes will be defined in the external API design. The interface layer must not allow callers to change an asset ID or project ownership through snapshot restoration.
