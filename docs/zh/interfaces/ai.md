# AI Service 接口

本文档定义 AI Service 的生成用例接口和模型供应商适配接口。服务职责与系统边界参见[系统架构设计](../system-architecture-design.md)，相关 DTO 与协议类型参见[AI Service 数据结构](<../data structure/ai.md>)。

## 应用服务接口

AI 应用服务接口用于承载人物、场景、图块集、对象、UI 和动画等生成用例。

```go

type CharacterService interface {
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

当前接口仅覆盖人物、场景、图块集和对象生成。UI、动画及参考图生成接口仍需补充。应用服务接口应统一接收 `context.Context`，以支持超时、取消和请求追踪。

## 模型供应商适配接口

`LLMClient` 是 AI Service 调用外部模型能力的端口。具体供应商客户端在基础设施层实现该接口，业务服务不直接依赖供应商私有协议。

```go
type LLMClient interface {
Chat(ctx context.Context, request *LLMRequest) (*LLMResponse, error)
GenerateImage(ctx context.Context, request *ImageGenerationRequest) (*GenerationResult, error)
GetGenerationResult(ctx context.Context, generationID string) (*GenerationResult, error)
CancelGeneration(ctx context.Context, generationID string) error
}
```

供应商适配层负责：

- 将应用接口 DTO 转换为供应商请求
- 发起文本或图像生成任务
- 查询和取消异步生成任务
- 将供应商响应转换为统一结果
- 隔离不同模型供应商的协议差异
