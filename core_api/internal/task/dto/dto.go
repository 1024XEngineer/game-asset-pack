package dto

import "github.com/1024XEngineer/Holonic-Asset/internal/task/domain"

type ListPendingTasksResponse struct {
	Tasks []domain.Task
}
