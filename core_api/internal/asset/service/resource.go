package service

import (
	"context"

	"github.com/1024XEngineer/Holonic-Asset/internal/asset/domain"
)

// AssetVersionService manages asset versioning.
type AssetVersionService interface {
	CreateRecord(ctx context.Context, version *domain.AssetVersion) (uint, error)
	GetVersionHistory(ctx context.Context, assetID uint) ([]domain.AssetVersion, error)
	RollBackVersion(ctx context.Context, assetID uint, version uint) (uint, error)
	Copy(ctx context.Context, assetID uint, version uint) (uint, error)
}
