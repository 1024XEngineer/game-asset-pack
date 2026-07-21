//! Export validated image artifacts as a ZIP archive and manifest.

use super::{AssetJob, ObjectRef, OutputTarget};

pub struct ExportAssetPackInput {
    pub entries: Vec<ExportEntry>,
    pub specification: ExportAssetPackSpec,
    pub archive_output: OutputTarget,
    pub manifest_output: OutputTarget,
}

pub struct ExportEntry {
    pub logical_path: RelativeArchivePath,
    pub artifact: ObjectRef,
}

/// A normalized, slash-separated relative path inside the ZIP archive.
///
/// Callers must not provide absolute paths, empty or `.`/`..` segments,
/// backslashes, or Windows drive prefixes. The later export implementation
/// validates this contract before writing the archive.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RelativeArchivePath {
    pub value: String,
}

pub struct ExportAssetPackSpec {
    pub package_name: String,
    pub manifest_format: ManifestFormat,
}

pub enum ManifestFormat {
    Json,
}

pub struct ExportAssetPackOutput {
    pub archive: ObjectRef,
    pub manifest: ObjectRef,
    pub archive_checksum_sha256: String,
    pub file_count: u32,
}

pub trait ExportAssetPack:
    AssetJob<Input = ExportAssetPackInput, Output = ExportAssetPackOutput>
{
}

impl<T> ExportAssetPack for T where
    T: AssetJob<Input = ExportAssetPackInput, Output = ExportAssetPackOutput>
{
}
