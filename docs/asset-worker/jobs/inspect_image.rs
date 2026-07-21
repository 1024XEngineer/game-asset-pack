//! Read image metadata and report source-image constraint violations.

use super::{AssetJob, ImageConstraints, ImageMetadata, ObjectRef, ValidationViolation};

pub struct InspectImageInput {
    pub source: ObjectRef,
    pub constraints: Option<ImageConstraints>,
}

pub struct InspectImageOutput {
    pub metadata: ImageMetadata,
    pub violations: Vec<ValidationViolation>,
}

pub trait InspectImage: AssetJob<Input = InspectImageInput, Output = InspectImageOutput> {}

impl<T> InspectImage for T where T: AssetJob<Input = InspectImageInput, Output = InspectImageOutput> {}
