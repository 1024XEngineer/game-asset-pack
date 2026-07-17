# MS1-Product Proposal

## One-Sentence Product Summary

This product is a **Project-centric**, all-in-one platform that leverages **natural language, asset references, and global constraints** to help 2D game developers easily generate stylistically consistent pixel assets, and efficiently manage and reuse game assets.

---

## Target Users

The product targets **pixel art / character art enthusiasts, indie game developers, small game teams, and game prototype creators**. The distinction lies in **their intended use cases rather than their professional skill levels**.

- **Pixel art / character art enthusiasts** represent a relatively large user base but are not the core target audience. Their individual usage is relatively low, and their willingness to pay is limited. Their primary value is user acquisition and community exposure rather than direct monetization.
- **Indie game developers** can generally be divided into two groups:
  - Individuals or teams with no artistic capability at all, who require a more complete AI-powered solution.
  - Individuals or teams with limited art staff and low art team productivity, who need AI assistance to improve productivity. These users are offered a "vibe creating" / "AI assistant creating" solution integrated into the creative environments indie developers commonly use.
- **Game prototype creators** primarily target those who want to rapidly develop a game demo. During the demo phase, the speed of developing basic game functionality is clearly much faster than producing art assets. It is also possible that art teams may directly use AI to generate assets during the demo phase rather than spending effort on drawing. In essence, these needs largely overlap with the two categories of indie developers.

---

## Problems We Solve

When using general-purpose AI image generation tools for game development, users commonly encounter the following issues:

1. A single generation result is disconnected from real game development workflows — you only get a single image, and cannot directly obtain animation frames, spritesheets, tilesets, or game engine objects.
2. Multiple assets within the same game project are generated independently, and the AI lacks project-level context, easily resulting in inconsistent art style, proportions, color palettes, and design specifications.
3. A single asset often requires multiple rounds of generation and modification, but general chat-based AI tools make it difficult to centrally manage conversations, historical records, and branching for that asset.
4. Characters, animations, weapons, sound effects, and environments are inherently related, yet these relationships are typically not recorded by the system, forcing users to repeatedly provide the same context.
5. Generated results still require manual cropping, frame extraction, file organization, and format conversion before they can be imported into engines such as Unity or Godot.
6. Music and sound effect creation has an even higher barrier than general image asset creation. While users without drawing skills can still express ideas through rough sketches, users with no musical knowledge typically find it very difficult to start creating BGM or sound effects on their own.
7. Some similar products are disconnected from development workflows and cannot be integrated into actual work processes.

Therefore, the goal of this product is to build a pixel-art-oriented one-stop 2D game asset creation and management platform that enables users to generate, edit, relate, manage, and deliver game assets within a unified project context.

---

## Core Concepts & Information Architecture

### Project

To help users continuously generate, manage, and maintain assets for the same game, we introduce the concept of a **Project**. A Project typically corresponds to a game, a game demo, or a themed asset pack with a unified style, serving as the workspace for the entire asset production process.

There are three ways to create a Project: import an existing game, have a game idea, or have no game idea and create the simplest project. Currently, priority is given to implementing Project creation with a game idea.
Each Project includes:
- Project Name
- Game Type
- Visual Style
- Target Platform (e.g., PC, Web)
- Game Description
- Visual Direction

A large image (Visual Direction) is generated, which includes as many examples of Characters, UI, Background, Objects, and other Assets as possible to serve as a reference for subsequent asset generation. If unsatisfied, users can modify the prompt and regenerate, or upload their own image as a replacement.

A Project provides the following capabilities:

- **Unified AI Context**
  - The information provided by users when creating a Project becomes the default AI context for the Project and is automatically referenced when generating Characters, UI, Backgrounds, Objects, and other assets, reducing repetitive prompt input and maintaining stylistic consistency across the project as much as possible.

- **Centralized Asset Management**
  - Users can create, browse, and manage multiple Assets within a Project.
  - All Assets belong to a single Project, ensuring complete isolation between different games or asset packs.

---

### Asset

To help users continuously iterate on and manage game assets, we introduce the concept of **Asset**. An Asset is the smallest resource management unit within a Project — each Asset corresponds to an independent resource in a game, such as a Character, Object, UI, or Background.

#### Character

A Character represents all the information of a character, managing one or more protoTypes (prototype images) of that character, Animations generated from protoTypes, and sound effects attached to corresponding Animations.

