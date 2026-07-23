**Tech design for** [**Core API**](./core-api.md)

**File naming**

Paths under `docs/core_api` use lowercase `snake_case`. Directory names, Go contract filenames, and index filenames must not contain uppercase letters or spaces. Rename references in Go imports and Markdown links together with the target path.

**Modules**

**CoreAPI**

The CoreAPI module is the main module of the Core API. It contains the following sub-modules:

- AI: Coordination with AI services and management of AI generation requests.
- Project: Project lifecycle and project-level configuration management.
- Login: User authentication, sessions, and access control.
- Media: Media metadata, uploads, storage references, and associations.
- Asset: Management of the current editable state of assets, immutable versions, snapshots, and history restoration.
- Task: Long-running task orchestration, progress tracking, retries, and cancellation.
- Taxonomy: Tags, classifications, asset associations, search, and filtering.

**AI**

The AI module accepts AI-assisted generation and editing requests from clients and coordinates their execution with the external AI Service. It validates the referenced Project, Asset, and Media resources and submits long-running work through the Task module. Task progress, replay, cancellation, and state transitions remain owned by the Task module. The AI module does not run models directly or allow the AI Service to modify Core API business data.

The service interfaces, request and response models, task handoff rules, and error behavior are defined in the [AI module](./module/ai.go).

**Project**

The Project module manages the lifecycle and configuration of a project. It provides the ownership boundary for Assets, Media, Tasks, Records, and Taxonomy associations, and ensures that operations are scoped to the correct project and authorized user.

The project lifecycle operations, validation rules, resource relationships, and API contracts are defined in the [Project module](./module/project.go).

**Login**

The Login module handles user authentication, session creation, session renewal, logout, and access checks required by protected Core API operations. It establishes the authenticated identity used by downstream modules but does not own Project or Asset business rules.

The authentication flow, session contract, authorization requirements, and expected failure responses are defined in the [Login module API design](./module_Login.md).

**Media**

The Media module manages metadata and storage references for images, audio, and other binary resources. It coordinates upload sessions and validates completed uploads while keeping binary payloads outside the Core API and storing stable object-storage references instead of provider-specific public URLs.

The upload lifecycle, media metadata, storage-reference format, validation rules, and association APIs are defined in the [Media module API design](./module/media.go).

**Asset**

The Asset module owns both the current editable state and the immutable version history of every Asset. It manages the relationships between parent Assets, child Assets, and referenced resources, applies type-specific validation, and maintains historical snapshots for comparison and restoration.

Each Asset has exactly one editable state and zero or more immutable Records. A Record captures the Asset snapshot and referenced resources at a specific version without becoming another editable copy of the Asset.

The Asset CRUD operations, version creation rules, snapshot format, restoration behavior, type-specific attributes, parent-child rules, resource dependencies, and serialization contract are defined in the [Asset module](./module/asset.go) and [Asset data structure](<./data_structure/asset.go>).


**Task**

The Task module coordinates long-running generation, processing, and export work. It owns task and step state transitions, dependency scheduling, progress reporting, retry, cancellation, idempotent result handling, and communication with workers through the configured messaging infrastructure.

The task state machine, step dependencies, command and event contracts, retry behavior, and progress APIs are defined in the [Task module](./module/task.go) and [Task service interfaces](./interface/task_service.go).

**Taxonomy**

The Taxonomy module manages tags, classifications, and their associations with Assets and Projects. It provides consistent metadata for discovery and filtering while keeping taxonomy management separate from Asset content and editor-specific state.

The tag lifecycle, association rules, filtering behavior, normalization requirements, and query contracts are defined in the [Taxonomy module](./module/taxonomy.go).

**Key features' implementation**

**Authentication and Login**

This feature describes how credentials become an authenticated Core API session, how that session is renewed or revoked, and how protected endpoints resolve the current identity. See the complete flow and acceptance rules in [Authentication](./feature_Authentication.md).

**Project Management**

This feature covers project creation, updates, retrieval, deletion, and project-scoped authorization. See the end-to-end behavior in [ProjectManagement](./feature_ProjectManagement.md).

**Media Upload**

This feature defines the direct-to-object-storage upload flow, completion confirmation, media validation, and metadata persistence. See the request sequence and failure handling in [MediaUpload](./feature_MediaUpload.md).

**Asset Management**

This feature describes how users create and edit Assets, manage parent-child relationships, attach resources, and validate type-specific attributes. See the complete workflow in [AssetManagement](./feature_AssetManagement.md).

**Asset Versioning**

This feature defines when immutable Records are created, what an Asset snapshot contains, and how an earlier version is restored without changing Asset identity. See the versioning contract in [AssetVersioning](./feature_AssetVersioning.md).

**Task Orchestration**

This feature covers task planning, step scheduling, worker dispatch, progress updates, retry, cancellation, and idempotent result processing. See the state transitions and messaging flow in [TaskOrchestration](./feature_TaskOrchestration.md).

**AI Generation**

This feature describes how a user request is validated, enriched with project context, converted into Tasks, executed by the AI Service, and returned for confirmation. See the orchestration flow in [AIGeneration](./feature_AIGeneration.md).

**Taxonomy and Search**

This feature defines tag management, Asset associations, normalized filtering, and project-scoped search behavior. See the query and indexing requirements in [TaxonomyAndSearch](./feature_TaxonomyAndSearch.md).
