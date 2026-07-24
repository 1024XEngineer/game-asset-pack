# Project Service 接口

本文档定义 Project Service 的应用服务接口和对外接口约束。服务职责与系统边界参见[系统架构设计](../system-architecture-design.md)，相关类型参见[Project Service 数据结构](<../data structure/project.md>)。

## 应用服务接口

`ProjectService` 定义项目相关用例，是接口层调用 Project 业务能力的应用层入口。

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

## 对外接口

Project Service 对外提供以下业务能力：

- 创建项目
- 按用户查询项目列表
- 查询项目详情
- 更新项目配置

HTTP 路径、gRPC 方法、请求与响应 DTO、错误码及接口版本策略将在对外 API 设计中单独定义。接口层负责将外部 DTO 转换为应用服务所需的参数，不直接暴露领域对象或数据库模型。