A Character includes:
- Asset Name
- Creative brief (the user's specific description of this Character)
- Canvas size (the canvas size for the generated Character, e.g., 32×32px)
- Perspective (the user can choose Top-down, Side-on, or Isometric)
- Reference (reference images)
- Belongs to Project

After defining a Character, the AI generates a protoType for the user, which describes the Character's appearance information.
A protoType includes:
- Name
- Belongs to Character
- AI-generated image resource (currently presented as multi-directional sprites; the user is required to decide the Direction count)

Once satisfied, users can generate Animations attached to this Character based on the protoType. An Animation includes:
- Animation Name
- First Frame (the first frame of the Animation)
- Description (a specific description of the motion to generate; users can write their own or use our presets such as idle and then modify)
- Frame count (4–16 frames)
- AI-generated frame image resources
- Belongs to Character
A Character can have multiple Animations associated with it.

We support adding sound effects to Animations. A sound effect includes:
- Belongs to Character
- Animation (the corresponding animation)
- Description (sound effect description)
- AI-generated sound effect resource

#### Object

An Object represents a static or interactive object in a game. Similar to Character, it contains one or more protoTypes (prototype images), Animations generated from protoTypes, and sound effects attached to corresponding Animations.

#### UI

A UI Asset represents a set of UI components. In the first phase, we focus on the most basic static UI. The second phase will add different states (e.g., hover) to UI components, and the final phase will provide UI animation capabilities.
A UI includes:
- Asset Name
- Style (overall style description for this set of UI components)
- Reference (style reference images)
- Belongs to Project

A large composite image is presented to the user and then sliced. This image contains all Components. A Component represents a specific UI component (currently only the most basic single-state static UI component), and includes:
- Name
- Belongs to UI
- Size (the size specification of the Component)
- The sliced resource

#### Background

Background includes two specific Asset types: Scenery and Tiles.

##### Scenery

Scenery represents a scene displayed as multiple stacked layers, and includes:
- Asset Name
- Style (overall style description for this scene)
- Layer num (number of layers)
- Aspect ratio (e.g., 16:9)
- Reference (reference images)
![alt text](/doc/image/secenery-example.png)
- Belongs to Project

It manages a number of Layers corresponding to Layer num. A Layer includes:
- Name
- Description
- AI-generated resource

After generation, users can directly see the effect of multiple layers stacked together. If unsatisfied with certain layers, they can further modify specific layers.

##### TileSet

A TileSet represents a set of tile resources, and includes:
- Asset Name
- Description (description of this TileSet)
- Reference (reference images)
![alt text](/doc/image/tile-example.png)
- Belongs to Project

A large Tile Set image is provided to the user and sliced into individual Tiles. A Tile includes:
- Belongs to TileSet
- The sliced resource

#### Audio

Audio is distinct from animation-attached sound effects. Audio is an Asset type typically used for generating BGM, ambient sounds, and similar audio for games. It includes:
- Asset Name
- Style (music style; users can choose preset styles such as rock, or write their own prompts)
- Reference (audio reference)
- Length (duration)
- Belongs to Project

At this stage, only simple trimming and speed adjustment are supported. Track functionality will be introduced later for more flexible processing.

#### Asset provides the following general capabilities:

- **Continuous Asset Iteration**
  - Users can repeatedly perform AI generation, partial repainting, and manual fine-tuning around the same Asset.
  - Every modification is retained within the current Asset rather than creating a new independent resource, making it easy for users to continuously refine the same asset.

- **Record Management**
  - Assets include built-in Record management. Each time a user uses AI generation, a new Record is automatically created.
  - Users can browse historical records, restore any previous record, or copy a new Asset from a historical record.

- **Asset Associations**
  - Assets support AI-automated association relationships. The system automatically references these related assets as context during generation or modification, improving the consistency of generated results.

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

### Feature 8: Tags

Support asset classification and batch management.

Capabilities include:

- Create Tags
- Assign Tags to Assets
- Search by Tag
- Batch operations via Tags

---

### Feature 9: Batch Creation

Support generating multiple assets at once, improving asset production efficiency.

Capabilities include:

- Batch generation by asset type
- Batch generation from prompts

---

### Feature 10: Batch Editing

Support editing multiple sub-Assets under a single Asset simultaneously.

---

### Feature 11: Asset Export

Support exporting assets into common formats.

---

### Feature 12: SDK

Network games require assets such as images, audio, and animations to be hosted in object storage. The platform provides optimized built-in object storage services and packages a client SDK, allowing users to call assets directly in their code via the SDK — no need for "download assets → upload to own object bucket → configure access URLs".

Supported capabilities:

- JS SDK (npm install)
- Asset loading

---

### Feature 13: MCP Capabilities

To seamlessly integrate platform assets into the game development workflow, we introduce the **MCP (Model Context Protocol)** interface.

MCP addresses two typical game development scenarios:

- **Network Game Scenario: SDK Information Retrieval**
  - Agents read the SDK's real-time documentation via MCP, automatically generating asset invocation code to achieve vibe coding — users only need to describe their requirements, and the agent handles the entire pipeline from asset retrieval to code integration.

- **Local Game Scenario: Direct Project Landing**
  - After users configure assets in the Web editor, agents use MCP to directly land resource files into the local project directory.
  - Automatically generates engine-specific scene files (such as Godot's .tscn files), including sprite nodes, animation frame references, and other configurations.

Supported capabilities:

- Read SDK real-time documentation
- Query Project information and Asset lists
- Search Assets within Projects
- Retrieve Asset details and related assets
- Download resource files to a specified directory
- Generate engine-specific scene files and resource configurations
