package interfaces

import "context"

// AssetDiscoveryService defines project-scoped tag lookup, filtering, and semantic discovery.
type AssetDiscoveryService interface {
	// SearchAssets searches assets by text and taxonomy criteria.
	SearchAssets(
		ctx context.Context,
		request *SearchAssetsRequest,
	) (*AssetSearchResult, error)

	// FindRelatedAssetsByTags returns related assets matching their stored tags.
	FindRelatedAssetsByTags(
		ctx context.Context,
		request *FindRelatedAssetsByTagsRequest,
	) (*AssetSearchResult, error)

	// FilterAssets applies structured criteria without persisting filter state.
	FilterAssets(
		ctx context.Context,
		request *FilterAssetsRequest,
	) (*AssetSearchResult, error)

	// FindRelatedAssets uses LLM-based semantic retrieval without persisting associations.
	FindRelatedAssets(
		ctx context.Context,
		request *FindRelatedAssetsRequest,
	) (*AssetSearchResult, error)
}
