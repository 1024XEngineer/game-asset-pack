# Asset Service 数据结构

本文档定义 Asset Service 的当前状态、资源依赖和版本快照模型。服务职责与系统边界参见[系统架构设计](../system-architecture-design.md)，服务接口参见[Asset Service 接口](../interfaces/asset.md)。

## 数据结构与领域模型

Asset 领域包含以下核心模型：

- `Asset`：资产当前可编辑状态
- `AssetResource`：资产依赖或引用的其他资源
- `AssetSnapshot`：资产在特定时间点的完整状态
- `AssetRecord`：不可变的资产历史版本
- `AssetType`：资产类型值对象

这些 Go 类型是 Asset 领域模型的代码表示。`AssetRecord` 与 `AssetSnapshot` 属于 Asset 领域内部的版本管理模型，不作为独立系统服务。
```go
type AssetType string

const (

AssetTypeCharacter AssetType = "character"

AssetTypeTileSet AssetType = "tileSet"

AssetTypeAudio AssetType = "audio"

AssetTypeUI AssetType = "UI"

AssetTypeObject AssetType = "object"

AssetTypeScenery AssetType = "scenery"

)

// Asset 存储所有资产类型共有的字段。
// Attributes 使用 JSON 存储资产类型特有的信息，例如：
// - 画布信息
// - 动画信息
// - 音频元数据
// - 原型信息
// 服务层需要校验 Attributes 是否为合法的 JSON 对象。

type Asset struct {

ParentID unit `json:parentId`

ID uint `json:"id"`

ProjectID uint `json:"projectId"`

Name string `json:"name"`

Type AssetType `json:"type"`

Description string `json:"description"`

ResultURL string `json:"resultUrl"`

Tags []string `json:"tags"`

Attributes json.RawMessage `json:"attributes"`

}

// AssetResource 表示当前资产所依赖或引用的其他资产。
// 资源信息会保存在快照中，以确保历史版本能够保留当时的依赖关系。

type AssetResource struct {

AssetID uint `json:"assetId"`

Name string `json:"name"`

URL string `json:"url"`

}

// AssetSnapshot 表示资产在某个时间点的完整可编辑状态。

// ID 和 ProjectID 会被保留用于审计，但恢复快照时不得修改

// 当前资产的身份标识或所属项目。

type AssetSnapshot struct {

Asset Asset `json:"asset"`

Resources []AssetResource `json:"resources,omitempty"`

Attributes json.RawMessage `json:"attributes"`

}

// AssetRecord 表示一个不可变的资产历史版本。
// Snapshot 在数据库中以 JSON 格式存储。
// AssetSnapshot 定义了序列化和读取快照时所使用的文档结构。

type AssetRecord struct {
ID uint `json:"id"`
AssetVersion uint `json:"assetVersion"`
AssetID uint `json:"assetId"`
Snapshot json.RawMessage `json:"snapshot"`

}

```
