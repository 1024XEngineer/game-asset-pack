package dao

import (
	"context"
	"errors"
	"sort"
	"sync"
)

var ErrProjectNotFound = errors.New("project not found")

type MemoryProjectDao struct {
	mu       sync.RWMutex
	nextID   uint
	projects map[uint]*Project
}

func NewMemoryProjectDao() *MemoryProjectDao {
	return &MemoryProjectDao{
		nextID:   1,
		projects: make(map[uint]*Project),
	}
}

func (d *MemoryProjectDao) CreateProject(ctx context.Context, project *Project) (uint, error) {
	if err := ctx.Err(); err != nil {
		return 0, err
	}

	d.mu.Lock()
	defer d.mu.Unlock()

	id := d.nextID
	d.nextID++

	stored := cloneProject(project)
	stored.ID = id
	d.projects[id] = stored
	return id, nil
}

func (d *MemoryProjectDao) FindByID(ctx context.Context, id uint) (*Project, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	d.mu.RLock()
	defer d.mu.RUnlock()

	project, ok := d.projects[id]
	if !ok {
		return nil, ErrProjectNotFound
	}
	return cloneProject(project), nil
}

func (d *MemoryProjectDao) FindByUserID(ctx context.Context, userID uint) ([]*Project, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	d.mu.RLock()
	defer d.mu.RUnlock()

	projects := make([]*Project, 0)
	for _, project := range d.projects {
		if project.UserID == userID {
			projects = append(projects, cloneProject(project))
		}
	}
	sort.Slice(projects, func(i, j int) bool {
		return projects[i].ID < projects[j].ID
	})
	return projects, nil
}

func (d *MemoryProjectDao) Update(ctx context.Context, project *Project) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	d.mu.Lock()
	defer d.mu.Unlock()

	if _, ok := d.projects[project.ID]; !ok {
		return ErrProjectNotFound
	}
	d.projects[project.ID] = cloneProject(project)
	return nil
}

func (d *MemoryProjectDao) Delete(ctx context.Context, id uint) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	d.mu.Lock()
	defer d.mu.Unlock()

	if _, ok := d.projects[id]; !ok {
		return ErrProjectNotFound
	}
	delete(d.projects, id)
	return nil
}

func cloneProject(project *Project) *Project {
	if project == nil {
		return &Project{}
	}
	cloned := *project
	return &cloned
}
