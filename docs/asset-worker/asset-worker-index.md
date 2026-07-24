# Asset Worker Design

`Asset Worker` is the deterministic image-processing module. It receives jobs
from Core API through a message queue, reads source objects from S3-compatible
object storage, and publishes result events after writing new objects. It has
no frontend API and does not read or write Core API business data.

Core API owns job creation, authorization, Asset/Record/Media state, retries,
and the decision to schedule a later job. AI Service owns generation and
semantic image capabilities. Asset Worker owns only repeatable, non-AI image
processing and package export.

## Tasks

| Task               | Responsibility                                                                       | Input                                                  | Output                                                    | Invocation                                                      |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------- |
| [`InspectImage`](./jobs/inspect_image.rs)         | Read image metadata and check a source image against optional constraints.           | Source object reference and optional constraints.      | Image metadata and validation violations.                 | Reusable internal step; may become a message-queue job for upload inspection. |
| [`NormalizeImage`](./jobs/normalize_image.rs)     | Turn a source image into a pixel-art-compliant PNG.                                  | Source object, pixel-art specification, output target. | New PNG object, dimensions, trimmed bounds, and warnings. | Message-queue job.                                              |
| [`BuildAnimation`](./jobs/build_animation.rs)     | Build a GIF or APNG from a set of already-normalized frames.                         | Ordered frames and animation specification.            | Animation object, shared canvas, pivot, and frame count.  | Message-queue job.                                              |
| [`BuildSpriteSheet`](./jobs/build_spritesheet.rs) | Pack normalized frames into a strict grid.                                           | Ordered frames and sheet layout specification.         | Spritesheet object and per-frame grid coordinates.        | Message-queue job.                                              |
| [`BuildTileSet`](./jobs/build_tileset.rs)         | Assemble tile images into a fixed tile grid.                                         | Tile objects and tile-set layout specification.        | TileSet object and tile grid metadata.                    | Message-queue job.                                              |
| [`ValidateArtifact`](./jobs/validate_artifact.rs) | Verify a generated image, animation, or sheet against the target export constraints. | Artifact object and constraints.                       | Metadata, checksum, and violations.                       | Reusable internal step; may become a pre-export validation job. |
| [`ExportAssetPack`](./jobs/export_asset_pack.rs)  | Collect validated objects into a portable game asset package.                        | Logical export entries and export specification.       | ZIP object, manifest object, checksum, and file count.    | Message-queue job.                                              |

The task interfaces are Rust design skeletons in
[`jobs`](./jobs). They define only the module
contracts: input, output, and execution signature. They intentionally do not
include message-queue, S3, image-library, or database implementations.

## Shared Contract Rules

- A job receives object references, never image bytes or an `Asset` database
  entity.
- Worker derives output keys from `OutputTarget` and its configured artifact
  bucket. It must use create-only writes and reject a source/output collision.
- ZIP entries use validated relative archive paths. Absolute paths, traversal
  segments, Windows separators, and drive prefixes are rejected.
- Pixel-art normalization accepts only nearest-neighbor scaling and produces
  binary alpha values (`0` or `255`).
- Core API treats a Worker result event as the business result. A message-queue
  acknowledgement only confirms message consumption.
- Failed jobs return a classified `JobError`; Core API decides whether to retry,
  cancel, or mark the business step failed.
