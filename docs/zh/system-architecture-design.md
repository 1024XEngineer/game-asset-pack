# 系统架构设计

## 1. 架构结论

系统采用 Service-Based Architecture。运行时拆为四个主要组件：

| 组件 | 部署形态 | 核心职责 |
| --- | --- | --- |
| Frontend | 静态 SPA | 项目、资产、编辑器、任务进度、用户确认 |
| Core API | Go 模块化单体 | 鉴权、业务 CRUD、任务编排、状态持久化、SSE |
| AI Service | Python API/Worker | Prompt、LLM 规划、模型调用、AI 图像/音频处理 |
| Asset Worker | Rust Worker | 确定性媒体处理、像素规范化、导出 |

Project、Asset、Record、Media 等业务模块均位于 Core API 内，不拆成独立进程。AI Service 和 Asset Worker 不直接修改业务数据库，也不互相调度。

### 1.1 拓扑


![Holonic-Asset System Architecture](<../image/holonic-Asset System Architecture.png>)

### 1.2 通信边界

- 浏览器只访问 Traefik；业务 HTTP 请求进入 Core API。
- 长任务使用 NATS JetStream；不使用 Redis 任务队列。
- Core API 是唯一任务编排者：发布 Step、接收结果、更新状态、调度后继 Step。
- 图片、音频等二进制不进入 HTTP 或 NATS 消息；通过 S3 对象引用传递。
- Core API 持有业务数据；AI Service、Asset Worker 只持有自身运行状态和对象存储访问权限。

## 2. 技术选型

| 部分 | 技术 |
| --- | --- |
| Frontend | React、TypeScript、Vite |
| 路由/服务端状态/表单 | TanStack Router、TanStack Query、TanStack Form |
| 客户端状态/UI | Zustand、Tailwind CSS、shadcn/ui |
| Core API | Go、Echo、GORM、PostgreSQL |
| AI Service | Python、FastAPI、Pydantic |
| Asset Worker | Rust、Tokio |
| 任务与事件 | NATS JetStream |
| 缓存与会话 | Redis |
| 对象存储 | S3 SDK，可替换供应商 |
| 网关 | Traefik |
| HTTP 契约 | OpenAPI 3.1 |
| 代码生成 | Hey API、oapi-codegen |
| 首版部署 | Docker Compose |

当前不引入：Next.js、SSR、React Server Components、LangChain、LangGraph、Kafka、Kubernetes、Redis 任务队列。

## 3. Frontend

### 3.1 职责

Frontend 是静态 SPA，不运行 Node.js 服务端。负责表单、资产列表与详情、像素预览、编辑器交互、任务进度和候选结果确认。

### 3.2 状态边界

- TanStack Router：路由、Asset 类型、分页、搜索、Tag 筛选、当前 Record、编辑 Tab。
- TanStack Query：Project、Asset、Record、任务、媒体资源等服务端状态。
- TanStack Form：创建和编辑表单、动态字段、异步校验、数组和嵌套字段。
- Zustand：选中 Sprite、画布缩放、图层显示、当前帧、播放速度、未提交局部编辑、侧边栏等纯客户端状态。

Query 数据不复制到 Zustand；适合放入 URL 的状态不放入 Zustand。

### 3.3 OpenAPI 与代码生成

唯一 HTTP 契约来源：

```text
contracts/openapi/openapi.yaml
```

```text
openapi.yaml
├── oapi-codegen → Go DTO、Server Interface
└── Hey API → TypeScript SDK、Zod、TanStack Query
```

生成代码统一放入 `generated` 目录，禁止手动编辑。OpenAPI 负责接口结构和基础校验；表单分组、Widget、预览和复杂交互由前端配置及自定义组件负责。

## 4. Core API

### 4.1 技术栈与模块

Core API 使用 Go、Echo、GORM、PostgreSQL、NATS Go Client、AWS SDK for Go、goose、OpenTelemetry。

| 模块 | 职责 |
| --- | --- |
| `iam`、`workspace` | 登录、Session、权限、成员 |
| `project` | Project 生命周期和项目级配置 |
| `asset`、`record` | 资产当前状态、资源依赖、版本快照和历史恢复 |
| `generation` | 生成请求、任务计划、Step 状态、重试、取消、候选确认 |
| `media` | 上传会话、对象键、媒体元数据、访问权限和关联 |
| `taxonomy` | Tag、资产关联、搜索和筛选 |
| `export` | 创建导出任务、导出规格、Manifest；实际打包由 Asset Worker 执行 |
| `outbox`、`event-consumer` | 可靠发布和幂等消费 |

### 4.2 持久化约束

- Core API 是业务数据唯一写入方。
- GORM 负责常规 CRUD、关系查询、事务和分页；复杂查询可使用 Raw SQL。
- 生产环境不使用 `AutoMigrate`，SQL Migration 使用 goose。
- OpenAPI DTO、领域模型、GORM Entity 分离：

```text
OpenAPI DTO → Echo Handler → Application Service → Domain Model → GORM Entity
```

- 所有写操作显式传递 `context.Context`。
- 关键状态更新必须带原状态条件，避免重复消费覆盖状态。

