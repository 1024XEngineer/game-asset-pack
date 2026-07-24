package service

import (
	"context"

	"github.com/1024XEngineer/Holonic-Asset/internal/ai/dto"
)

type CharacterService interface {
	GenerateCharacter(ctx context.Context, request *dto.GenerateCharacterRequest) (*dto.GenerateCharacterResponse, error)
}

type ProjectPreviewService interface {
	GenerateProjectPreview(
		ctx context.Context,
		request *dto.GenerateProjectPreviewRequest,
	) (*dto.GenerateProjectPreviewResponse, error)
}

type TileSetService interface {
	GenerateTileSetItem(ctx context.Context, request *dto.GenerateTileSetItemRequest) (*dto.GenerateTileSetItemResponse, error)
	EditTileSetItem(ctx context.Context, request *dto.EditTileSetItemRequest) (*dto.EditTileSetItemResponse, error)
}

type ObjectService interface {
	GenerateObject(ctx context.Context, request *dto.GenerateObjectRequest) (*dto.GenerateObjectResponse, error)
}

type SceneryService interface {
	GenerateSceneryLayer(
		ctx context.Context,
		request *dto.GenerateSceneryLayerRequest,
	) (*dto.GenerateSceneryLayerResponse, error)
	EditSceneryLayer(ctx context.Context, request *dto.EditSceneryLayerRequest) (*dto.EditSceneryLayerResponse, error)
}

type AnimationService interface {
	GenerateAnimation(ctx context.Context, request *dto.GenerateAnimationRequest) (*dto.GenerateAnimationResponse, error)
	EditFrame(ctx context.Context, request *dto.EditFrameRequest) (*dto.EditFrameResponse, error)
}

type UIService interface {
	GenerateUI(ctx context.Context, request *dto.GenerateUIRequest) (*dto.GenerateUIResponse, error)
	EditUIComponent(ctx context.Context, request *dto.EditUIComponentRequest) (*dto.EditUIComponentResponse, error)
}

type AIService interface {
	CharacterService
	ProjectPreviewService
	TileSetService
	ObjectService
	SceneryService
	AnimationService
	UIService
}

type aiService struct{}

func NewAIService() AIService {
	return &aiService{}
}

func (*aiService) GenerateCharacter(context.Context, *dto.GenerateCharacterRequest) (*dto.GenerateCharacterResponse, error) {
	return &dto.GenerateCharacterResponse{}, nil
}

func (*aiService) GenerateProjectPreview(
	context.Context,
	*dto.GenerateProjectPreviewRequest,
) (*dto.GenerateProjectPreviewResponse, error) {
	return &dto.GenerateProjectPreviewResponse{}, nil
}

func (*aiService) GenerateTileSetItem(context.Context, *dto.GenerateTileSetItemRequest) (*dto.GenerateTileSetItemResponse, error) {
	return &dto.GenerateTileSetItemResponse{}, nil
}

func (*aiService) EditTileSetItem(context.Context, *dto.EditTileSetItemRequest) (*dto.EditTileSetItemResponse, error) {
	return &dto.EditTileSetItemResponse{}, nil
}

func (*aiService) GenerateObject(context.Context, *dto.GenerateObjectRequest) (*dto.GenerateObjectResponse, error) {
	return &dto.GenerateObjectResponse{}, nil
}

func (*aiService) GenerateSceneryLayer(
	context.Context,
	*dto.GenerateSceneryLayerRequest,
) (*dto.GenerateSceneryLayerResponse, error) {
	return &dto.GenerateSceneryLayerResponse{}, nil
}

func (*aiService) EditSceneryLayer(context.Context, *dto.EditSceneryLayerRequest) (*dto.EditSceneryLayerResponse, error) {
	return &dto.EditSceneryLayerResponse{}, nil
}

func (*aiService) GenerateAnimation(context.Context, *dto.GenerateAnimationRequest) (*dto.GenerateAnimationResponse, error) {
	return &dto.GenerateAnimationResponse{}, nil
}

func (*aiService) EditFrame(context.Context, *dto.EditFrameRequest) (*dto.EditFrameResponse, error) {
	return &dto.EditFrameResponse{}, nil
}

func (*aiService) GenerateUI(context.Context, *dto.GenerateUIRequest) (*dto.GenerateUIResponse, error) {
	return &dto.GenerateUIResponse{}, nil
}

func (*aiService) EditUIComponent(context.Context, *dto.EditUIComponentRequest) (*dto.EditUIComponentResponse, error) {
	return &dto.EditUIComponentResponse{}, nil
}

var _ AIService = (*aiService)(nil)
