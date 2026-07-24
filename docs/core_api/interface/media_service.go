package interfaces

import "context"

// MediaUploadService defines direct upload-target creation.
type MediaUploadService interface {
	// CreateUploadTarget creates a server-controlled object key and temporary upload target.
	CreateUploadTarget(
		ctx context.Context,
		request *CreateMediaUploadRequest,
	) (*ObjectUploadTarget, error)
}
