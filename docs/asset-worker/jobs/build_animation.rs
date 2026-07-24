//! Build a GIF or APNG from ordered, normalized image frames.

use super::{Artifact, AssetJob, ObjectRef, OutputTarget, PixelPoint, PixelSize};

pub struct BuildAnimationInput {
    pub frames: Vec<AnimationFrameInput>,
    pub specification: AnimationSpec,
    pub output: OutputTarget,
}

pub struct AnimationFrameInput {
    pub index: u32,
    pub image: ObjectRef,
}

pub struct AnimationSpec {
    pub format: AnimationFormat,
    pub canvas_size: PixelSize,
    pub pivot: PixelPoint,
    pub frame_duration_millis: u32,
    pub looping: bool,
}

pub enum AnimationFormat {
    Gif,
    Apng,
}

pub struct BuildAnimationOutput {
    pub artifact: Artifact,
    pub canvas_size: PixelSize,
    pub pivot: PixelPoint,
    pub frame_count: u32,
}

pub trait BuildAnimation:
    AssetJob<Input = BuildAnimationInput, Output = BuildAnimationOutput>
{
}

impl<T> BuildAnimation for T where
    T: AssetJob<Input = BuildAnimationInput, Output = BuildAnimationOutput>
{
}
