package router

import (
	"github.com/labstack/echo/v4"

	"github.com/1024XEngineer/Holonic-Asset/internal/task/dto"
	"github.com/1024XEngineer/Holonic-Asset/pkg/echox"
)

type TaskRouter interface {
	ListPendingTasks(x *echox.Context) (dto.ListPendingTasksResponse, error)
}

func RegisterRoutes(e *echo.Group, r TaskRouter) {
	project := e.Group("/projects")

	project.GET("/:project_id/tasks", echox.Wrap(r.ListPendingTasks))
}
