package interfaces

type AssetService interface {
	Detail(x context.Context, assetID uint) (*AssetDetailResponse, error)
	Record(x context.Context, asset RecordAssetRequest) ([]RecordAssetResponse, error)
	CreateCharacterAsset(ctx context.Context, asset CreateCharacterAssetRequest) (CreateCharacterAssetResponse, error)
	CreateObjectAsset(ctx context.Context, asset CreateObjectAssetRequest) (CreateObjectAssetResponse, error)
	CreateTileSetAsset(ctx context.Context, asset CreateTileSetAssetRequest) (CreateTileSetAssetResponse, error)
	CopyAsset(ctx context.Context, asset CopyAssetRequest) (CopyAssetResponse, error)
}