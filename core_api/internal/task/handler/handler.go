package handler

import (
	"github.com/1024XEngineer/Holonic-Asset/internal/task/dto"
	"github.com/1024XEngineer/Holonic-Asset/internal/task/service"
	"github.com/1024XEngineer/Holonic-Asset/pkg/echox"
)

type TaskHandler struct {
	service service.TaskService
}

func NewTaskHandler(s service.TaskService) *TaskHandler {
	return &TaskHandler{
		service: s,
	}
}

func (h *TaskHandler) ListPendingTasks(x *echox.Context) (dto.ListPendingTasksResponse, error) {
	_, err := h.service.ListByProjectID(x, 0)
	return dto.ListPendingTasksResponse{}, err
}
