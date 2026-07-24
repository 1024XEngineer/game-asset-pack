package repository

import (
	"context"
	"encoding/json"
	"fmt"

	"gorm.io/datatypes"
	"gorm.io/gorm"

	"github.com/1024XEngineer/Holonic-Asset/internal/task/domain"
	"github.com/1024XEngineer/Holonic-Asset/internal/task/repository/dao"
)

type TaskRepository interface {
	CreateWithOutbox(ctx context.Context, task *domain.Task) (uint, error)

	ListByProjectID(ctx context.Context, projectID uint) ([]domain.Task, error)
	GetTaskByID(ctx context.Context, taskID uint) (*domain.Task, error)

	UpdateTaskStatus(ctx context.Context, taskID uint, status domain.Status) error

	FetchPendingOutbox(ctx context.Context, limit int) ([]*dao.Outbox, error)
	MarkOutboxPublished(ctx context.Context, outboxID uint, jobID int64) error
}

type TaskRepositoryImpl struct {
	DB        *gorm.DB
	TaskDao   dao.TaskDao
	OutboxDao dao.OutboxDao
}

func NewTaskRepository(db *gorm.DB) *TaskRepositoryImpl {
	return &TaskRepositoryImpl{
		DB:        db,
		TaskDao:   dao.NewTaskDao(db),
		OutboxDao: dao.NewOutboxDao(db),
	}
}

func (r *TaskRepositoryImpl) CreateWithOutbox(ctx context.Context, task *domain.Task) (uint, error) {
	task.Status = domain.StatusPending

	err := r.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		daoTask := &dao.Task{
			Uid:         task.Uid,
			ProjectID:   task.ProjectID,
			Name:        task.Name,
			Description: task.Description,
			Type:        string(task.Type),
			Status:      uint(task.Status),
			Metadata:    task.Metadata,
		}
		if err := tx.WithContext(ctx).Create(daoTask).Error; err != nil {
			return fmt.Errorf("repo: insert task: %w", err)
		}
		task.ID = daoTask.ID

		job := domain.BuildJob(task.Type, task.ID, task.ProjectID, task.Metadata)
		if job == nil {
			return fmt.Errorf("repo: unknown task type %q", task.Type)
		}

		payload, err := json.Marshal(job)
		if err != nil {
			return fmt.Errorf("repo: marshal job %s: %w", job.(interface{ Kind() string }).Kind(), err)
		}

		outbox := &dao.Outbox{
			TaskID:  task.ID,
			JobKind: job.(interface{ Kind() string }).Kind(),
			Payload: datatypes.JSON(payload),
			Status:  0,
		}
		if err := r.OutboxDao.Insert(ctx, tx, outbox); err != nil {
			return fmt.Errorf("repo: insert outbox for task %d: %w", task.ID, err)
		}

		return nil
	})
	if err != nil {
		return 0, err
	}
	return task.ID, nil
}

func (r *TaskRepositoryImpl) ListByProjectID(ctx context.Context, projectID uint) ([]domain.Task, error) {
	_, err := r.TaskDao.ListByProjectID(ctx, projectID)
	return []domain.Task{}, err
}

func (r *TaskRepositoryImpl) UpdateTaskStatus(ctx context.Context, taskID uint, status domain.Status) error {
	return r.TaskDao.UpdateStatus(ctx, taskID, uint(status))
}

func (r *TaskRepositoryImpl) GetTaskByID(ctx context.Context, taskID uint) (*domain.Task, error) {
	dt, err := r.TaskDao.GetDetail(ctx, taskID)
	if err != nil {
		return nil, fmt.Errorf("repo: get task %d: %w", taskID, err)
	}
	return &domain.Task{
		ID:          dt.ID,
		Uid:         dt.Uid,
		ProjectID:   dt.ProjectID,
		JobID:       dt.JobID,
		Name:        dt.Name,
		Description: dt.Description,
		Type:        domain.TaskType(dt.Type),
		Status:      domain.Status(dt.Status),
		Metadata:    dt.Metadata,
	}, nil
}

func (r *TaskRepositoryImpl) FetchPendingOutbox(ctx context.Context, limit int) ([]*dao.Outbox, error) {
	return r.OutboxDao.FetchPending(ctx, limit)
}

func (r *TaskRepositoryImpl) MarkOutboxPublished(ctx context.Context, outboxID uint, jobID int64) error {
	return r.OutboxDao.MarkPublished(ctx, outboxID, jobID)
}
