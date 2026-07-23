// Main entry point for the application
package main

import (
	"github.com/1024XEngineer/Holonic-Asset/internal"
	aihandler "github.com/1024XEngineer/Holonic-Asset/internal/ai/handler"
	aiservice "github.com/1024XEngineer/Holonic-Asset/internal/ai/service"
	mediahandler "github.com/1024XEngineer/Holonic-Asset/internal/media/handler"
	mediaservice "github.com/1024XEngineer/Holonic-Asset/internal/media/service"
	projecthandler "github.com/1024XEngineer/Holonic-Asset/internal/project/handler"
	projectrepository "github.com/1024XEngineer/Holonic-Asset/internal/project/repository"
	projectdao "github.com/1024XEngineer/Holonic-Asset/internal/project/repository/dao"
	projectservice "github.com/1024XEngineer/Holonic-Asset/internal/project/service"
)

func main() {
	projectDao := projectdao.NewMemoryProjectDao()
	projectRepository := projectrepository.NewProjectRepository(projectDao)
	projectService := projectservice.NewProjectService(projectRepository)
	projectHandler := projecthandler.NewProjectHandler(projectService)

	aiService := aiservice.NewAIService()
	aiHandler := aihandler.NewAIHandler(aiService)

	mediaService := mediaservice.NewMediaService()
	mediaHandler := mediahandler.NewMediaHandler(mediaService)

	e := internal.Register(nil, projectHandler, aiHandler, mediaHandler)
	e.Logger.Fatal(e.Start(":8080"))
}
