# System Architecture Design

## 1. Architecture Decision

The system uses a Service-Based Architecture with four runtime components:

| Component | Deployment shape | Core responsibility |
| --- | --- | --- |
| Frontend | Static SPA | Project, asset, editor, progress, and confirmation UI |
| Core API | Go modular monolith | Auth, business CRUD, orchestration, state persistence, SSE |
| AI Service | Python API/Worker | Prompts, LLM planning, model calls, AI image/audio processing |
| Asset Worker | Rust worker | Deterministic media processing, pixel normalization, export |

Project, Asset, Record, and Media modules live inside Core API; they are not separate processes. AI Service and Asset Worker do not write the business database or schedule each other.

### 1.1 Topology


![Holonic-Asset System Architecture](<../image/holonic-Asset System Architecture.png>)

### 1.2 Communication boundaries

- The browser only talks to Traefik; business HTTP requests enter Core API.
- Long-running work uses NATS JetStream, not Redis queues.
- Core API is the only orchestrator: it publishes Steps, receives results, updates state, and schedules dependent Steps.
- Binary media never goes through HTTP or NATS messages; services pass object references in S3.
- Core API owns business data. AI Service and Asset Worker keep only runtime state and the object-storage access they need.

## 2. Technology Selection

| Area | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Routing/server state/forms | TanStack Router, TanStack Query, TanStack Form |
| Client state/UI | Zustand, Tailwind CSS, shadcn/ui |
| Core API | Go, Echo, GORM, PostgreSQL |
| AI Service | Python, FastAPI, Pydantic |
| Asset Worker | Rust, Tokio |
| Jobs/events | NATS JetStream |
| Cache/session | Redis |
| Object storage | Replaceable S3 SDK |
| Gateway | Traefik |
| HTTP contract | OpenAPI 3.1 |
| Code generation | Hey API, oapi-codegen |
| Initial deployment | Docker Compose |

Not introduced: Next.js, SSR, React Server Components, LangChain, LangGraph, Kafka, Kubernetes, or Redis task queues.

## 3. Frontend

### 3.1 Responsibility

Frontend is a static SPA with no Node.js server. It handles forms, asset lists and details, pixel previews, editor interactions, task progress, and candidate confirmation.

### 3.2 State boundaries

- TanStack Router: routes, Asset type, pagination, search, Tag filters, current Record, and editor tab.
- TanStack Query: server state for Project, Asset, Record, jobs, and media resources.
- TanStack Form: create/edit forms, dynamic fields, async validation, arrays, and nested fields.
- Zustand: selected Sprite, canvas zoom, layer visibility, current frame, playback speed, local unsubmitted edits, and sidebar state.

Do not copy Query data into Zustand. State that belongs in the URL should stay out of Zustand.

### 3.3 OpenAPI and code generation

The only HTTP contract source is:

```text
contracts/openapi/openapi.yaml
```

```text
openapi.yaml
├── oapi-codegen → Go DTOs and server interfaces
└── Hey API → TypeScript SDK, Zod, and TanStack Query
```

Generated code lives in `generated` and is not edited manually. OpenAPI defines interface shape and basic validation; form grouping, widgets, previews, and complex interactions belong to frontend configuration and custom components.

## 4. Core API

### 4.1 Stack and modules

Core API uses Go, Echo, GORM, PostgreSQL, the NATS Go client, the AWS SDK for Go, goose, and OpenTelemetry.

| Module | Responsibility |
| --- | --- |
| `iam`, `workspace` | Login, sessions, permissions, and membership |
| `project` | Project lifecycle and project-level configuration |
| `asset`, `record` | Current asset state, resource dependencies, version snapshots, and restoration |
| `generation` | Generation requests, plans, Step state, retry, cancellation, and candidate confirmation |
| `media` | Upload sessions, object keys, media metadata, access control, and associations |
| `taxonomy` | Tags, asset associations, search, and filtering |
| `export` | Export jobs, specifications, and manifests; Asset Worker performs packaging |
| `outbox`, `event-consumer` | Reliable publication and idempotent consumption |

### 4.2 Persistence constraints

- Core API is the only business-data writer.
- GORM handles normal CRUD, relationship queries, transactions, and pagination; complex cases may use Raw SQL.
- Production does not use `AutoMigrate`; SQL migrations use goose.
- Keep OpenAPI DTOs, domain models, and GORM entities separate:

```text
OpenAPI DTO → Echo Handler → Application Service → Domain Model → GORM Entity
```

- Pass `context.Context` explicitly to all writes.
- Guard critical state transitions with the previous state to prevent duplicate processing from overwriting state.

### 4.3 Authoritative data structures

This document defines service boundaries only. It does not redefine entity fields. Use the local documents as the source of truth:

