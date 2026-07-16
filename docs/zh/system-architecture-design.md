# 系统架构设计

## 整体架构

本项目采用 Service-Based Architecture（SBA）,根据业务领域与功能划分为几个独立的服务，每个服务都有明确的职责边界，可以根据业务需求选择相应的技术栈。

原因：
- 相较于单体架构，本项目业务量较大，不同服务领域区分清晰且有多种技术栈的需求，SBA提供了更高的技术栈灵活性与更好的模块解耦。
- 相较于微服务架构，本项目不需要引入复杂的服务治理基础设施，服务拆分粒度也不需要过细，架构简单，更适合当前项目规模。

![alt text](/docs/image/system-architecture.png)


## 模块拆分

### 1. Project

#### 功能

- 创建项目
- 获取项目列表
- 获取项目详情
- 更新项目配置

#### 数据结构

```go
type GameType string
type ViewType string

const (
    GameTypeRPG GameType = "RPG"
    GameTypeACT GameType = "ACT"
    GameTypeSLG GameType = "SLG"
    GameTypeOther GameType = "Other"

    ViewTypeTopDown ViewType = "TopDown"
    ViewTypeSideView ViewType = "SideView"
    ViewTypeIsometric ViewType = "Isometric"
)

type Project struct {
    ID          uint
    Name        string
    GameType    GameType `json:"gameType"` // RPG、ACT、SLG 等
    ViewType    ViewType `json:"viewType"` // TopDown、SideView、Isometric 等
    Description string                       // 项目描述
    Reference   string                       // 基于项目描述由 AI 生成的参考图
    Style       string                       // 项目的美术风格
}
```

#### 服务

```go
type ProjectService interface {
    Create(ctx context.Context, project *Project) error
    // 根据用户 ID 获取项目列表
    ListByUid(ctx context.Context, uid uint) ([]*Project, error)
    // GetDetail 返回项目详情。
    GetDetail(ctx context.Context, id uint) (*Project, error)
    Update(ctx context.Context, project *Project) error
}
```

#### 输入与输出

### 2. Asset

#### 功能

- 创建或复制一个或多个 Asset
- 按类型、标签或名称查询 Asset
- 删除 Asset
- 获取 Asset 详情
- 搜索 Asset
- 建立 Asset 关联
- 添加标签
- 删除标签
- 更新标签

#### 数据结构

```go
package asset

import (
	"context"
	"encoding/json"
)

type AssetType string

const (
	AssetTypeCharacter AssetType = "character"
	AssetTypeTiles     AssetType = "Tiles"
	AssetTypeBGM       AssetType = "BGM"
	AssetTypeUI        AssetType = "UI"
	AssetTypeObject    AssetType = "object"
)

// Asset 存储所有资产类型共有的字段。
//
// Attributes 使用 JSON 存储资产类型特有的信息，例如：
//
//   - 画布信息
//   - 动画信息
//   - 音频元数据
//   - 原型信息
//
// 服务层需要校验 Attributes 是否为合法的 JSON 对象。
type Asset struct {
    ParentID    unit            `json:parentId`
	ID          uint            `json:"id"`
	ProjectID   uint            `json:"projectId"`
	Name        string          `json:"name"`
	Type        AssetType       `json:"type"`
	Description string          `json:"description"`
	ResultURL   string          `json:"resultUrl"`
	Tags        []string        `json:"tags"`
	Attributes  json.RawMessage `json:"attributes"`
}

// AssetResource 表示当前资产所依赖或引用的其他资产。
//
// 资源信息会保存在快照中，以确保历史版本能够保留当时的依赖关系。
type AssetResource struct {
	AssetID uint   `json:"assetId"`
	Name    string `json:"name"`
	URL     string `json:"url"`
}

// AssetSnapshot 表示资产在某个时间点的完整可编辑状态。
//
// ID 和 ProjectID 会被保留用于审计，但恢复快照时不得修改
// 当前资产的身份标识或所属项目。
type AssetSnapshot struct {
	Asset      Asset           `json:"asset"`
	Resources  []AssetResource `json:"resources,omitempty"`
	Attributes json.RawMessage `json:"attributes"`
}

// AssetRecord 表示一个不可变的资产历史版本。
//
// Snapshot 在数据库中以 JSON 格式存储。
// AssetSnapshot 定义了序列化和读取快照时所使用的文档结构。
type AssetRecord struct {
	ID           uint            `json:"id"`
	AssetVersion uint            `json:"assetVersion"`
	AssetID      uint            `json:"assetId"`
	Snapshot     json.RawMessage `json:"snapshot"`
}
```

#### 服务

