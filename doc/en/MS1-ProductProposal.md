# MS1-Product Proposal

## One-Sentence Product Summary

This product is a **Project-centric**, all-in-one platform that leverages **natural language, asset references, and global constraints** to help 2D game developers easily generate stylistically consistent assets, and efficiently manage and reuse game assets.

---

## Problems We Solve

When using general-purpose AI image generation tools for game development, users commonly encounter the following issues:

1. A single generation result is disconnected from real game development workflows — you only get a single image, and cannot directly obtain animation frames, spritesheets, tilesets, or game engine objects.
2. Multiple assets within the same game project are generated independently, and the AI lacks project-level context, easily resulting in inconsistent art style, proportions, color palettes, and design specifications.
3. A single asset often requires multiple rounds of generation and modification, but general chat-based AI tools make it difficult to centrally manage conversations, historical records, and branching for that asset.
4. Characters, animations, weapons, sound effects, and environments are inherently related, yet these relationships are typically not recorded by the system, forcing users to repeatedly provide the same context.
5. When users need to batch-produce a set of interrelated assets, they must generate and edit each one individually, leading to low productivity.
6. Generated results still require manual cropping, frame extraction, file organization, and format conversion before they can be imported into engines such as Unity or Godot.
7. Music and sound effect creation has an even higher barrier than general image asset creation. While users without drawing skills can still express ideas through rough sketches, users with no musical knowledge typically find it very difficult to start creating BGM or sound effects on their own.
8. Some similar products are disconnected from development workflows and cannot be integrated into actual work processes. Generated results remain locked inside the tool — without an SDK or API to connect assets directly into game engines or code, developers still need to manually export, transfer, and configure assets, making automated integration impossible.

Therefore, the goal of this product is to build a one-stop 2D game asset creation and management platform that enables users to generate, edit, relate, manage, and deliver game assets within a unified project context.

---

## Target Users

The product targets **pixel art / character art enthusiasts, indie game developers, small game teams, and game prototype creators**. The distinction lies in **their intended use cases rather than their professional skill levels**.

- **Pixel art / character art enthusiasts** represent a relatively large user base but are not the core target audience. Their individual usage is relatively low, and their willingness to pay is limited. Their primary value is user acquisition and community exposure rather than direct monetization.
- **Indie game developers** can generally be divided into two groups:
  - Individuals or teams with no artistic capability at all, who require a more complete AI-powered solution.
  - Individuals or teams with limited art staff and low art team productivity, who need AI assistance to improve productivity. These users are offered a "vibe creating" / "AI assistant creating" solution integrated into the creative environments indie developers commonly use.
- **Game prototype creators** primarily target those who want to rapidly develop a game demo. During the demo phase, the speed of developing basic game functionality is clearly much faster than producing art assets. It is also possible that art teams may directly use AI to generate assets during the demo phase rather than spending effort on drawing. In essence, these needs largely overlap with the two categories of indie developers.

---

## Core Concepts & Information Architecture

### Project

To help users continuously generate, manage, and maintain assets for the same game, we introduce the concept of a **Project**. A Project typically corresponds to a game, a game demo, or a themed asset pack with a unified style, serving as the workspace for the entire asset production process.

A Project provides the following capabilities:

- **Unified AI Context**
  - When users first create a Project, they configure basic information such as game genre, art style, camera perspective, pixel resolution, and target platform, and can also upload reference images.
  - This information becomes the default AI context for the Project and is automatically referenced when generating Characters, UI, Tilesets, Objects, and other assets, reducing repetitive prompt input and maintaining stylistic consistency across the project as much as possible.

- **Centralized Asset Management**
  - Users can create, import, browse, and manage multiple Assets within a Project.
  - All Assets belong to a single Project, ensuring complete isolation between different games or asset packs.

- **Asset Relationship Management**
  - Projects maintain parent-child relationships, association relationships, and Tags between Assets.
  - During generation or modification, the system automatically selects appropriate contextual assets based on these relationships, improving the consistency of AI generation results.