- [Project data structures](<data structure/project.md>) and [Project interfaces](interfaces/project.md)
- [Asset data structures](<data structure/asset.md>) and [Asset interfaces](interfaces/asset.md)

The current definitions are `Project`, `Asset`, `AssetResource`, `AssetSnapshot`, and `AssetRecord` in those documents. Replacement fields or new entity definitions from the attachment are not adopted here.

## 5. AI Service

### 5.1 Responsibility

AI Service handles:

- Project Context assembly and Prompt templates.
- LLM task decomposition with a constrained plan.
- Image/audio generation, AI editing, complex background removal, semantic segmentation, and mask generation.
- Provider adapters, model cost, and usage collection.

It does not handle Project/Asset CRUD, version creation, export packaging, ordinary crop/resize, or direct writes to the Core API business database.

### 5.2 Runtime modes

The same codebase provides API and Worker entry points:

```bash
python -m app api
python -m app worker
```

API mode exposes health/readiness, capability discovery, and administrative interfaces. Worker mode consumes JetStream jobs, calls providers, writes to S3, and publishes result events. Long-running work must not use FastAPI `BackgroundTasks`.

Provider adapters isolate vendor SDKs. Business code must not depend directly on a provider SDK. LangChain and LangGraph are not used; plans must be validated for allowed Step types, dependencies, budget, retry count, and access scope.

### 5.3 Data structures and interfaces

- [AI data structures](<data structure/ai.md>)
- [AI interfaces](interfaces/ai.md)

## 6. Asset Worker

### 6.1 Responsibility

Asset Worker uses Rust, Tokio, S3 SDKs, and media-processing libraries for deterministic operations:

- Image inspection, Alpha inspection, transparent-edge trimming, and color-key removal.
- Nearest-neighbor resize, pixel-grid alignment, binary Alpha, and PNG encoding.
- GIF/APNG, Spritesheet, TileSet, audio trim/speed change.
- ZIP, Manifest, hashing, format, and dimension validation.

It does not run LLMs, PyTorch, Diffusers, GPU segmentation models, or semantic models. AI Service handles complex backgrounds and semantic segmentation.

### 6.2 Pixel rules

Current support is limited to `render_style = pixel_art` and `alpha_mode = binary`:

- Final Alpha is only `0` or `255`.
- Resize uses nearest neighbor only; bilinear, bicubic, Lanczos, and automatic anti-aliasing are forbidden.
- Frame dimensions are integer pixels; Spritesheets use strict grid alignment.
- Raw results are retained; post-processing creates new media objects.
- Frames in one animation share Canvas, Pivot, and coordinate system.

## 7. Orchestration and Messaging

### 7.1 Orchestration flow

```text
Core API
→ publish Step job
→ AI Service / Asset Worker executes
→ publish result event
→ Core API updates state
→ Core API schedules dependent Step
```

AI Service cannot schedule Asset Worker, and Asset Worker cannot schedule AI Service.

GenerationRun states:

```text
pending → planning → planned → running → post_processing
→ waiting_confirmation → completed
```

Terminal states are `failed` and `cancelled`. Step states are `pending`, `ready`, `running`, `succeeded`, `failed`, `retry_wait`, `cancelled`, and `skipped`.

### 7.2 JetStream constraints

Streams: `JOBS`, `EVENTS`, and `DLQ`. Jobs use durable pull consumers, explicit acknowledgements, and WorkQueue retention.

Specific subject names, versions, and consumer-group settings will be added after the message contracts are defined.

Messages contain event ID, type/version, trace ID, business IDs, object references, and required parameters only. Do not send binary data, oversized Prompts, long-lived Presigned URLs, or provider keys.

Core API writes business state and an Outbox event in one database transaction, then publishes through an Outbox Publisher. Result events are consumed idempotently by event ID.

## 8. Object Storage, Cache, and Deployment

### 8.1 S3

All services use a replaceable S3 SDK. The database stores stable identifiers such as bucket, object key, and checksum, not provider public URLs. Object keys are server-generated:

```text
workspaces/{workspace_id}/projects/{project_id}/artifacts/{artifact_id}/{variant}.{extension}
```

Upload flow: Frontend requests an upload from Core API → receives a Presigned URL → uploads directly to S3 → reports completion → Core API validates the object and stores media metadata. Large files do not pass through Core API or Traefik.

### 8.2 Redis

Redis is limited to sessions, rate limiting, verification codes, short-lived cache, temporary upload state, and short-lived idempotency keys. Generation state, version data, media metadata, and reliable queues remain in PostgreSQL/NATS.

### 8.3 Initial deployment

Docker Compose deploys Frontend, Traefik, Core API, AI Service, Asset Worker, PostgreSQL, Redis, NATS JetStream, and an S3-compatible object store. A heavier orchestration platform requires a separate decision.
