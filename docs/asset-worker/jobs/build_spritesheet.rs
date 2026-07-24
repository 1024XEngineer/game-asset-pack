//! Pack ordered image frames into a strict sprite-sheet grid.

use super::{Artifact, AssetJob, ObjectRef, OutputTarget, PixelSize};

pub struct BuildSpriteSheetInput {
    pub frames: Vec<SpriteFrameInput>,
    pub specification: SpriteSheetSpec,
    pub output: OutputTarget,
}

pub struct SpriteFrameInput {
    pub frame_id: String,
    pub image: ObjectRef,
}

pub struct SpriteSheetSpec {
    pub frame_size: PixelSize,
    pub columns: u32,
    pub padding_pixels: u32,
}

pub struct BuildSpriteSheetOutput {
    pub artifact: Artifact,
    pub layout: Vec<SpriteFrameLayout>,
}

pub struct SpriteFrameLayout {
    pub frame_id: String,
    pub column: u32,
    pub row: u32,
    pub size: PixelSize,
}

pub trait BuildSpriteSheet:
    AssetJob<Input = BuildSpriteSheetInput, Output = BuildSpriteSheetOutput>
{
}

impl<T> BuildSpriteSheet for T where
    T: AssetJob<Input = BuildSpriteSheetInput, Output = BuildSpriteSheetOutput>
{
}
