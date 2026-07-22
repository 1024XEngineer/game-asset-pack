package data

import "encoding/json"

type Size struct {
	Width  uint `json:"width"`
	Height uint `json:"height"`
}

// GenerateCharacterRequest identifies the Character prototype to generate.
type GenerateCharacterRequest struct {
	AssetID         uint     `json:"assetId"`
	AssetResourceID uint     `json:"assetResourceId"`
	Prompt          string   `json:"prompt"`
	ReferenceURLs   []string `json:"referenceUrls,omitempty"`
}

type GenerateCharacterResponse struct {
	TaskID uint `json:"taskId"`
}

// EditCharacterRequest identifies the existing Character prototype to edit.
type EditCharacterRequest struct {
	AssetID         uint   `json:"assetId"`
	AssetResourceID uint   `json:"assetResourceId"`
	Prompt          string `json:"prompt"`
}

type EditCharacterResponse struct {
	TaskID uint `json:"taskId"`
}

// GenerateTileSetItemRequest identifies the TileSet Item to generate.
type GenerateTileSetItemRequest struct {
	AssetID         uint     `json:"assetId"`
	AssetResourceID uint     `json:"assetResourceId"`
	Prompt          string   `json:"prompt"`
	ReferenceURLs   []string `json:"referenceUrls,omitempty"`
}

type GenerateTileSetItemResponse struct {
	TaskID uint `json:"taskId"`
}

// EditTileSetItemRequest identifies the existing TileSet Item to edit.
type EditTileSetItemRequest struct {
	AssetID         uint   `json:"assetId"`
	AssetResourceID uint   `json:"assetResourceId"`
	Prompt          string `json:"prompt"`
}

type EditTileSetItemResponse struct {
	TaskID uint `json:"taskId"`
}

// EditUIComponentRequest identifies the existing UI component to edit.
type EditUIComponentRequest struct {
	AssetID         uint   `json:"assetId"`
	AssetResourceID uint   `json:"assetResourceId"`
	Prompt          string `json:"prompt"`
}

type EditUIComponentResponse struct {
	TaskID uint `json:"taskId"`
}

// EditFrameRequest identifies the existing animation frame to edit.
type EditFrameRequest struct {
	AssetID         uint   `json:"assetId"`
	AssetResourceID uint   `json:"assetResourceId"`
	Prompt          string `json:"prompt"`
}

type EditFrameResponse struct {
	TaskID uint `json:"taskId"`
}

// GenerateObjectRequest identifies the Object prototype to generate.
type GenerateObjectRequest struct {
	AssetID         uint     `json:"assetId"`
	AssetResourceID uint     `json:"assetResourceId"`
	Prompt          string   `json:"prompt"`
	ReferenceURLs   []string `json:"referenceUrls,omitempty"`
}

type GenerateObjectResponse struct {
	TaskID uint `json:"taskId"`
}

// EditObjectRequest identifies the existing Object prototype to edit.
type EditObjectRequest struct {
	AssetID         uint   `json:"assetId"`
	AssetResourceID uint   `json:"assetResourceId"`
	Prompt          string `json:"prompt"`
}

type EditObjectResponse struct {
	TaskID uint `json:"taskId"`
}

// GenerateProjectPreviewRequest identifies the Project used to build the preview context.
type GenerateProjectPreviewRequest struct {
	ProjectID uint   `json:"projectId"`
	Prompt    string `json:"prompt"`
}

type GenerateProjectPreviewResponse struct {
	TaskID uint `json:"taskId"`
}

// GenerateSceneryLayerRequest identifies the Scenery layer to generate.
type GenerateSceneryLayerRequest struct {
	AssetID         uint     `json:"assetId"`
	AssetResourceID uint     `json:"assetResourceId"`
	Prompt          string   `json:"prompt"`
	ReferenceURLs   []string `json:"referenceUrls,omitempty"`
}

type GenerateSceneryLayerResponse struct {
	TaskID uint `json:"taskId"`
}

// EditSceneryLayerRequest identifies the existing Scenery layer to edit.
type EditSceneryLayerRequest struct {
	AssetID         uint   `json:"assetId"`
	AssetResourceID uint   `json:"assetResourceId"`
	Prompt          string `json:"prompt"`
}

type EditSceneryLayerResponse struct {
	TaskID uint `json:"taskId"`
}

// GenerateAnimationRequest identifies the Animation and its first frame resource.
type GenerateAnimationRequest struct {
	AssetID                   uint   `json:"assetId"`
	AssetResourceID           uint   `json:"assetResourceId"`
	FirstFrameAssetResourceID uint   `json:"firstFrameAssetResourceId"`
	Prompt                    string `json:"prompt"`
	FrameCount                uint   `json:"frameCount"`
	KeepFirstFrame            bool   `json:"keepFirstFrame"`
}

type GenerateAnimationResponse struct {
	TaskID uint `json:"taskId"`
}

// GenerateUIRequest identifies the UI Asset and output resource to generate.
type GenerateUIRequest struct {
	AssetID         uint     `json:"assetId"`
	AssetResourceID uint     `json:"assetResourceId"`
	Prompt          string   `json:"prompt"`
	ReferenceURLs   []string `json:"referenceUrls,omitempty"`
}

type GenerateUIResponse struct {
	TaskID uint `json:"taskId"`
}

type MessageRole string

type ContentPartType string

const (
	MessageRoleSystem    MessageRole = "system"
	MessageRoleUser      MessageRole = "user"
	MessageRoleAssistant MessageRole = "assistant"
	MessageRoleTool      MessageRole = "tool"

	ContentPartText     ContentPartType = "text"
	ContentPartImageURL ContentPartType = "image_url"
)

type ContentPart struct {
	Type      ContentPartType `json:"type"`
	Text      string          `json:"text,omitempty"`
	URL       string          `json:"url,omitempty"`
	MediaType string          `json:"mediaType,omitempty"`
}

type LLMMessage struct {
	Role    MessageRole   `json:"role"`
	Content []ContentPart `json:"content"`
}

type LLMUsage struct {
	InputTokens  uint `json:"inputTokens"`
	OutputTokens uint `json:"outputTokens"`
	TotalTokens  uint `json:"totalTokens"`
}

type LLMRequest struct {
	RequestID      string          `json:"requestId"`
	Model          string          `json:"model"`
	Messages       []LLMMessage    `json:"messages"`
	ResponseFormat json.RawMessage `json:"responseFormat,omitempty"`
}

type LLMResponse struct {
	ID      string     `json:"id"`
	Model   string     `json:"model"`
	Message LLMMessage `json:"message"`
	Usage   LLMUsage   `json:"usage"`
}

type ImageGenerationRequest struct {
	RequestID     string   `json:"requestId"`
	Model         string   `json:"model"`
	Prompt        string   `json:"prompt"`
	ReferenceURLs []string `json:"referenceUrls,omitempty"`
	Size          Size     `json:"size"`
	Count         uint     `json:"count"`
}

type GenerationStatus string

const (
	GenerationStatusPending   GenerationStatus = "pending"
	GenerationStatusRunning   GenerationStatus = "running"
	GenerationStatusSucceeded GenerationStatus = "succeeded"
	GenerationStatusFailed    GenerationStatus = "failed"
	GenerationStatusCancelled GenerationStatus = "cancelled"
)

type GenerationResult struct {
	GenerationID string           `json:"generationId"`
	Status       GenerationStatus `json:"status"`
	OutputURLs   []string         `json:"outputUrls,omitempty"`
	ErrorMessage string           `json:"errorMessage,omitempty"`
}
