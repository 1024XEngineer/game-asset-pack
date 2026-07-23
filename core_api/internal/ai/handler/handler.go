package handler

import (
	"github.com/1024XEngineer/Holonic-Asset/internal/ai/dto"
	"github.com/1024XEngineer/Holonic-Asset/internal/ai/router"
	"github.com/1024XEngineer/Holonic-Asset/internal/ai/service"
	"github.com/1024XEngineer/Holonic-Asset/pkg/echox"
)

type AIHandler struct {
	service service.AIService
}

func NewAIHandler(aiService service.AIService) *AIHandler {
	return &AIHandler{service: aiService}
}

func (h *AIHandler) EditTileSetItem(
	c *echox.Context,
	request dto.EditTileSetItemRequest,
) (*dto.EditTileSetItemResponse, error) {
	return h.service.EditTileSetItem(c, &request)
}

func (h *AIHandler) EditSceneryLayer(
	c *echox.Context,
	request dto.EditSceneryLayerRequest,
) (*dto.EditSceneryLayerResponse, error) {
	return h.service.EditSceneryLayer(c, &request)
}

func (h *AIHandler) EditFrame(
	c *echox.Context,
	request dto.EditFrameRequest,
) (*dto.EditFrameResponse, error) {
	return h.service.EditFrame(c, &request)
}

func (h *AIHandler) EditUIComponent(
	c *echox.Context,
	request dto.EditUIComponentRequest,
) (*dto.EditUIComponentResponse, error) {
	return h.service.EditUIComponent(c, &request)
}

var _ router.AIRouter = (*AIHandler)(nil)