```go
type AssetService interface {
	// Create 创建资产，并同时生成该资产的初始版本快照。
	Create(ctx context.Context, asset *Asset) error
	// ListByProjectID 返回指定项目下的所有资产。
	ListByProjectID(ctx context.Context, projectID uint) ([]*Asset, error)
	// GetDetail 返回指定资产的当前详细信息。
	GetDetail(ctx context.Context, id uint) (*Asset, error)
	// Update 更新资产，并在同一个事务中创建新的版本快照。
	Update(ctx context.Context, asset *Asset) error
}

type AssetRecordService interface {
	// CreateSnapshot 根据资产的当前状态创建快照。
	// 具体的 AssetVersion 由服务层自动计算和分配。
	CreateSnapshot(ctx context.Context, assetID uint) (*AssetRecord, error)
	// ListByAssetID 返回指定资产的所有快照记录，
	// 并按照 AssetVersion 从高到低排序。
	ListByAssetID(
		ctx context.Context,
		assetID uint,
	) ([]*AssetRecord, error)
	// GetDetail 返回指定资产快照记录的详细信息。
	GetDetail(ctx context.Context, recordID uint) (*AssetRecord, error)
	// Restore 使用指定快照恢复资产的可编辑状态。
	// 恢复操作会创建一个新的资产版本，不会覆盖或删除已有历史记录。
	Restore(ctx context.Context, assetID uint, recordID uint,
	) (*AssetRecord, error)
}
```

#### 输入与输出

### 3. AI

#### 功能

- 生成人物
- 生成 UI 元素
- 生成场景
- 生成对象
- 生成动画
- 生成参考图

#### 数据结构

```go
type Size struct {
    Width  int `json:"width"`
    Height int `json:"height"`
}

type CreateCharacterRequest struct {
    ProjectPrompt string        `json:"projectPrompt"` // 项目提示词
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
    ProjectPrompt string   `json:"projectPrompt"` // 项目提示词
    UserPrompt    string   `json:"user_prompt"`
    Type          string   `json:"type"`           // button、panel、hp_bar
    Size          Size     `json:"size"`
    Reference     []string `json:"reference"`
}

type CreateUIResponse struct {
    URL string `json:"url"`
}

type LayerResult struct {
    ID  uint   `json:"id"`  // 图层 ID
    Url string `json:"url"` // 生成图片的 URL
}

type CreateSceneRequest struct {
    ProjectPrompt string  `json:"projectPrompt"` // 项目提示词
    Style         string  `json:"style"`         // 场景风格
    Layers        []Layer `json:"layers"`        // 场景图层
}

type CreateSceneResponse struct {
    Layers []LayerResult `json:"layers"` // 每个图层的生成结果
}

type CreateTileSetRequest struct {
    ProjectPrompt string   `json:"projectPrompt"` // 项目提示词
    Prompt        string   `json:"prompt"`        // 图块集提示词
    Reference     []string `json:"reference"`     // 创建图块集所用的参考图
}

type CreateTileSetResponse struct {
    Url string `json:"url"` // 生成图块集图片的 URL
}

type CreateObjectRequest struct {
    UserPrompt    string   `json:"prompt"`        // 对象提示词
    ProjectPrompt string   `json:"projectPrompt"` // 项目提示词
    Derictions    int      `json:"derictions"`    // 对象方向数量，例如 1、4、8
    Reference     string   `json:"reference"`     // 创建对象所用的参考图
    Size          Size     `json:"size"`          // 对象尺寸，例如 "32X32"、"64X64"
    View          ViewType `json:"view"`          // 对象视角，例如 "TopDown"、"SideView"、"Isometric"
}

type CreateObjectResponse struct {
    Url string `json:"url"` // 生成对象图片的 URL
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

#### 服务

```go
type Character interface {
    CrreateCharacter(request *CreateCharacterRequest)
}

type MapService interface {
    CreateScene(request *CreateSceneRequest) (*CreateSceneResponse, error)
    CreateTileSet(request *CreateTileSetRequest) (*CreateTileSetResponse, error)
}

type ObjectService interface {
    CreateObject(request *CreateObjectRequest) (*CreateObjectResponse, error)
}
```

#### 消息结构

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

type LLMClient interface {
    Chat(ctx context.Context, request *LLMRequest) (*LLMResponse, error)
    GenerateImage(ctx context.Context, request *ImageGenerationRequest) (*GenerationResult, error)
    GetGenerationResult(ctx context.Context, generationID string) (*GenerationResult, error)
    CancelGeneration(ctx context.Context, generationID string) error
}
```

### 4. Gateway

#### 功能

Gateway 为前端和外部请求提供统一的系统入口。

其主要职责包括：

- 将请求转发到对应的后端服务
- 终止 TLS 连接
- 转发用户认证信息
- 处理跨域请求
- 限制请求体大小
- 实施请求限流
- 控制请求超时时间
- 记录访问日志和请求追踪信息

系统计划在初始阶段使用 Nginx 作为 Gateway 的实现方案。

网关不包含具体的业务逻辑，也不会直接访问各个服务的数据库。项目、资产和 AI 相关的业务操作均由对应的后端服务负责处理。

具体的请求路由、API 路径以及 API 版本管理策略，将在服务边界和对外接口确定后进一步设计。

#### 服务编排

Nginx 只负责请求转发和基础设施层面的通用功能。

涉及多个服务的业务流程不应由 Nginx 负责处理，而应由应用服务或独立的服务编排组件进行协调。
