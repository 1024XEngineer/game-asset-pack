package service

import (
	"context"

	"github.com/1024XEngineer/Holonic-Asset/internal/project/domain"
	"github.com/1024XEngineer/Holonic-Asset/internal/project/repository"
)

// ProjectService defines the project lifecycle use cases.
type ProjectService interface {
	Create(ctx context.Context, project *domain.Project) error
	ListByUID(ctx context.Context, userID uint) ([]*domain.Project, error)
	GetDetail(ctx context.Context, projectID uint) (*domain.Project, error)
	Update(ctx context.Context, project *domain.Project) error
	Delete(ctx context.Context, projectID uint) error
}

type projectService struct {
	repository repository.ProjectRepository
}

func NewProjectService(projectRepository repository.ProjectRepository) ProjectService {
	return &projectService{repository: projectRepository}
}

func (s *projectService) Create(ctx context.Context, project *domain.Project) error {
	return s.repository.Insert(ctx, project)
}

func (s *projectService) ListByUID(ctx context.Context, userID uint) ([]*domain.Project, error) {
	return s.repository.FindByUserID(ctx, userID)
}

func (s *projectService) GetDetail(ctx context.Context, projectID uint) (*domain.Project, error) {
	return s.repository.FindByID(ctx, projectID)
}

func (s *projectService) Update(ctx context.Context, project *domain.Project) error {
	return s.repository.Save(ctx, project)
}

func (s *projectService) Delete(ctx context.Context, projectID uint) error {
	return s.repository.Remove(ctx, projectID)
}
