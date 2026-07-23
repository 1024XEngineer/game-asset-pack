package interfaces

import (
	"context"

	data "github.com/1024XEngineer/Holonic-Asset/docs/core_api/data_structure"
)

type AssetService interface {
	GetAssets(x context.Context, request GetAssetsRequest) ([]GetAssetsResponse, error)
	Detail(x context.Context, assetID uint) (*AssetDetailResponse, error)
	Record(x context.Context, asset RecordAssetRequest) ([]RecordAssetResponse, error)
	CreateCharacterAsset(ctx context.Context, asset CreateCharacterAssetRequest) (CreateCharacterAssetResponse, error)
	CreateObjectAsset(ctx context.Context, asset CreateObjectAssetRequest) (CreateObjectAssetResponse, error)
	CreateTileSetAsset(ctx context.Context, asset CreateTileSetAssetRequest) (CreateTileSetAssetResponse, error)
	CopyAsset(ctx context.Context, asset CopyAssetRequest) (CopyAssetResponse, error)

	// GetAssetResource returns an AssetResource by its identity.
	GetAssetResource(ctx context.Context, assetResourceID uint) (*data.AssetResource, error)

	Tags(ctx context.Context, assetID uint, tags []string) error
}
