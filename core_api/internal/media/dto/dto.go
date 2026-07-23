package dto

// CreateProjectPreviewUploadRequest describes a Project preview that will be uploaded directly to R2.
type CreateProjectPreviewUploadRequest struct {
	ContentType string `json:"contentType"`
}

// ProjectPreviewUploadTarget contains the R2 object reference and temporary upload URL.
type ProjectPreviewUploadTarget struct {
	ObjectKey string `json:"objectKey"`
	UploadURL string `json:"uploadURL"`
}
