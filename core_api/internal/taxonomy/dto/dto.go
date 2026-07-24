package dto

import assetdomain "github.com/1024XEngineer/Holonic-Asset/internal/asset/domain"

// SearchAssetsRequest contains project-scoped text and taxonomy criteria.
type SearchAssetsRequest struct {
	ProjectID uint                    `param:"projectId"`
	Query     string                  `query:"q"`
	Tags      []string                `query:"tags"`
	Types     []assetdomain.AssetType `query:"types"`
}

// FindRelatedAssetsByTagsRequest identifies the asset whose tags seed discovery.
type FindRelatedAssetsByTagsRequest struct {
	ProjectID uint `query:"projectId"`
	AssetID   uint `query:"assetId"`
}

// FilterAssetsRequest contains project-scoped structured taxonomy criteria.
type FilterAssetsRequest struct {
	ProjectID uint                    `query:"projectId"`
	Tags      []string                `query:"tags"`
	Types     []assetdomain.AssetType `query:"types"`
}

// FindRelatedAssetsRequest identifies the asset that seeds semantic discovery.
type FindRelatedAssetsRequest struct {
	ProjectID uint `param:"projectId"`
	AssetID   uint `param:"assetId"`
}

// AssetSearchItem is the public asset summary returned by discovery endpoints.
type AssetSearchItem struct {
	ID          uint                  `json:"id"`
	Name        string                `json:"name"`
	ProjectID   uint                  `json:"projectId"`
	Type        assetdomain.AssetType `json:"type"`
	Description string                `json:"description"`
	Tags        []string              `json:"tags"`
	Version     uint                  `json:"version"`
}

// AssetSearchResult is the shared result contract for asset discovery.
type AssetSearchResult struct {
	Assets []AssetSearchItem `json:"assets"`
}
