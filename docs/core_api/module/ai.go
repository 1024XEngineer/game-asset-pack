package module

import (
	"context"

	data "github.com/1024XEngineer/Holonic-Asset/docs/core_api/data_structure"
	interfaces "github.com/1024XEngineer/Holonic-Asset/docs/core_api/interface"
)

// AIServiceModule describes the internal providers and public capabilities of the AI module.
type AIServiceModule interface {
	// RegisterProject provides Project context for preview and Asset generation.
	RegisterProject(project ProjectModule)

	// RegisterAsset provides Asset ownership and generation context.
	RegisterAsset(asset AssetModule)

	// RegisterAssetResource provides AssetResource lookup and validation context.
	RegisterAssetResource(assetResource AssetResourceModule)

	// RegisterTask provides long-running generation orchestration.
	RegisterTask(task TaskModule)

	RegisterCharacterService(service interfaces.CharacterService)
	RegisterProjectPreviewService(service interfaces.ProjectPreviewService)
	RegisterTileSetService(service interfaces.TileSetService)
	RegisterObjectService(service interfaces.ObjectService)
	RegisterSceneryService(service interfaces.SceneryService)
	RegisterAnimationService(service interfaces.AnimationService)
	RegisterUIService(service interfaces.UIService)
	RegisterLLMClient(client interfaces.LLMClient)

	GenerateCharacter(
		ctx context.Context,
		request *data.GenerateCharacterRequest,
	) (*data.GenerateCharacterResponse, error)

	EditCharacter(
		ctx context.Context,
		request *data.EditCharacterRequest,
	) (*data.EditCharacterResponse, error)

	GenerateProjectPreview(
		ctx context.Context,
		request *data.GenerateProjectPreviewRequest,
	) (*data.GenerateProjectPreviewResponse, error)

	GenerateTileSetItem(
		ctx context.Context,
		request *data.GenerateTileSetItemRequest,
	) (*data.GenerateTileSetItemResponse, error)

	EditTileSetItem(
		ctx context.Context,
		request *data.EditTileSetItemRequest,
	) (*data.EditTileSetItemResponse, error)

	EditUIComponent(
		ctx context.Context,
		request *data.EditUIComponentRequest,
	) (*data.EditUIComponentResponse, error)

	EditFrame(
		ctx context.Context,
		request *data.EditFrameRequest,
	) (*data.EditFrameResponse, error)

	GenerateObject(
		ctx context.Context,
		request *data.GenerateObjectRequest,
	) (*data.GenerateObjectResponse, error)

	EditObject(
		ctx context.Context,
		request *data.EditObjectRequest,
	) (*data.EditObjectResponse, error)

	GenerateSceneryLayer(
		ctx context.Context,
		request *data.GenerateSceneryLayerRequest,
	) (*data.GenerateSceneryLayerResponse, error)

	EditSceneryLayer(
		ctx context.Context,
		request *data.EditSceneryLayerRequest,
	) (*data.EditSceneryLayerResponse, error)

	GenerateAnimation(
		ctx context.Context,
		request *data.GenerateAnimationRequest,
	) (*data.GenerateAnimationResponse, error)

	GenerateUI(
		ctx context.Context,
		request *data.GenerateUIRequest,
	) (*data.GenerateUIResponse, error)
}
