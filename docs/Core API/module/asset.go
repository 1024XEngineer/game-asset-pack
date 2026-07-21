package module
import (
	"context"

	interfaces "../Interface"
)

type AssetModule interface {
	RegisterAssetService(service interfaces.AssetService)
	// Create a Character Asset and create an empty prototype Resource.
	CreateCharacterAsset(ctx context.Context, asset *Asset) (uint, error)

	GetProtoTypeResources(ctx context.Context, assetID uint, version uint) (*AssetResource, error)

	// Create an Object Asset and create an empty prototype Resource.
	CreateObjectAsset(ctx context.Context, asset *Asset) (uint, error)

	CreateTileSetAsset(ctx context.Context, asset *Asset) (uint, error)

	CreateUIAsset(ctx context.Context, asset *Asset) (uint, error)

	CreateSceneryAsset(ctx context.Context, asset *Asset) (uint, error)

	// Create an Animation Resource bound to an Asset.
	CreateAnimationResource(ctx context.Context, resource *AssetResource) (uint, error)

	GetAnimations(ctx context.Context, assetID uint, version uint) ([]AssetResource, error)

	// Create Frame Resources bound to an Animation.
	CreateFrameResources(ctx context.Context, resource []AssetResource) ([]AssetResource, error)

	EditFrameResources(ctx context.Context, resource []AssetResource) ([]AssetResource, error)

	CreateImageResources(ctx context.Context, resource []AssetResource) ([]AssetResource, error)

	CreateTileResources(ctx context.Context, resource []AssetResource) ([]AssetResource, error)

	EditItemResources(ctx context.Context, resource []AssetResource) ([]AssetResource, error)

	CreateRecord(ctx context.Context, version *AssetVersion) (uint, error)

	GetVersionHistory(ctx context.Context, assetID uint) ([]AssetVersion, error)

	RollBackVersion(ctx context.Context, assetID uint, version uint) (uint, error)

	Copy(ctx context.Context, assetID uint, version uint) (uint, error)
}