- **Batch Operations**
  - Supports batch editing and batch exporting based on Asset type, Tags, or user selections. Users can complete unified adjustments across an entire asset collection without modifying each asset individually.

---

### Asset

To help users continuously iterate on and manage game assets, we introduce the concept of **Asset**. An Asset is the smallest resource management unit within a Project — each Asset corresponds to an independent resource in a game, such as a Character, Object, UI, Tileset, or Map.

Users can continuously complete the entire creation process around a single Asset, rather than generating a new isolated image each time.

An Asset provides the following capabilities:

- **Continuous Asset Iteration**
  - Users can repeatedly perform AI generation, partial repainting, and manual fine-tuning around the same Asset.
  - Every modification is retained within the current Asset rather than creating a new independent resource, making it easy for users to continuously refine the same asset.

- **Record Management**
  - Assets include built-in Record management. Each time a user uses AI generation, a new Record is automatically created.
  - Users can browse historical records, restore any previous record, or copy a new Asset from a historical record.

- **Asset Associations**
  - Assets support AI-automated parent-child relationships and association relationships.
  - For example, a character can be associated with animations, weapons, sound effects, and other assets. The system automatically references these related assets as context during generation or modification, improving the consistency of generated results.

- **Tag Classification**
  - Users can add one or more Tags to an Asset for classification, quick search, and batch modification.
  - The same Tag can be associated with multiple Assets, making it convenient to manage a group of assets with shared characteristics.

- **Asset Export**
  - Assets can be exported into formats such as PNG, GIF, Spritesheet, Tileset, and JSON depending on the asset type, and can also be further converted into resource formats required by game engines such as Unity or Godot, enabling users to use them out of the box.

---

### Record

To support continuous iteration and historical traceability of game assets, we introduce the concept of **Record**.

A Record is a persistent history entry for an Asset. Each time a user confirms a creation or edit operation, the system automatically creates a new Record that captures the complete state of the Asset at that moment, without overwriting any previous history.

A Record provides the following capabilities:

- **Automatic Saving**
  - Every creation or edit operation that requires user confirmation automatically generates a new Record, such as AI Generate, AI Edit, or confirmed manual edits.
  - Users do not need to save manually — the system automatically persists the history, allowing users to focus on asset creation.

- **Complete History**
  - Each Record stores a complete snapshot of the Asset at the time it was created.

- **Historical Rollback**
  - Users can revert to a previous historical record to recover from problems caused by incorrect operations.

---

### Relation

To help users organize and manage assets with business associations, we introduce the concept of **Relation**. Relation describes the association relationships between Assets, allowing related assets to be managed and displayed in a unified manner rather than existing independently.

Relations provide the following capabilities:

- **Parent-Child Relationship Management**
  - Some Assets depend on another Asset to have complete meaning, thus requiring parent-child relationships.
  - For example, a user first generates a Goblin character, then generates idle, walk, attack, and jump animations based on that character. These animations become child Assets of the Goblin, rather than independently existing resources.

- **Related Asset Display**
  - When viewing an Asset, users can directly browse all its associated resources without needing to search repeatedly through the asset library.
  - For example, when viewing a character, users can simultaneously view its animations, multi-directional sprites, sound effects, and other related assets, facilitating unified management and maintenance.

- **AI Context Referencing**
  - When users generate or modify an asset, the system can automatically reference related Assets as context based on Relations.
  - For example, when generating a character's attack animation, the system can automatically reference the corresponding character model, improving the consistency of generated results.

---

### SDK

Network games require assets such as images, audio, and animations to be hosted in object storage. The platform provides optimized built-in object storage services and packages a client SDK, allowing users to call assets directly in their code via the SDK — no need for "download assets → upload to own object bucket → configure access URLs".

The SDK provides the following capabilities:

- **Cross-Engine Support**
  - Provides native SDK packages for mainstream game engines such as Unity and Godot, enabling developers to call cloud assets just like local resources.
- **Asset Retrieval**
  - Provides convenient tooling to directly access platform assets without manual download.

