# AI Service Interfaces

This document defines the AI Service generation use-case interfaces and model provider adapter interface. See the [system architecture design](../system-architecture-design.md) for responsibilities and boundaries, and the [AI Service data structures](<../data structure/ai.md>) for referenced DTOs and protocol types.

## Application Service Interfaces

The AI application service interfaces support generation use cases for characters, scenes, tile sets, objects, UI elements, and animations.

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

The current interfaces cover only character, scene, tile-set, and object generation. Interfaces for UI, animation, and reference-image generation still need to be added. Application service interfaces should consistently accept `context.Context` to support timeouts, cancellation, and request tracing.

## Model Provider Adapter Interface

`LLMClient` is the port through which the AI Service invokes external model capabilities. Concrete provider clients implement this interface in the infrastructure layer, while business services remain independent of provider-specific protocols.

```go
type LLMClient interface {
	Chat(ctx context.Context, request *LLMRequest) (*LLMResponse, error)
	GenerateImage(ctx context.Context, request *ImageGenerationRequest) (*GenerationResult, error)
	GetGenerationResult(ctx context.Context, generationID string) (*GenerationResult, error)
	CancelGeneration(ctx context.Context, generationID string) error
}
```

The provider adapter layer is responsible for:

- Converting application interface DTOs into provider requests
- Starting text or image generation tasks
- Querying and canceling asynchronous generation tasks
- Converting provider responses into unified results
- Isolating protocol differences between model providers
