package provider

import (
	"context"
	"encoding/json"
)

type Size struct {
	Width  uint `json:"width"`
	Height uint `json:"height"`
}

type ImageGenerationInput struct {
	Prompt        string   `json:"prompt"`
	ReferenceURLs []string `json:"referenceUrls,omitempty"`
	Size          Size     `json:"size"`
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
	RequestID string `json:"requestId"`
	Model     string `json:"model"`
	ImageGenerationInput
}

type ImageEditRequest struct {
	RequestID  string   `json:"requestId"`
	Model      string   `json:"model"`
	Prompt     string   `json:"prompt"`
	TargetURLs []string `json:"targetUrls"`
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

// LLMClient defines the model provider port required by the AI module.
type LLMClient interface {
	Chat(ctx context.Context, request *LLMRequest) (*LLMResponse, error)
	GenerateImage(ctx context.Context, request *ImageGenerationRequest) (*GenerationResult, error)
	EditImage(ctx context.Context, request *ImageEditRequest) (*GenerationResult, error)
	GetGenerationResult(ctx context.Context, generationID string) (*GenerationResult, error)
	CancelGeneration(ctx context.Context, generationID string) error
}
