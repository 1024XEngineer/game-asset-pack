//! Normalize a source image into a pixel-art-compliant PNG.

use super::{
    Artifact, AssetJob, ObjectRef, OutputTarget, PixelArtSpec, PixelRect, ProcessingWarning,
};

pub struct NormalizeImageInput {
    pub source: ObjectRef,
    pub specification: PixelArtSpec,
    pub output: OutputTarget,
}

pub struct NormalizeImageOutput {
    pub artifact: Artifact,
    pub source_content_bounds: PixelRect,
    pub warnings: Vec<ProcessingWarning>,
}

pub trait NormalizeImage:
    AssetJob<Input = NormalizeImageInput, Output = NormalizeImageOutput>
{
}

impl<T> NormalizeImage for T where
    T: AssetJob<Input = NormalizeImageInput, Output = NormalizeImageOutput>
{
}
