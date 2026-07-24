package handler

import (
	"github.com/labstack/echo/v4"

	"github.com/1024XEngineer/Holonic-Asset/internal/taxonomy/dto"
	"github.com/1024XEngineer/Holonic-Asset/internal/taxonomy/router"
	"github.com/1024XEngineer/Holonic-Asset/internal/taxonomy/service"
	"github.com/1024XEngineer/Holonic-Asset/pkg/echox"
)

type TaxonomyHandler struct {
	service service.AssetDiscoveryService
}

func NewTaxonomyHandler(assetDiscoveryService service.AssetDiscoveryService) *TaxonomyHandler {
	return &TaxonomyHandler{service: assetDiscoveryService}
}

func (h *TaxonomyHandler) SearchAssets(
	c *echox.Context,
	request dto.SearchAssetsRequest,
) (*dto.AssetSearchResult, error) {
	if request.ProjectID == 0 {
		return nil, echo.ErrBadRequest
	}
	return h.service.SearchAssets(c, &request)
}

var _ router.TaxonomyRouter = (*TaxonomyHandler)(nil)
