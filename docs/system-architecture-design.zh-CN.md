# 系统架构设计

## 整体架构

系统采用微服务架构。User、Project 与 AI 等模块被拆分为独立服务，并统一通过 Gateway 入口访问。

```mermaid
flowchart TB
    client[客户端] --> gateway

    subgraph services[服务边界]
        gateway[网关]
        gateway --> server1((服务 1))
        gateway --> server2((服务 2))
        gateway --> server3((服务 3))
    end
```

原始架构图将后端服务泛称为 `server1`、`server2` 与 `server3`，未定义这些服务与业务模块之间的一对一映射关系。

## 模块拆分

### 1. Project

#### 功能

- 创建项目
- 获取项目列表
- 获取项目详情
- 更新项目配置

#### 接口

````go
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

type ProjectService interface {
    Create(ctx context.Context, project *Project) error
    // 根据用户 ID 获取项目列表
    ListByUid(ctx context.Context, uid uint) ([]*Project, error)
    // GetDetail 返回项目详情。
    GetDetail(ctx context.Context, id uint) (*Project, error)
    Update(ctx context.Context, project *Project) error
}
````

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

#### 接口
```
```

### 3. AI

#### 功能

- 生成人物
- 生成 UI 元素
- 生成场景
- 生成对象
- 生成动画
- 生成参考图

#### 接口

````go
type Size struct {
    Width  int `json:"width"`
    Height int `json:"height"`
}

type CharacterGenerationRequest struct {
    ProjectPrompt string        `json:"projectPrompt"` // 项目提示词
    UserPrompt    string        `json:"userPrompt"`
    Name          string        `json:"name"`
    Facing        string        `json:"facing"`
    Size          Size          `json:"size"`
    Reference     []string      `json:"reference"`
    Physics       PhysicsConfig `json:"physics"`
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

type MapService interface {
    CreateScene(request *CreateSceneRequest) (*CreateSceneResponse, error)
    CreateTileSet(request *CreateTileSetRequest) (*CreateTileSetResponse, error)
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

type ObjectService interface {
    CreateObject(request *CreateObjectRequest) (*CreateObjectResponse, error)
}
````

### 4. Gateway

#### 功能

Gateway 串联各个服务，简化服务调用，并向前端暴露统一接口。
