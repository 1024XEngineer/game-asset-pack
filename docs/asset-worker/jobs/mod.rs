//! Public job contracts for the Asset Worker design skeleton.
//!
//! The Core API sends object references and processing specifications. Concrete
//! implementations will obtain bytes from object storage and publish result
//! events through NATS outside these task contracts.

use std::future::Future;

pub mod build_animation;
pub mod build_spritesheet;
pub mod build_tileset;
pub mod export_asset_pack;
pub mod inspect_image;
pub mod normalize_image;
pub mod validate_artifact;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ObjectRef {
    pub bucket: String,
    pub key: String,
    pub checksum_sha256: Option<String>,
    pub media_type: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct PixelSize {
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct PixelPoint {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct PixelRect {
    pub origin: PixelPoint,
    pub size: PixelSize,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ImageMetadata {
    pub format: ImageFormat,
    pub dimensions: PixelSize,
    pub frame_count: u32,
    pub has_alpha: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ImageConstraints {
    pub accepted_formats: Vec<ImageFormat>,
    pub expected_size: Option<PixelSize>,
    pub require_alpha: bool,
    pub maximum_frame_count: Option<u32>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ImageFormat {
    Png,
    Gif,
    Apng,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AlphaMode {
    Binary,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PixelArtSpec {
    pub target_size: PixelSize,
    pub alpha_mode: AlphaMode,
    pub trim_transparent_edges: bool,
    pub remove_background_color: Option<RgbaColor>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RgbaColor {
    pub red: u8,
    pub green: u8,
    pub blue: u8,
    pub alpha: u8,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OutputTarget {
    pub workspace_id: String,
    pub project_id: String,
    pub artifact_id: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Artifact {
    pub object: ObjectRef,
    pub metadata: ImageMetadata,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidationViolation {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProcessingWarning {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum JobError {
    InvalidInput { message: String },
    SourceUnavailable { message: String },
    ProcessingFailed { message: String },
    OutputUnavailable { message: String },
}

pub trait AssetJob {
    type Input;
    type Output;

    fn execute(
        &self,
        input: Self::Input,
    ) -> impl Future<Output = Result<Self::Output, JobError>> + Send;
}
