package dao

type AssetVersion struct {
	ID      uint
	AssetID uint
	Version uint
}

type AssetVersionDao interface {
	CreateAssetVersion(version *AssetVersion) (uint, error)
	DeleteAssetVersion(assetID uint, version uint) error
}
