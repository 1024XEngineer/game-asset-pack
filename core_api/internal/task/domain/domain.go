package domain

type Task struct {
	ID          uint
	Uid         uint
	ProjectID   uint
	JobID       uint
	Name        string
	Description string
	Type        TaskType
	Status      Status
	Metadata    map[string]any
}
