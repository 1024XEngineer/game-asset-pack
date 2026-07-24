# AI Service 数据结构

本文档定义 AI Service 的应用接口 DTO 和模型供应商交互协议。服务职责与系统边界参见[系统架构设计](../system-architecture-design.md)，服务接口参见[AI Service 接口](../interfaces/ai.md)。

## 应用接口数据结构（DTO）

`CreateCharacterRequest`、`CreateSceneRequest` 等类型描述 AI 生成用例的输入与输出。它们是应用接口 DTO，不是具有业务身份和生命周期的领域实体。

```go

type Size struct {
Width int `json:"width"`
Height int `json:"height"`
}

type CreateCharacterRequest struct {
ProjectPrompt string `json:"projectPrompt"` // 项目提示词
UserPrompt string `json:"userPrompt"`
Name string `json:"name"`
Facing string `json:"facing"`
Size Size `json:"size"`
Reference []string `json:"reference"`
Physics PhysicsConfig `json:"physics"`
}

type CreateCharacterResponse struct {
URL string `json:"url"`
}

type PhysicsConfig struct {
Collision CollisionConfig `json:"collision"`
Movement MovementConfig `json:"movement"`
Gravity GravityConfig `json:"gravity"`
}

type CreateUIRequest struct {
ProjectPrompt string `json:"projectPrompt"` // 项目提示词
UserPrompt string `json:"user_prompt"`
Type string `json:"type"` // button、panel、hp_bar
Size Size `json:"size"`
Reference []string `json:"reference"`
}

type CreateUIResponse struct {
URL string `json:"url"`
}

type LayerResult struct {
ID uint `json:"id"` // 图层 ID
Url string `json:"url"` // 生成图片的 URL
}

type CreateSceneRequest struct {
ProjectPrompt string `json:"projectPrompt"` // 项目提示词
Style string `json:"style"` // 场景风格
Layers []Layer `json:"layers"` // 场景图层
}

type CreateSceneResponse struct {
Layers []LayerResult `json:"layers"` // 每个图层的生成结果
}

type CreateTileSetRequest struct {
ProjectPrompt string `json:"projectPrompt"` // 项目提示词
Prompt string `json:"prompt"` // 图块集提示词
Reference []string `json:"reference"` // 创建图块集所用的参考图
}

type CreateTileSetResponse struct {
Url string `json:"url"` // 生成图块集图片的 URL
}

type CreateObjectRequest struct {
UserPrompt string `json:"prompt"` // 对象提示词
ProjectPrompt string `json:"projectPrompt"` // 项目提示词
Derictions int `json:"derictions"` // 对象方向数量，例如 1、4、8
Reference string `json:"reference"` // 创建对象所用的参考图
Size Size `json:"size"` // 对象尺寸，例如 "32X32"、"64X64"
View ViewType `json:"view"` // 对象视角，例如 "TopDown"、"SideView"、"Isometric"
}

type CreateObjectResponse struct {
Url string `json:"url"` // 生成对象图片的 URL
}

type CreateAnimationRequest struct {
ProjectPrompt string `json:"projectPrompt"`
UserPrompt string `json:"userPrompt"`
Name string `json:"name"`
FirstFrameURL string `json:"firstFrameUrl"`
Description string `json:"description"`
FrameCount int `json:"frameCount"`
KeepFirstFrame bool `json:"keepFirstFrame"`
}

type CreateAnimationResponse struct {
URL string `json:"urls"`
}

```

DTO 负责表达生成参数和结果，不应包含具体模型供应商的私有协议。供应商参数应在基础设施适配层完成转换。

## 模型供应商协议数据结构

`LLMMessage`、`LLMRequest`、`LLMResponse` 和 `ImageGenerationRequest` 描述 AI Service 与模型供应商之间交换的统一消息、用量、请求和响应结构。供应商私有字段应在基础设施适配层转换，不进入这些通用类型。

```go
type MessageRole string
type ContentPartType string

const (
MessageRoleSystem MessageRole = "system"
MessageRoleUser MessageRole = "user"
MessageRoleAssistant MessageRole = "assistant"
MessageRoleTool MessageRole = "tool"
ContentPartText ContentPartType = "text"
ContentPartImageURL ContentPartType = "image_url"
ContentPartAudioURL ContentPartType = "audio_url"
ContentPartMaskURL ContentPartType = "mask_url"
)



type ContentPart struct {
Type ContentPartType `json:"type"`
Text string `json:"text,omitempty"`
URL string `json:"url,omitempty"`
MediaType string `json:"mediaType,omitempty"`
}



type LLMMessage struct {
Role MessageRole `json:"role"`
Content []ContentPart `json:"content"`
}



type LLMUsage struct {
InputTokens int `json:"inputTokens"`
OutputTokens int `json:"outputTokens"`
TotalTokens int `json:"totalTokens"`
}



type LLMRequest struct {
RequestID string `json:"requestId"`
Model string `json:"model"`
Messages []LLMMessage `json:"messages"`
ResponseFormat json.RawMessage `json:"responseFormat,omitempty"`
}



type LLMResponse struct {
ID string `json:"id"`
Model string `json:"model"`
Message LLMMessage `json:"message"`
Usage LLMUsage `json:"usage"`
}

type ImageGenerationRequest struct {
RequestID string `json:"requestId"`
Model string `json:"model"`
Prompt string `json:"prompt"`
References []string `json:"references,omitempty"`
Size Size `json:"size"`
Count int `json:"count"`
}
```
