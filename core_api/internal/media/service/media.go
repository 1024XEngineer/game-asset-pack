package service

import (
	"context"

	"github.com/1024XEngineer/Holonic-Asset/internal/media/dto"
)

// ProjectPreviewUploadService creates presigned R2 upload targets for Project previews.
type ProjectPreviewUploadService interface {
	CreateProjectPreviewUploadTarget(
		ctx context.Context,
		request *dto.CreateProjectPreviewUploadRequest,
	) (*dto.ProjectPreviewUploadTarget, error)
}

// MediaService provides the Project preview upload application skeleton.
type MediaService struct{}

// NewMediaService creates the Media application service used by the HTTP handler.
func NewMediaService() *MediaService {
	return &MediaService{}
}

func (*MediaService) CreateProjectPreviewUploadTarget(
	context.Context,
	*dto.CreateProjectPreviewUploadRequest,
) (*dto.ProjectPreviewUploadTarget, error) {
	return &dto.ProjectPreviewUploadTarget{}, nil
}

var _ ProjectPreviewUploadService = (*MediaService)(nil)
