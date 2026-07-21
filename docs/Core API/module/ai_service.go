package module

import (
	"context"

	interfaces "../Interface"
)

// AIServiceModule describes the internal providers and public capabilities of the AI module.
type AIServiceModule interface {
	// RegisterProject provides the Project module dependency.
	RegisterProject(project ProjectModule)

	// RegisterCharacterService registers character generation capabilities.
	RegisterCharacterService(service interfaces.CharacterService)

	// RegisterSceneryService registers scenery layer generation capabilities.
	RegisterSceneryService(service interfaces.SceneryService)

	// RegisterTileSetService registers tile-set generation capabilities.
	RegisterTileSetService(service interfaces.TileSetService)

	// RegisterObjectService registers object generation capabilities.
	RegisterObjectService(service interfaces.ObjectService)

	// RegisterAnimationService registers animation generation capabilities.
	RegisterAnimationService(service interfaces.AnimationService)

	// RegisterUIService registers UI component generation capabilities.
	RegisterUIService(service interfaces.UIService)

	// RegisterGenerationService registers asynchronous generation lifecycle capabilities.
	RegisterGenerationService(service interfaces.GenerationService)

	// RegisterLLMClient registers the model-provider adapter.
	RegisterLLMClient(client interfaces.LLMClient)

	// CreateCharacter starts character generation.
	CreateCharacter(
		ctx context.Context,
		request *interfaces.CreateCharacterRequest,
	) (*interfaces.CreateCharacterResponse, error)

	// EditCharacter starts character editing.
	EditCharacter(
		ctx context.Context,
		request *interfaces.EditCharacterRequest,
	) (*interfaces.EditCharacterResponse, error)

	// CreateLayer starts scenery layer generation.
	CreateLayer(
		ctx context.Context,
		request *interfaces.CreateLayerRequest,
	) (*interfaces.CreateLayerResponse, error)

	// EditLayer starts scenery layer editing.
	EditLayer(
		ctx context.Context,
		request *interfaces.EditLayerRequest,
	) (*interfaces.EditLayerResponse, error)

	// CreateTileSet starts tile-set generation.
	CreateTileSet(
		ctx context.Context,
		request *interfaces.CreateTileSetRequest,
	) (*interfaces.CreateTileSetResponse, error)

	// EditTileSet starts tile-set editing.
	EditTileSet(
		ctx context.Context,
		request *interfaces.EditTileSetRequest,
	) (*interfaces.EditTileSetResponse, error)

	// CreateObject starts object generation.
	CreateObject(
		ctx context.Context,
		request *interfaces.CreateObjectRequest,
	) (*interfaces.CreateObjectResponse, error)

	// EditObject starts object editing.
	EditObject(
		ctx context.Context,
		request *interfaces.EditObjectRequest,
	) (*interfaces.EditObjectResponse, error)

	// CreateAnimation starts animation generation.
	CreateAnimation(
		ctx context.Context,
		request *interfaces.CreateAnimationRequest,
	) (*interfaces.CreateAnimationResponse, error)

	// EditFrame starts animation frame editing.
	EditFrame(
		ctx context.Context,
		request *interfaces.EditFrameRequest,
	) (*interfaces.EditFrameResponse, error)

	// CreateUI starts UI component generation.
	CreateUI(
		ctx context.Context,
		request *interfaces.CreateUIRequest,
	) (*interfaces.CreateUIResponse, error)

	// EditUIComponent starts UI component editing.
	EditUIComponent(
		ctx context.Context,
		request *interfaces.EditUIComponentRequest,
	) (*interfaces.EditUIComponentResponse, error)

	// GetGenerationProgress returns the current state of an asynchronous task.
	GetGenerationProgress(
		ctx context.Context,
		taskID uint,
	) (*interfaces.GenerationProgress, error)

	// CancelGeneration requests cancellation of an asynchronous task.
	CancelGeneration(ctx context.Context, taskID uint) error

	// ConfirmGenerationResult accepts a generated candidate result.
	ConfirmGenerationResult(
		ctx context.Context,
		request *interfaces.ConfirmGenerationResultRequest,
	) error
}
