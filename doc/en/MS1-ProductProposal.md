# MS1 Product Proposal

## One-Sentence Product Summary

This product is a **Project-centric** platform that leverages **natural language, asset references, and global context** to help 2D game developers generate stylistically consistent assets, efficiently manage and reuse game resources throughout the entire production workflow.

---

# Problems We Solve

When using general-purpose AI image generation tools for game development, users commonly encounter the following issues:

1. AI typically generates only a single image, which is disconnected from real game development workflows. It cannot directly produce animation frames, spritesheets, tilesets, or engine-ready assets.
2. Assets generated independently within the same game project often lack visual consistency because the AI has no project-level context, resulting in inconsistent art style, proportions, color palettes, and design language.
3. A single asset usually requires multiple rounds of iteration, but general chat-based AI tools make it difficult to organize conversations, version history, and branching for that asset.
4. Characters, animations, weapons, sound effects, and environments are inherently related, yet these relationships are not recorded by existing tools, forcing users to repeatedly provide the same context.
5. When users need to create an entire set of related assets, they must generate and edit each one individually, leading to poor productivity.
6. Generated assets still require manual cropping, frame extraction, file organization, and format conversion before they can be imported into engines such as Unity or Godot.
7. Music and sound effect creation has an even higher barrier than visual asset creation. While users without drawing skills can often communicate ideas through rough sketches, users without music knowledge usually have no effective starting point for creating BGM or sound effects.

Therefore, the goal of this product is to build an all-in-one 2D game asset creation and management platform that enables users to generate, edit, relate, manage, and export assets within a unified project context.

---

# Target Users

The product targets **pixel art enthusiasts, character art enthusiasts, indie game developers, small game studios, and rapid game prototype creators**. The distinction lies in **their intended use cases rather than their professional skill levels**.

* **Pixel art / character art enthusiasts** represent the largest user base but are not the primary target audience. Their individual usage is relatively low, and their willingness to pay is limited. Their primary value is user acquisition and community exposure rather than direct monetization.
* **Indie game developers** can generally be divided into two groups:

  * Individuals or teams with little or no artistic capability who require a more complete AI-powered solution.
  * Developers with limited art resources who use AI as a productivity assistant ("vibe creating" / "AI-assisted creating") integrated into their existing game development workflow.
* **Game prototype creators** primarily need to produce playable demos quickly. During prototyping, programming speed often exceeds art production speed, making AI-generated assets an efficient solution. In practice, these needs largely overlap with those of indie developers.

---

# Core Concepts & Information Architecture

## Project

To help users continuously create, manage, and maintain assets for the same game, we introduce the concept of a **Project**.

A Project typically represents a game, a game prototype, or a themed asset pack, serving as the central workspace for the entire asset production process.

A Project provides the following capabilities:

### Unified AI Context

* When creating a Project, users configure basic information such as:

  * Game genre
  * Art style
  * Camera perspective
  * Pixel resolution
  * Target platform
  * Reference images
* This information becomes the default AI context for the Project and is automatically reused when generating Characters, UI, Tilesets, Objects, and other assets, reducing prompt repetition while maintaining stylistic consistency.

### Centralized Asset Management

* Users can create, import, browse, and manage multiple Assets within a Project.
* Every Asset belongs to exactly one Project, ensuring complete isolation between different games or asset packs.

### Asset Relationship Management

* Projects maintain parent-child relationships, associations, and tags between Assets.
* During generation or editing, the system automatically selects appropriate contextual assets to improve consistency.

### Batch Operations

* Assets can be batch edited or exported based on Asset type, Tags, or user selections, allowing entire asset collections to be updated simultaneously.

---

## Asset

An **Asset** is the smallest manageable resource unit within a Project.

Each Asset represents an individual game resource, such as a Character, Object, UI element, Tileset, or Map.

Rather than generating isolated images, users continuously iterate on the same Asset throughout its lifecycle.

An Asset provides the following capabilities:

### Continuous Iteration

* Users can repeatedly generate, AI-edit, partially repaint, and manually refine an Asset.
* Every modification remains within the same Asset instead of creating unrelated resources.

### Record Management

* Every AI generation automatically creates a new record.
* Users can browse history, restore previous versions, or fork a historical record into a new Asset.

### Asset Relationships

* The system automatically establishes parent-child and related Asset relationships.
* Characters may reference animations, weapons, or sound effects, allowing AI to reuse contextual information during future generations.

