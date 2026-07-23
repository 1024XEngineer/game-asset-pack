package handler

import (
	"github.com/1024XEngineer/Holonic-Asset/internal/media/dto"
	"github.com/1024XEngineer/Holonic-Asset/internal/media/router"
	"github.com/1024XEngineer/Holonic-Asset/internal/media/service"
	"github.com/1024XEngineer/Holonic-Asset/pkg/echox"
)

type MediaHandler struct {
	service service.ProjectPreviewUploadService
}

func NewMediaHandler(projectPreviewUploadService service.ProjectPreviewUploadService) *MediaHandler {
	return &MediaHandler{service: projectPreviewUploadService}
}

func (h *MediaHandler) CreateProjectPreviewUploadTarget(
	c *echox.Context,
	request dto.CreateProjectPreviewUploadRequest,
) (*dto.ProjectPreviewUploadTarget, error) {
	return h.service.CreateProjectPreviewUploadTarget(c, &request)
}

var _ router.MediaRouter = (*MediaHandler)(nil)