### 4.3 数据结构权威来源

本文只定义服务边界，不重新定义实体字段。数据结构以本地文档为准：

- [Project 数据结构](<data structure/project.md>) 与 [Project 接口](interfaces/project.md)
- [Asset 数据结构](<data structure/asset.md>) 与 [Asset 接口](interfaces/asset.md)

上述文档中的 `Project`、`Asset`、`AssetResource`、`AssetSnapshot`、`AssetRecord` 是当前有效定义。附件中的替代字段或新实体定义不在本文采用。

## 5. AI Service

### 5.1 职责

AI Service 负责：

- 组装 Project Context 和 Prompt 模板。
- LLM 任务拆解，输出受约束的计划。
- 图像、音频、AI 编辑、复杂去背景、语义分割和 Mask 生成。
- Provider 适配、模型成本和用量采集。

AI Service 不负责 Project/Asset CRUD、版本创建、导出打包、普通裁剪缩放，也不直接写 Core API 业务数据库。

### 5.2 运行模式

同一代码库提供 API 和 Worker 入口：

```bash
python -m app api
python -m app worker
```

API 仅提供健康检查、就绪检查、能力查询和管理接口。Worker 消费 JetStream 任务、调用模型、写入 S3、发布结果事件。长任务不放入 FastAPI `BackgroundTasks`。

Provider 使用适配器隔离，业务代码不得直接依赖具体供应商 SDK。当前不引入 LangChain 或 LangGraph；计划必须经过 Step 类型、依赖、预算、重试次数和访问权限校验。

### 5.3 数据结构与接口

- [AI 数据结构](<data structure/ai.md>)
- [AI 接口](interfaces/ai.md)

## 6. Asset Worker

### 6.1 职责

Asset Worker 使用 Rust、Tokio、S3 SDK 和图像/音频处理库，只执行确定性操作：

- 图片检测、Alpha 检测、透明边缘裁剪、颜色去背景。
- 最近邻缩放、像素网格对齐、Alpha 二值化、PNG 编码。
- GIF/APNG、Spritesheet、TileSet、音频裁剪/倍速。
- ZIP、Manifest、哈希、格式和尺寸校验。

不运行 LLM、PyTorch、Diffusers、GPU 分割模型或语义模型。复杂背景和语义分割由 AI Service 处理。

### 6.2 像素规范

当前只支持 `render_style = pixel_art`、`alpha_mode = binary`：

- Alpha 最终只能是 `0` 或 `255`。
- 缩放只用最近邻；禁止双线性、双三次、Lanczos 和自动抗锯齿。
- 帧尺寸为整数像素；Spritesheet 严格网格对齐。
- 原始结果保留；后处理产生新媒体对象。
- 同一动画帧共享 Canvas、Pivot 和坐标系。

## 7. 任务编排与消息

### 7.1 编排流程

```text
Core API
→ 发布 Step 任务
→ AI Service / Asset Worker 执行
→ 发布结果事件
→ Core API 更新状态
→ Core API 调度后继 Step
```

AI Service 不能直接调度 Asset Worker；Asset Worker 不能直接调度 AI Service。

GenerationRun 状态：

```text
pending → planning → planned → running → post_processing
→ waiting_confirmation → completed
```

终态：`failed`、`cancelled`。Step 状态：`pending`、`ready`、`running`、`succeeded`、`failed`、`retry_wait`、`cancelled`、`skipped`。

### 7.2 JetStream 约束

Stream：`JOBS`、`EVENTS`、`DLQ`。任务使用 Durable Pull Consumer、Explicit Ack、WorkQueue 保留策略。

具体 subject 命名、版本和消费组配置，待消息契约确定后再补充。

消息只传事件 ID、类型/版本、追踪 ID、业务 ID、对象引用和必要参数；不传二进制、超大 Prompt、长期 Presigned URL 或 Provider 密钥。

Core API 在同一数据库事务内写入业务状态和 Outbox 事件，再由 Publisher 投递 JetStream。消费结果通过事件 ID 幂等处理。

## 8. 对象存储、缓存与部署

### 8.1 S3

所有服务使用可替换的 S3 SDK。数据库保存 bucket、object key、checksum 等稳定标识，不保存供应商公开 URL。Object key 由服务端生成：

```text
workspaces/{workspace_id}/projects/{project_id}/artifacts/{artifact_id}/{variant}.{extension}
```

上传流程：Frontend 向 Core API 申请上传 → 获得 Presigned URL → 直传 S3 → 通知完成 → Core API 校验对象并保存媒体元数据。大文件不经过 Core API 或 Traefik。

### 8.2 Redis

Redis 只用于 Session、限流、验证码、短期缓存、临时上传状态和短期幂等键。Generation 状态、版本数据、媒体元数据和可靠任务队列仍由 PostgreSQL/NATS 持有。

### 8.3 首版部署

Docker Compose 部署 Frontend、Traefik、Core API、AI Service、Asset Worker、PostgreSQL、Redis、NATS JetStream 和 S3 兼容对象存储。后续是否引入更重的编排平台另行决策。
