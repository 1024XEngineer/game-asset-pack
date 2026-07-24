package service

import (
	"context"

	"github.com/1024XEngineer/Holonic-Asset/internal/task/domain"
	"github.com/1024XEngineer/Holonic-Asset/internal/task/repository"
)

type TaskService interface {
	Create(ctx context.Context, task *domain.Task) (uint, error)

	ListByProjectID(ctx context.Context, projectID uint) ([]domain.Task, error)

	GetDetail(ctx context.Context, taskID uint) (domain.Task, error)

	Transition(ctx context.Context, from, to domain.Status) error

	Cancel(ctx context.Context, taskID uint) error
}

type TaskServiceImpl struct {
	TaskRepository repository.TaskRepository
}

func NewTaskService(r repository.TaskRepository) *TaskServiceImpl {
	return &TaskServiceImpl{TaskRepository: r}
}

func (s *TaskServiceImpl) Create(ctx context.Context, task *domain.Task) (uint, error) {
	return s.TaskRepository.CreateWithOutbox(ctx, task)
}

func (s *TaskServiceImpl) ListByProjectID(ctx context.Context, projectID uint) ([]domain.Task, error) {
	_, err := s.TaskRepository.ListByProjectID(ctx, projectID)
	return []domain.Task{}, err
}

func (s *TaskServiceImpl) GetDetail(ctx context.Context, taskID uint) (domain.Task, error) {
	return domain.Task{}, nil
}

func (s *TaskServiceImpl) Transition(ctx context.Context, from, to domain.Status) error {
	return nil
}

func (s *TaskServiceImpl) Cancel(ctx context.Context, taskID uint) error {
	return nil
}
