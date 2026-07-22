package repository

import (
	"context"

	"github.com/1024XEngineer/Holonic-Asset/internal/asset/domain"
	"github.com/1024XEngineer/Holonic-Asset/internal/asset/repository/dao"
)

type AssetRepository interface {
	GetAssetsByProjectID(ctx context.Context, projectID uint) ([]domain.Asset, error)
	GetAssetDetail(ctx context.Context, id uint) (*domain.Asset, error)
	UpdateTags(ctx context.Context, id uint, tags []string) ([]string, error)
	// CreateCharacterAsset creates a character asset and an empty protoType resource.
	CreateCharacterAsset(ctx context.Context, asset *domain.Asset) (uint, error)
	// CreateImageResources creates image resources bound to a specific protoType.
	CreateImageResources(ctx context.Context, resource []domain.AssetResource) ([]domain.AssetResource, error)
	CreateAnimationResource(ctx context.Context, resource *domain.AssetResource) (uint, error)

	UpdateFrameResources(ctx context.Context, resource []domain.AssetResource) error
	DeleteFrameResourcesByAnimationID(ctx context.Context, id uint) error
	UpdateProtoTypeResources(ctx context.Context, resource []domain.AssetResource) error

	GetAnimations(ctx context.Context, assetID uint, version uint) ([]domain.AssetResource, error)
	GetProtoTypeResources(ctx context.Context, assetID uint, version uint) ([]domain.AssetResource, error)

	// CreateRecord creates an AssetVersion, updates the Asset's version, and copies all resources under the asset to the new version.
	CreateRecord(ctx context.Context, version *domain.AssetVersion) (*domain.AssetVersion, error)
	// RollBackRecord deletes the AssetVersion, rolls back the Asset's version to the previous one, and deletes all resources of that version.
	RollBackRecord(ctx context.Context, assetID uint, version uint) (uint, error)
	// Copy performs a full copy of the version, asset, and all its resources to a new asset.
	Copy(ctx context.Context, assetID uint) (uint, error)
}

type AssetRepositoryImpl struct {
	AssetDao    dao.AssetDao
	ResourceDao dao.AssetResourceDao
	VersionDao  dao.AssetVersionDao
}

func (r *AssetRepositoryImpl) GetAssetsByProjectID(ctx context.Context, projectID uint) ([]domain.Asset, error) {
	_, err := r.AssetDao.GetAssetsByProjectID(ctx, projectID)

	return nil, err
}
