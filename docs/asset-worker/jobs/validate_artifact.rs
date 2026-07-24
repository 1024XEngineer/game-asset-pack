//! Validate an image artifact against its intended game-asset constraints.

use super::{AssetJob, ImageConstraints, ObjectRef, ValidationViolation};

pub struct ValidateArtifactInput {
    pub artifact: ObjectRef,
    pub constraints: ImageConstraints,
}

pub struct ValidateArtifactOutput {
    pub checksum_sha256: String,
    pub violations: Vec<ValidationViolation>,
}

pub trait ValidateArtifact:
    AssetJob<Input = ValidateArtifactInput, Output = ValidateArtifactOutput>
{
}

impl<T> ValidateArtifact for T where
    T: AssetJob<Input = ValidateArtifactInput, Output = ValidateArtifactOutput>
{
}
