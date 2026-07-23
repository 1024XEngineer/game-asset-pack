package router

import (
	"github.com/labstack/echo/v4"

	"github.com/1024XEngineer/Holonic-Asset/internal/ai/dto"
	"github.com/1024XEngineer/Holonic-Asset/pkg/echox"
)

type AIRouter interface {
	EditTileSetItem(*echox.Context, dto.EditTileSetItemRequest) (*dto.EditTileSetItemResponse, error)
	EditSceneryLayer(*echox.Context, dto.EditSceneryLayerRequest) (*dto.EditSceneryLayerResponse, error)
	EditFrame(*echox.Context, dto.EditFrameRequest) (*dto.EditFrameResponse, error)
	EditUIComponent(*echox.Context, dto.EditUIComponentRequest) (*dto.EditUIComponentResponse, error)
}

// RegisterRoutes registers all AI HTTP routes.
func RegisterRoutes(e *echo.Group, r AIRouter) {
	ai := e.Group("/ai")
	ai.POST("/tile-set/item/edit", echox.WrapReq(r.EditTileSetItem))
	ai.POST("/scenery/layer/edit", echox.WrapReq(r.EditSceneryLayer))
	ai.POST("/animation/frame/edit", echox.WrapReq(r.EditFrame))
	ai.POST("/ui/component/edit", echox.WrapReq(r.EditUIComponent))
}
