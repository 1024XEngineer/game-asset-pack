package interfaces

import "context"

// CharacterService defines character generation capabilities owned by the AI module.
type CharacterService interface {
	CreateCharacter(
		ctx context.Context,
		request *CreateCharacterRequest,
	) (*CreateCharacterResponse, error)

	EditCharacter(
		ctx context.Context,
		request *EditCharacterRequest,
	) (*EditCharacterResponse, error)
}

// SceneryService defines scenery layer generation capabilities owned by the AI module.
type SceneryService interface {
	CreateLayer(
		ctx context.Context,
		request *CreateLayerRequest,
	) (*CreateLayerResponse, error)

	EditLayer(
		ctx context.Context,
		request *EditLayerRequest,
	) (*EditLayerResponse, error)
}

// TileSetService defines tile-set generation capabilities owned by the AI module.
type TileSetService interface {
	CreateTileSet(
		ctx context.Context,
		request *CreateTileSetRequest,
	) (*CreateTileSetResponse, error)

	EditTileSet(
		ctx context.Context,
		request *EditTileSetRequest,
	) (*EditTileSetResponse, error)
}

// ObjectService defines object generation capabilities owned by the AI module.
type ObjectService interface {
	CreateObject(
		ctx context.Context,
		request *CreateObjectRequest,
	) (*CreateObjectResponse, error)

	EditObject(
		ctx context.Context,
		request *EditObjectRequest,
	) (*EditObjectResponse, error)
}

// AnimationService defines animation generation and frame editing capabilities.
type AnimationService interface {
	CreateAnimation(
		ctx context.Context,
		request *CreateAnimationRequest,
	) (*CreateAnimationResponse, error)

	EditFrame(
		ctx context.Context,
		request *EditFrameRequest,
	) (*EditFrameResponse, error)
}

// UIService defines UI component generation capabilities owned by the AI module.
type UIService interface {
	CreateUI(
		ctx context.Context,
		request *CreateUIRequest,
	) (*CreateUIResponse, error)

	EditUIComponent(
		ctx context.Context,
		request *EditUIComponentRequest,
	) (*EditUIComponentResponse, error)
}

// LLMClient defines the provider adapter required by the AI module.
type LLMClient interface {
	Chat(ctx context.Context, request *LLMRequest) (*LLMResponse, error)
	GenerateImage(ctx context.Context, request *ImageGenerationRequest) (*GenerationResult, error)
	GetGenerationResult(ctx context.Context, generationID string) (*GenerationResult, error)
	CancelGeneration(ctx context.Context, generationID string) error
}
