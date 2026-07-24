# AI Service Data Structures

This document defines the AI Service application DTOs and model provider interaction protocol. See the [system architecture design](../system-architecture-design.md) for responsibilities and boundaries, and the [AI Service interfaces](../interfaces/ai.md) for use-case and provider contracts.

## Application Interface Data Structures (DTOs)

Types such as `CreateCharacterRequest` and `CreateSceneRequest` describe the inputs and outputs of AI generation use cases. They are application interface DTOs, not domain entities with business identities and lifecycles.

```go
type Size struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type CreateCharacterRequest struct {
	ProjectPrompt string        `json:"projectPrompt"` // Project prompt
	UserPrompt    string        `json:"userPrompt"`
	Name          string        `json:"name"`
	Facing        string        `json:"facing"`
	Size          Size          `json:"size"`
	Reference     []string      `json:"reference"`
	Physics       PhysicsConfig `json:"physics"`
}

type CreateCharacterResponse struct {
	URL string `json:"url"`
}

type PhysicsConfig struct {
	Collision CollisionConfig `json:"collision"`
	Movement  MovementConfig  `json:"movement"`
	Gravity   GravityConfig   `json:"gravity"`
}

type CreateUIRequest struct {
	ProjectPrompt string   `json:"projectPrompt"` // Project prompt
	UserPrompt    string   `json:"user_prompt"`
	Type          string   `json:"type"` // button, panel, hp_bar
	Size          Size     `json:"size"`
	Reference     []string `json:"reference"`
}

type CreateUIResponse struct {
	URL string `json:"url"`
}

type LayerResult struct {
	ID  uint   `json:"id"`  // Layer ID
	Url string `json:"url"` // Generated image URL
}

type CreateSceneRequest struct {
	ProjectPrompt string  `json:"projectPrompt"` // Project prompt
	Style         string  `json:"style"`         // Scene style
	Layers        []Layer `json:"layers"`        // Scene layers
}

type CreateSceneResponse struct {
	Layers []LayerResult `json:"layers"` // Generation results for each layer
}

type CreateTileSetRequest struct {
	ProjectPrompt string   `json:"projectPrompt"` // Project prompt
	Prompt        string   `json:"prompt"`        // Tile-set prompt
	Reference     []string `json:"reference"`     // Reference images used to create the tile set
}

type CreateTileSetResponse struct {
	Url string `json:"url"` // Generated tile-set image URL
}

type CreateObjectRequest struct {
	UserPrompt    string   `json:"prompt"`        // Object prompt
	ProjectPrompt string   `json:"projectPrompt"` // Project prompt
	Derictions    int      `json:"derictions"`    // Number of object directions, such as 1, 4, or 8
	Reference     string   `json:"reference"`     // Reference image used to create the object
	Size          Size     `json:"size"`          // Object size, such as "32X32" or "64X64"
	View          ViewType `json:"view"`          // Object view, such as "TopDown", "SideView", or "Isometric"
}

type CreateObjectResponse struct {
	Url string `json:"url"` // Generated object image URL
}

type CreateAnimationRequest struct {
	ProjectPrompt  string `json:"projectPrompt"`
	UserPrompt     string `json:"userPrompt"`
	Name           string `json:"name"`
	FirstFrameURL  string `json:"firstFrameUrl"`
	Description    string `json:"description"`
	FrameCount     int    `json:"frameCount"`
	KeepFirstFrame bool   `json:"keepFirstFrame"`
}

type CreateAnimationResponse struct {
	URL string `json:"urls"`
}
```

DTOs express generation parameters and results and should not contain private protocols from specific model providers. Provider-specific parameters should be converted in the infrastructure adapter layer.

## Model Provider Protocol Data Structures

`LLMMessage`, `LLMRequest`, `LLMResponse`, and `ImageGenerationRequest` describe the unified messages, usage, requests, and responses exchanged between the AI Service and model providers. Provider-specific fields are converted in the infrastructure adapter layer and do not enter these shared types.

```go
type MessageRole string
type ContentPartType string

const (
	MessageRoleSystem    MessageRole = "system"
	MessageRoleUser      MessageRole = "user"
	MessageRoleAssistant MessageRole = "assistant"
	MessageRoleTool      MessageRole = "tool"

	ContentPartText     ContentPartType = "text"
	ContentPartImageURL ContentPartType = "image_url"
	ContentPartAudioURL ContentPartType = "audio_url"
	ContentPartMaskURL  ContentPartType = "mask_url"
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
	InputTokens  int `json:"inputTokens"`
	OutputTokens int `json:"outputTokens"`
	TotalTokens  int `json:"totalTokens"`
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
	RequestID  string   `json:"requestId"`
	Model      string   `json:"model"`
	Prompt     string   `json:"prompt"`
	References []string `json:"references,omitempty"`
	Size       Size     `json:"size"`
	Count      int      `json:"count"`
}
```
