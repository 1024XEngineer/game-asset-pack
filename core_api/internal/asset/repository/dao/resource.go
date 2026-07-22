package dao

import (
	"context"
)

type AssetResourceDao interface {
	CreateAssetResource(ctx context.Context, resource *AssetResource) (uint, error)
}

type AssetResource struct {
	ID           uint
	Name         string
	ParentID     *uint
	AssetID      uint
	AssetVersion uint
	Type         string
	Url          *string
	Status       uint
}
