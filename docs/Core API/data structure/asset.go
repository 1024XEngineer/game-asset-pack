package data

import (
	"encoding/json"
)
type AssetType string

const (
	AssetTypeCharacter AssetType = "character"
	AssetTypeTileSet   AssetType = "tileSet"
	AssetTypeAudio     AssetType = "audio"
	AssetTypeUI        AssetType = "ui"
	AssetTypeObject    AssetType = "object"
	AssetTypeScenery   AssetType = "scenery"
)

type Asset struct {
	ID          uint
	Name        string
	ProjectID   uint
	Type        AssetType
	Description string
	Tags        []string        `json:"tags"`
	Attributes  json.RawMessage `json:"attributes"`
	Version     uint
}


type Status uint

const (
	StatusPending Status = iota
	StatusProcessing
	StatusCompleted
	StatusFailed
)

type AssetResourceType string

const (
	AssetResourceTypeProtoType AssetResourceType = "protoType"
	AssetResourceTypeFrame     AssetResourceType = "frame"
	AssetResourceTypeTile      AssetResourceType = "tile"
	AssetResourceTypeUI        AssetResourceType = "ui"
	AssetResourceTypeScenery   AssetResourceType = "scenery"
	AssetResourceTypeAnimation AssetResourceType = "animation"
	AssetResourceTypeItem      AssetResourceType = "item"
)

type AssetResource struct {
	ID           uint
	Name         string
	ParentID     *uint
	AssetID      uint
	AssetVersion uint
	Type         AssetResourceType
	Url          *string
	Status	   Status
}

type AssetVersion struct {
	ID   uint
	AssetID uint
	Version uint
}