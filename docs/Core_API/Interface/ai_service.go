package interfaces

import (
	"context"

	data "github.com/1024XEngineer/Holonic-Asset/docs/Core_API/data_structure"
)

// CharacterService defines Character generation and editing.
type CharacterService interface {
	GenerateCharacter(
		ctx context.Context,
		request *data.GenerateCharacterRequest,
	) (*data.GenerateCharacterResponse, error)

	EditCharacter(
		ctx context.Context,
		request *data.EditCharacterRequest,
	) (*data.EditCharacterResponse, error)
}

// ProjectPreviewService defines Project preview generation.
type ProjectPreviewService interface {
	GenerateProjectPreview(
		ctx context.Context,
		request *data.GenerateProjectPreviewRequest,
	) (*data.GenerateProjectPreviewResponse, error)
}

// TileSetService defines TileSet Item generation and editing.
type TileSetService interface {
	GenerateTileSetItem(
		ctx context.Context,
		request *data.GenerateTileSetItemRequest,
	) (*data.GenerateTileSetItemResponse, error)

	EditTileSetItem(
		ctx context.Context,
		request *data.EditTileSetItemRequest,
	) (*data.EditTileSetItemResponse, error)
}

// ObjectService defines Object generation and editing.
type ObjectService interface {
	GenerateObject(
		ctx context.Context,
		request *data.GenerateObjectRequest,
	) (*data.GenerateObjectResponse, error)

	EditObject(
		ctx context.Context,
		request *data.EditObjectRequest,
	) (*data.EditObjectResponse, error)
}

// SceneryService defines Scenery layer generation and editing.
type SceneryService interface {
	GenerateSceneryLayer(
		ctx context.Context,
		request *data.GenerateSceneryLayerRequest,
	) (*data.GenerateSceneryLayerResponse, error)

	EditSceneryLayer(
		ctx context.Context,
		request *data.EditSceneryLayerRequest,
	) (*data.EditSceneryLayerResponse, error)
}

// AnimationService defines Animation generation and frame editing.
type AnimationService interface {
	GenerateAnimation(
		ctx context.Context,
		request *data.GenerateAnimationRequest,
	) (*data.GenerateAnimationResponse, error)

	EditFrame(
		ctx context.Context,
		request *data.EditFrameRequest,
	) (*data.EditFrameResponse, error)
}

// UIService defines UI generation and component editing.
type UIService interface {
	GenerateUI(
		ctx context.Context,
		request *data.GenerateUIRequest,
	) (*data.GenerateUIResponse, error)

	EditUIComponent(
		ctx context.Context,
		request *data.EditUIComponentRequest,
	) (*data.EditUIComponentResponse, error)
}

// LLMClient defines the provider adapter required by the AI module.
type LLMClient interface {
	Chat(ctx context.Context, request *data.LLMRequest) (*data.LLMResponse, error)
	GenerateImage(ctx context.Context, request *data.ImageGenerationRequest) (*data.GenerationResult, error)
	GetGenerationResult(ctx context.Context, generationID string) (*data.GenerationResult, error)
	CancelGeneration(ctx context.Context, generationID string) error
}
