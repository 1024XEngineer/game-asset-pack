package interfaces

import (
	"context"

	data "github.com/1024XEngineer/Holonic-Asset/docs/Core_API/data_structure"
)

// AssetRepository defines persistence operations for the current Asset state.
type AssetRepository interface {
	// Insert persists a new Asset and assigns its generated identity.
	Insert(
		ctx context.Context,
		asset *data.Asset,
	) error

	// FindByID returns an Asset by its identity.
	FindByID(
		ctx context.Context,
		assetID uint,
	) (*data.Asset, error)

	// FindByProjectID returns Assets owned by the specified Project.
	FindByProjectID(
		ctx context.Context,
		projectID uint,
	) ([]*data.Asset, error)

	// Save persists the current state of an existing Asset.
	Save(
		ctx context.Context,
		asset *data.Asset,
	) error

	// Remove deletes an Asset by its identity.
	Remove(
		ctx context.Context,
		assetID uint,
	) error
}

// AssetResourceRepository defines persistence operations for resources owned by an Asset.
type AssetResourceRepository interface {
	// Insert persists a new AssetResource and assigns its generated identity.
	Insert(
		ctx context.Context,
		resource *data.AssetResource,
	) error

	// InsertBatch persists multiple AssetResources as one repository operation.
	InsertBatch(
		ctx context.Context,
		resources []*data.AssetResource,
	) error

	// FindByID returns an AssetResource by its identity.
	FindByID(
		ctx context.Context,
		assetResourceID uint,
	) (*data.AssetResource, error)

	// FindByAssetVersionAndType returns matching resources owned by an Asset version.
	FindByAssetVersionAndType(
		ctx context.Context,
		assetID uint,
		assetVersion uint,
		resourceType data.AssetResourceType,
	) ([]*data.AssetResource, error)

	// FindByParentIDAndType returns matching child resources.
	FindByParentIDAndType(
		ctx context.Context,
		parentID uint,
		resourceType data.AssetResourceType,
	) ([]*data.AssetResource, error)

	// Save persists the current state of an existing AssetResource.
	Save(
		ctx context.Context,
		resource *data.AssetResource,
	) error

	// SaveBatch persists the current state of multiple AssetResources.
	SaveBatch(
		ctx context.Context,
		resources []*data.AssetResource,
	) error
}

// AssetVersionRepository defines persistence operations for immutable Asset versions.
type AssetVersionRepository interface {
	// Insert persists a new immutable AssetVersion and assigns its generated identity.
	Insert(
		ctx context.Context,
		version *data.AssetVersion,
	) error

	// FindByID returns an AssetVersion by its identity.
	FindByID(
		ctx context.Context,
		assetVersionID uint,
	) (*data.AssetVersion, error)

	// FindByAssetIDAndVersion returns a specific version of an Asset.
	FindByAssetIDAndVersion(
		ctx context.Context,
		assetID uint,
		version uint,
	) (*data.AssetVersion, error)

	// FindByAssetID returns immutable versions ordered by version number.
	FindByAssetID(
		ctx context.Context,
		assetID uint,
	) ([]*data.AssetVersion, error)
}
