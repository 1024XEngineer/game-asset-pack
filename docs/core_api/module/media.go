package module

import (
	"context"

	interfaces "github.com/1024XEngineer/Holonic-Asset/docs/core_api/interface"
)

// MediaModule describes the public upload capability of the Media module.
type MediaModule interface {
	// RegisterProject provides project-scoped authorization and object-key context.
	RegisterProject(project ProjectModule)

	// RegisterMediaUploadService registers the Media upload application service.
	RegisterMediaUploadService(service interfaces.MediaUploadService)

	// CreateUploadTarget creates a server-controlled object key and temporary upload target.
	CreateUploadTarget(
		ctx context.Context,
		request *interfaces.CreateMediaUploadRequest,
	) (*interfaces.ObjectUploadTarget, error)
}
