package module

import (
	"context"

	data "github.com/1024XEngineer/Holonic-Asset/docs/core_api/data_structure"
	interfaces "github.com/1024XEngineer/Holonic-Asset/docs/core_api/interface"
)

// AssetService manages CRUD operations for assets.
type AssetModule interface {
	Register()
	GetAssets(ctx context.Context, projectID uint) ([]Asset, error)
	GetDetail(ctx context.Context, id uint) (Asset, error)
	UpdateTags(ctx context.Context, id uint, tags []string) ([]string, error)

	// Creates a Character asset and initializes an empty prototype resource.
	CreateCharacterAsset(ctx context.Context, asset *Asset) (uint, error)
	CreateObjectAsset(ctx context.Context, asset *Asset) (uint, error)
	CreateTileSetAsset(ctx context.Context, asset *Asset) (uint, error)
	CreateUIAsset(ctx context.Context, asset *Asset) (uint, error)
	CreateSceneryAsset(ctx context.Context, asset *Asset) (uint, error)
}

// AssetResourceService manages resources under an asset.
type AssetResourceModule interface {
	// GetAssetResource returns an AssetResource by its identity.
	GetAssetResource(ctx context.Context, assetResourceID uint) (*data.AssetResource, error)

	GetProtoTypeResources(ctx context.Context, assetID uint, version uint) ([]AssetResource, error)

	// Animation resources.
	CreateAnimationResource(ctx context.Context, resource *AssetResource) (uint, error)
	EditAnimationResource(ctx context.Context, id uint, resource []AssetResource) error
	GetAnimations(ctx context.Context, assetID uint, version uint) ([]AssetResource, error)

	// Frame resources (associated with an animation).
	CreateFrameResources(ctx context.Context, resource []AssetResource) ([]AssetResource, error)
	EditFrameResources(ctx context.Context, resource []AssetResource) ([]AssetResource, error)
	GetFrameResources(ctx context.Context, animationID uint) ([]AssetResource, error)

	// Tile / Item resources.
	CreateTileResources(ctx context.Context, resource []AssetResource) ([]AssetResource, error)
	EditItemResources(ctx context.Context, id uint, resource []AssetResource) ([]AssetResource, error)
	GetItemResources(ctx context.Context, assetID uint, version uint) ([]AssetResource, error)
	GetTilesResources(ctx context.Context, itemID uint) ([]AssetResource, error)

	// Image resources.
	CreateImageResources(ctx context.Context, resource []AssetResource) ([]AssetResource, error)
	EditImageResources(ctx context.Context, resource []AssetResource) ([]AssetResource, error)
}

// AssetVersionService manages asset versioning.
type AssetVersionModule interface {
	CreateRecord(ctx context.Context, version *AssetVersion) (uint, error)
	GetVersionHistory(ctx context.Context, assetID uint) ([]AssetVersion, error)
	RollBackVersion(ctx context.Context, assetID uint, version uint) (uint, error)
	Copy(ctx context.Context, assetID uint, version uint) (uint, error)
}
