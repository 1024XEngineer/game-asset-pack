//! Assemble tile images into a fixed tile-set grid.

use super::{Artifact, AssetJob, ObjectRef, OutputTarget, PixelSize};

pub struct BuildTileSetInput {
    pub tiles: Vec<TileInput>,
    pub specification: TileSetSpec,
    pub output: OutputTarget,
}

pub struct TileInput {
    pub tile_id: String,
    pub image: ObjectRef,
}

pub struct TileSetSpec {
    pub tile_size: PixelSize,
    pub columns: u32,
    pub padding_pixels: u32,
}

pub struct BuildTileSetOutput {
    pub artifact: Artifact,
    pub layout: Vec<TileLayout>,
}

pub struct TileLayout {
    pub tile_id: String,
    pub column: u32,
    pub row: u32,
    pub size: PixelSize,
}

pub trait BuildTileSet: AssetJob<Input = BuildTileSetInput, Output = BuildTileSetOutput> {}

impl<T> BuildTileSet for T where T: AssetJob<Input = BuildTileSetInput, Output = BuildTileSetOutput> {}
