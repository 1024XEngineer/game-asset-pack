package module

import (
	"context"

	interfaces "../Interface"
)

// TaxonomyModule describes public tag lookup, semantic discovery, search, and filtering capabilities.
type TaxonomyModule interface {
	// RegisterAsset provides asset identity, ownership, and project scope.
	RegisterAsset(asset AssetModule)

	// RegisterAssetDiscoveryService registers tag lookup, filtering, and semantic discovery.
	RegisterAssetDiscoveryService(service interfaces.AssetDiscoveryService)

	// SearchAssets searches assets by text and taxonomy criteria.
	SearchAssets(
		ctx context.Context,
		request *interfaces.SearchAssetsRequest,
	) (*interfaces.AssetSearchResult, error)

	// FindRelatedAssetsByTags returns related assets matching their stored tags.
	FindRelatedAssetsByTags(
		ctx context.Context,
		request *interfaces.FindRelatedAssetsByTagsRequest,
	) (*interfaces.AssetSearchResult, error)

	// FilterAssets applies structured criteria without persisting filter state.
	FilterAssets(
		ctx context.Context,
		request *interfaces.FilterAssetsRequest,
	) (*interfaces.AssetSearchResult, error)

	// FindRelatedAssets uses LLM-based semantic retrieval without persisting associations.
	FindRelatedAssets(
		ctx context.Context,
		request *interfaces.FindRelatedAssetsRequest,
	) (*interfaces.AssetSearchResult, error)
}
