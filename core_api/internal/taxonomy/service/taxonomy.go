package service

import (
	"context"

	"github.com/1024XEngineer/Holonic-Asset/internal/taxonomy/dto"
)

// AssetDiscoveryService defines project-scoped tag lookup, filtering, and semantic discovery.
type AssetDiscoveryService interface {
	SearchAssets(
		ctx context.Context,
		request *dto.SearchAssetsRequest,
	) (*dto.AssetSearchResult, error)
	FindRelatedAssetsByTags(
		ctx context.Context,
		request *dto.FindRelatedAssetsByTagsRequest,
	) (*dto.AssetSearchResult, error)
	FilterAssets(
		ctx context.Context,
		request *dto.FilterAssetsRequest,
	) (*dto.AssetSearchResult, error)
	FindRelatedAssets(
		ctx context.Context,
		request *dto.FindRelatedAssetsRequest,
	) (*dto.AssetSearchResult, error)
}

// assetDiscoveryService is empty because Taxonomy currently has only placeholder
// behavior and, unlike implemented services, does not yet depend on a repository or provider.
type assetDiscoveryService struct{}

func NewAssetDiscoveryService() AssetDiscoveryService {
	return &assetDiscoveryService{}
}

func (*assetDiscoveryService) SearchAssets(
	context.Context,
	*dto.SearchAssetsRequest,
) (*dto.AssetSearchResult, error) {
	return emptyAssetSearchResult(), nil
}

func (*assetDiscoveryService) FindRelatedAssetsByTags(
	context.Context,
	*dto.FindRelatedAssetsByTagsRequest,
) (*dto.AssetSearchResult, error) {
	return emptyAssetSearchResult(), nil
}

func (*assetDiscoveryService) FilterAssets(
	context.Context,
	*dto.FilterAssetsRequest,
) (*dto.AssetSearchResult, error) {
	return emptyAssetSearchResult(), nil
}

func (*assetDiscoveryService) FindRelatedAssets(
	context.Context,
	*dto.FindRelatedAssetsRequest,
) (*dto.AssetSearchResult, error) {
	return emptyAssetSearchResult(), nil
}

func emptyAssetSearchResult() *dto.AssetSearchResult {
	return &dto.AssetSearchResult{Assets: []dto.AssetSearchItem{}}
}

var _ AssetDiscoveryService = (*assetDiscoveryService)(nil)
