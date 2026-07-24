package dao

import (
	"context"
	"fmt"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Task struct {
	ID          uint
	Uid         uint
	ProjectID   uint
	JobID       uint
	Name        string
	Description string
	Type        string
	Status      uint
	Metadata    datatypes.JSONMap `gorm:"type:jsonb;default:'{}'"`
}

type TaskDao interface {
	Create(ctx context.Context, task *Task) error

	UpdateStatus(ctx context.Context, taskID uint, status uint) error

	ListByProjectID(ctx context.Context, projectID uint) ([]*Task, error)
	GetDetail(ctx context.Context, taskID uint) (*Task, error)
	Transition(ctx context.Context, from, to uint) error
	Cancel(ctx context.Context, taskID uint) error
}

type TaskDaoImpl struct {
	DB *gorm.DB
}

func NewTaskDao(db *gorm.DB) *TaskDaoImpl {
	return &TaskDaoImpl{DB: db}
}

func (d *TaskDaoImpl) Create(ctx context.Context, task *Task) error {
	return d.DB.WithContext(ctx).Create(task).Error
}

func (d *TaskDaoImpl) UpdateStatus(ctx context.Context, taskID uint, status uint) error {
	result := d.DB.WithContext(ctx).
		Model(&Task{}).
		Where("id = ?", taskID).
		Update("status", status)
	if result.Error != nil {
		return fmt.Errorf("dao: update status task %d: %w", taskID, result.Error)
	}
	return nil
}

func (d *TaskDaoImpl) ListByProjectID(ctx context.Context, projectID uint) ([]*Task, error) {
	return []*Task{}, nil
}

func (d *TaskDaoImpl) GetDetail(ctx context.Context, taskID uint) (*Task, error) {
	var task Task
	err := d.DB.WithContext(ctx).First(&task, taskID).Error
	if err != nil {
		return nil, fmt.Errorf("dao: get task %d: %w", taskID, err)
	}
	return &task, nil
}

func (d *TaskDaoImpl) Transition(ctx context.Context, from, to uint) error {
	return nil
}

func (d *TaskDaoImpl) Cancel(ctx context.Context, taskID uint) error {
	return nil
}
