package internal

import (
	"github.com/labstack/echo/v4"

	ai "github.com/1024XEngineer/Holonic-Asset/internal/ai/router"
	asset "github.com/1024XEngineer/Holonic-Asset/internal/asset/router"
	media "github.com/1024XEngineer/Holonic-Asset/internal/media/router"
	project "github.com/1024XEngineer/Holonic-Asset/internal/project/router"
	taxonomy "github.com/1024XEngineer/Holonic-Asset/internal/taxonomy/router"
)

// Register assembles and returns all routes.
func Register(
	as asset.AssetRouter,
	pr project.ProjectRouter,
	ar ai.AIRouter,
	mr media.MediaRouter,
	tr taxonomy.TaxonomyRouter,
) *echo.Echo {
	e := echo.New()
	api := e.Group("/api/v1")
	if as != nil {
		asset.RegisterRoutes(api, as)
	}
	if pr != nil {
		project.RegisterRoutes(api, pr)
	}
	if ar != nil {
		ai.RegisterRoutes(api, ar)
	}
	if mr != nil {
		media.RegisterRoutes(api, mr)
	}
	if tr != nil {
		taxonomy.RegisterRoutes(api, tr)
	}

	return e
}
