# Asset Service Data Structures

This document defines the Asset Service current state, resource dependencies, and version snapshot models. See the [system architecture design](../system-architecture-design.md) for responsibilities and boundaries, and the [Asset Service interfaces](../interfaces/asset.md) for use-case contracts.

## Data Structures and Domain Model

The Asset domain contains the following core models:

- `Asset`: the current editable state of an asset
- `AssetResource`: another resource on which an asset depends or which it references
- `AssetSnapshot`: the complete state of an asset at a specific point in time
- `AssetRecord`: an immutable historical version of an asset
- `AssetType`: the asset type value object

These Go types are code representations of the Asset domain model. `AssetRecord` and `AssetSnapshot` are version-management models internal to the Asset domain, not independent system services.

```go
type AssetType string

const (
	AssetTypeCharacter  AssetType = "character"
	AssetTypeTileSet    AssetType = "tileSet"
	AssetTypeAudio      AssetType = "audio"
	AssetTypeUI         AssetType = "UI"
	AssetTypeObject     AssetType = "object"
	AssetTypeScenery    AssetType = "scenery"
)

// Asset stores fields shared by all asset types.
// Attributes stores asset-type-specific information as JSON, such as:
// - Canvas information
// - Animation information
// - Audio metadata
// - Prototype information
// The service layer must validate that Attributes is a valid JSON object.
type Asset struct {
	ParentID unit `json:parentId`

	ID uint `json:"id"`

	ProjectID uint `json:"projectId"`

	Name string `json:"name"`

	Type AssetType `json:"type"`

	Description string `json:"description"`

	ResultURL string `json:"resultUrl"`

	Tags []string `json:"tags"`

	Attributes json.RawMessage `json:"attributes"`
}

// AssetResource represents another asset on which the current asset depends
// or which it references. Resource information is saved in snapshots so that
// historical versions retain their dependencies at that point in time.
type AssetResource struct {
	AssetID uint `json:"assetId"`

	Name string `json:"name"`

	URL string `json:"url"`
}

// AssetSnapshot represents the complete editable state of an asset at a
// specific point in time. ID and ProjectID are retained for auditing, but
// restoring a snapshot must not modify the identity or project ownership of
// the current asset.
type AssetSnapshot struct {
	Asset Asset `json:"asset"`

	Resources []AssetResource `json:"resources,omitempty"`

	Attributes json.RawMessage `json:"attributes"`
}

// AssetRecord represents an immutable historical version of an asset.
// Snapshot is stored in the database as JSON. AssetSnapshot defines the
// document structure used when serializing and reading snapshots.
type AssetRecord struct {
	ID           uint            `json:"id"`
	AssetVersion uint            `json:"assetVersion"`
	AssetID      uint            `json:"assetId"`
	Snapshot     json.RawMessage `json:"snapshot"`
}
```
