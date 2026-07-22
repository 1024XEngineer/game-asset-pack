package router

import (
	"github.com/labstack/echo/v4"

	"github.com/1024XEngineer/Holonic-Asset/internal/project/dto"
	"github.com/1024XEngineer/Holonic-Asset/pkg/echox"
)

type ProjectRouter interface {
	Create(c echo.Context, request dto.CreateProjectRequest) (dto.CreateProjectResponse, error)
	ListByUID(c echo.Context, request dto.ListProjectsRequest) (dto.ListProjectsResponse, error)
	GetDetail(c echo.Context, request dto.ProjectDetailRequest) (dto.ProjectDetailResponse, error)
	Update(c echo.Context, request dto.UpdateProjectRequest) (dto.UpdateProjectResponse, error)
	Delete(c echo.Context, request dto.DeleteProjectRequest) (dto.DeleteProjectResponse, error)
}

// RegisterRoutes registers all project HTTP routes.
func RegisterRoutes(e *echo.Group, r ProjectRouter) {
	project := e.Group("/project")
	project.POST("/create", echox.WrapReq(r.Create))
	project.GET("/list", echox.WrapReq(r.ListByUID))
	project.GET("/detail", echox.WrapReq(r.GetDetail))
	project.POST("/update", echox.WrapReq(r.Update))
	project.POST("/delete", echox.WrapReq(r.Delete))
}
