package internal

import (
	"github.com/labstack/echo/v4"

	asset "github.com/1024XEngineer/Holonic-Asset/internal/asset/router"
	project "github.com/1024XEngineer/Holonic-Asset/internal/project/router"
)

// Register assembles and returns all routes.
func Register(as asset.AssetRouter, pr project.ProjectRouter) *echo.Echo {
	e := echo.New()
	api := e.Group("/api/v1")
	if as != nil {
		asset.RegisterRoutes(api, as)
	}
	if pr != nil {
		project.RegisterRoutes(api, pr)
	}

	return e
}