---

### MCP

To seamlessly integrate platform assets into the game development workflow, we introduce the **MCP (Model Context Protocol)** interface. MCP enables AI agents to directly access the platform's Projects, Assets, and their derived resources, and to land generated results directly into users' game projects, eliminating the cumbersome "download → upload to own storage → manually configure" workflow.

MCP addresses two typical game development scenarios:

- **Network Game Scenario: SDK Information Retrieval**
  - Agents read the SDK's real-time documentation via MCP, automatically generating asset invocation code to achieve vibe coding — users only need to describe their requirements, and the agent handles the entire pipeline from asset retrieval to code integration.

- **Local Game Scenario: Direct Project Landing**
  - After users configure assets in the Web editor, agents use MCP to directly land resource files into the local project directory.
  - Automatically generates engine-specific scene files (such as Godot's .tscn files), including sprite nodes, animation frame references, and other configurations.

---

## Features

The first milestone focuses on completing the core business loop of the AI game asset generation platform, covering the entire workflow:

**Project Creation → Asset Generation & Management → Iteration → Batch Processing → Export**

### Feature 1: Web Application

Provide a browser-based asset management platform as the primary entry point for asset generation, management, and export.

---

### Feature 2: Quick Generate

Provide a simplified generation entry point. Users do not need to understand concepts like Projects or complex form data — they only need to provide a few required parameters and prompts to quickly create game assets.
Preserve the user's AI creation history, making it convenient for users to view their historical generation records.

---

### Feature 3: Project Management & Global Configuration

Provide Project creation and management capabilities, serving as the workspace for the entire game asset production process.

Supported operations:

- Create Project
- Edit Project
- Delete Project
- View Project

Configure unified AI context for the Project to improve asset generation consistency.

Supported configurations:

- Game genre
- Art style
- Camera perspective
- Pixel resolution
- Target platform
- Reference images

---

### Feature 4: Initial Asset Creation

Allow users to quickly create initial assets within a Project, providing a foundation for subsequent asset expansion.

Supported asset types:

- Character
- Object
- UI
- Tileset

---

### Feature 5: Asset Management

Provide full lifecycle management of assets.

Supported operations:

- Create Asset
- Edit Asset
- Delete Asset
- Search Assets
- View Asset Details
- Copy Asset

---

### Feature 6: Individual Asset Editing

Support AI-powered generation around a single Asset.

Capabilities include:

- Prompt modification
- Context referencing
- Edit history preservation
- Automatic Record creation

---

### Feature 7: Record Management

Track the complete evolution of every Asset, supporting continuous iteration.

Supported features:

- View Record history
- Restore historical Records
- View Record details

---

### Feature 8: Asset Relations

Establish business associations between Assets:

- Parent-Child relationships

---

### Feature 9: Tags

Support asset classification and batch management.

Capabilities include:

- Create Tags
- Assign Tags to Assets
- Search by Tag
- Batch operations via Tags

---

### Feature 10: Batch Creation

Support generating multiple assets at once, improving asset production efficiency.

Capabilities include:

- Batch generation by asset type
- Batch generation from prompts

---

### Feature 11: Batch Editing

Support editing multiple sub-Assets under a single Asset simultaneously.

---

### Feature 12: Asset Export

Support exporting assets into common formats.

Supported formats:

- PNG
- GIF
- Spritesheet
- JSON
- ZIP

---

### Feature 13: SDK

Provide a client SDK that encapsulates platform asset retrieval capabilities, enabling developers to call platform assets directly in game code without manual download and configuration.

Supported capabilities:

- Unity and Godot SDKs
- Asset loading

---

### Feature 14: MCP Capabilities

Provide MCP APIs that enable AI agents to access platform resources and generate deliverable files for seamless integration into users' game projects.

Supported capabilities:

- Read SDK real-time documentation
- Query Project information and Asset lists
- Search Assets within Projects
- Retrieve Asset details and related assets
- Download resource files to a specified directory
- Generate engine-specific scene files and resource configurations
