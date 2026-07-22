package dao

import "context"

type Project struct {
	ID             uint `gorm:"primaryKey"`
	UserID         uint `gorm:"index"`
	Name           string
	GameType       string
	ViewType       string
	TargetPlatform string
	Description    string
	Reference      string
	Style          string
}

type ProjectDao interface {
	CreateProject(ctx context.Context, project *Project) (uint, error)
	FindByID(ctx context.Context, id uint) (*Project, error)
	FindByUserID(ctx context.Context, userID uint) ([]*Project, error)
	Update(ctx context.Context, project *Project) error
	Delete(ctx context.Context, id uint) error
}
