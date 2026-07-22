package handler

import (
	"github.com/labstack/echo/v4"

	"github.com/1024XEngineer/Holonic-Asset/internal/project/domain"
	"github.com/1024XEngineer/Holonic-Asset/internal/project/dto"
	"github.com/1024XEngineer/Holonic-Asset/internal/project/router"
	"github.com/1024XEngineer/Holonic-Asset/internal/project/service"
)

type ProjectHandler struct {
	service service.ProjectService
}

func NewProjectHandler(projectService service.ProjectService) *ProjectHandler {
	return &ProjectHandler{service: projectService}
}

func (h *ProjectHandler) Create(c echo.Context, request dto.CreateProjectRequest) (dto.CreateProjectResponse, error) {
	project := &domain.Project{
		UserID:         request.UserID,
		Name:           request.Name,
		GameType:       request.GameType,
		ViewType:       request.ViewType,
		TargetPlatform: request.TargetPlatform,
		Description:    request.Description,
		Reference:      request.Reference,
		Style:          request.Style,
	}
	err := h.service.Create(c.Request().Context(), project)
	return dto.CreateProjectResponse{}, err
}

func (h *ProjectHandler) ListByUID(c echo.Context, request dto.ListProjectsRequest) (dto.ListProjectsResponse, error) {
	_, err := h.service.ListByUID(c.Request().Context(), request.UserID)
	return dto.ListProjectsResponse{}, err
}

func (h *ProjectHandler) GetDetail(c echo.Context, request dto.ProjectDetailRequest) (dto.ProjectDetailResponse, error) {
	_, err := h.service.GetDetail(c.Request().Context(), request.ProjectID)
	return dto.ProjectDetailResponse{}, err
}

func (h *ProjectHandler) Update(c echo.Context, request dto.UpdateProjectRequest) (dto.UpdateProjectResponse, error) {
	project := &domain.Project{
		ID:             request.ProjectID,
		UserID:         request.UserID,
		Name:           request.Name,
		GameType:       request.GameType,
		ViewType:       request.ViewType,
		TargetPlatform: request.TargetPlatform,
		Description:    request.Description,
		Reference:      request.Reference,
		Style:          request.Style,
	}
	err := h.service.Update(c.Request().Context(), project)
	return dto.UpdateProjectResponse{}, err
}

func (h *ProjectHandler) Delete(c echo.Context, request dto.DeleteProjectRequest) (dto.DeleteProjectResponse, error) {
	err := h.service.Delete(c.Request().Context(), request.ProjectID)
	return dto.DeleteProjectResponse{}, err
}

var _ router.ProjectRouter = (*ProjectHandler)(nil)
