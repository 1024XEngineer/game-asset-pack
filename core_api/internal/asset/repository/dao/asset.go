package dao

import (
	"context"
	"encoding/json"

	"gorm.io/gorm"
)

type Asset struct {
	ID          uint
	Name        string
	ProjectID   uint
	Type        string
	Description string
	Tags        []string        `json:"tags"`
	Attributes  json.RawMessage `json:"attributes"`
	Version     uint
}

type AssetDao interface {
	CreateAsset(ctx context.Context, asset *Asset) (uint, error)
	GetAssetsByProjectID(ctx context.Context, projectID uint) ([]Asset, error)
}

type AssetDaoImpl struct {
	DB *gorm.DB
}

func (a *AssetDaoImpl) GetAssetsByProjectID(ctx context.Context, projectID uint) ([]Asset, error) {
	return nil, nil
}
