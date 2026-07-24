# Asset Service 接口

本文档定义 Asset Service 当前状态管理、版本管理和对外接口约束。服务职责与系统边界参见[系统架构设计](../system-architecture-design.md)，相关类型参见[Asset Service 数据结构](<../data structure/asset.md>)。

## 应用服务接口

`AssetService` 提供资产当前状态的管理用例，`AssetRecordService` 提供资产版本管理用例。

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

当前接口已经覆盖创建、列表查询、详情查询、更新、快照创建、快照查询和版本恢复。删除、搜索、资产关联和标签管理等能力仍需在应用服务接口中补充。

## 对外接口

Asset Service 对外提供资产管理和Record两类接口。

资产管理接口包括创建、复制、查询、更新、删除、搜索、关联和标签管理；版本管理接口包括查询版本列表、获取版本详情和恢复指定版本。

具体协议、API 路径、分页规则、筛选参数及错误码将在对外 API 设计中定义。接口层不得允许调用方通过快照恢复操作修改资产 ID 或所属项目。