### Tags

* Assets may contain one or multiple Tags.
* Tags support organization, searching, filtering, and batch operations across multiple Assets.

### Export

Assets can be exported into multiple formats, including:

* PNG
* GIF
* Spritesheet
* Tileset
* JSON

They can also be converted into engine-ready formats for Unity, Godot, and other game engines.

---

## Record

To support continuous iteration and historical traceability of game assets, we introduce the concept of **Record**.

A **Record** is the persistent history of an Asset. Each time a user confirms a creation or edit operation, the system automatically creates a new Record that captures the complete state of the Asset at that moment, without overwriting any previous history.

A Record provides the following capabilities:

- **Automatic Saving**
  - Every user-confirmed creation or edit operation automatically generates a new Record, such as AI Generate, AI Edit, or confirmed manual edits.
  - Users do not need to save manually. The system automatically persists the history, allowing users to focus on asset creation.

- **Complete History**
  - Each Record stores a complete snapshot of the Asset at the time it was created.

- **History Rollback**
  - Users can revert to a previous Record to recover from mistakes or unintended changes.

---

## Relation

A **Relation** represents the logical relationship between Assets.

Rather than existing independently, related Assets are organized and managed together.

Relations provide:

### Parent-Child Relationships

Some Assets depend on others to be meaningful.

For example:

* Goblin Character

  * Idle Animation
  * Walk Animation
  * Attack Animation
  * Jump Animation

These animations are stored as child Assets instead of independent resources.

### Related Asset Browsing

When viewing an Asset, users can immediately access all associated resources such as animations, alternate directions, weapons, or sound effects.

### AI Context Reuse

During generation or editing, related Assets are automatically referenced as AI context.

For example, when generating an attack animation, the system automatically references the corresponding character model.

---

# Features

The first milestone focuses on completing the core workflow of the AI game asset platform, covering the entire lifecycle:

**Project Creation → Asset Generation & Management → Version Iteration → Batch Processing → Export**

---

## Feature 1: Web Application

Provide a browser-based platform as the primary entry point for asset generation, management, and export.

---

## Feature 2: Quick Generate

Provide a simplified generation workflow.

Users only need to supply a few required parameters and prompts without understanding Projects or complex configurations.

---

## Feature 3: Quick Generation Sessions

Preserve AI creation history.

Supported features:
* Viewing historical assets

---

## Feature 4: Project Management & Global Configuration

Provide Project creation and management.

Supported operations:

* Create Project
* Edit Project
* Delete Project
* View Project

Configure global AI context, including:

* Game genre
* Art style
* Camera perspective
* Pixel resolution
* Target platform
* Reference images

---

## Feature 5: Initial Asset Creation

Allow users to create the initial Asset within a Project.

Supported Asset types:

* Character
* Object
* UI
* Tileset

---

## Feature 6: Asset Management

Provide full Asset lifecycle management.

Supported operations:

* Create Asset
* Edit Asset
* Delete Asset
* Search Assets
* View Asset Details

---

## Feature 7: Individual Asset Editing

Support AI-powered editing around a single Asset.

Capabilities include:

* Prompt modification
* Context reference
* Edit history preservation
* Automatic Version creation

---

## Feature 8: Version Management

Track the complete evolution of every Asset.

Supported features:

* View Version history
* Restore previous Versions
* Fork new Assets
* View Version details

---

## Feature 9: Asset Relations

Support parent-child relationships between Assets.

---

## Feature 10: Tags

Support classification and batch management.

Capabilities include:

* Create Tags
* Assign Tags to Assets
* Search by Tag
* Batch operations using Tags

---

## Feature 11: Batch Creation

Support generating multiple Assets simultaneously.

Capabilities include:

* Batch generation by Asset type
* Batch generation from prompts
* AI-assisted task decomposition

---

## Feature 12: Batch Editing

Support editing multiple Assets simultaneously.

Capabilities include:

* Edit by Tag
* Edit selected Assets
* AI-powered global style adjustment

---

## Feature 13: Asset Export

Support exporting Assets into common formats.

Supported formats:

* PNG
* GIF
* Spritesheet
* JSON
* ZIP

---

## Feature 14: Basic MCP Support

Provide basic MCP APIs that enable AI agents to access platform resources.

Supported capabilities:

* Query Projects
* Query Assets
* Create Assets
* Modify Assets
* Export Assets
