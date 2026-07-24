package common

type GenerateCharacterProtoTypeJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (GenerateCharacterProtoTypeJob) Kind() string { return "generate_character_prototype" }

type GenerateCharacterAnimationJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (GenerateCharacterAnimationJob) Kind() string { return "generate_character_animation" }

type RegenerateCharacterProtoTypeJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (RegenerateCharacterProtoTypeJob) Kind() string { return "regenerate_character_prototype" }

type RegenerateCharacterAnimationJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (RegenerateCharacterAnimationJob) Kind() string { return "regenerate_character_animation" }

type RegenerateCharacterFramesJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (RegenerateCharacterFramesJob) Kind() string { return "regenerate_character_frames" }

type GenerateObjectProtoTypeJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (GenerateObjectProtoTypeJob) Kind() string { return "generate_object_prototype" }

type GenerateObjectAnimationJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (GenerateObjectAnimationJob) Kind() string { return "generate_object_animation" }

type RegenerateObjectProtoTypeJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (RegenerateObjectProtoTypeJob) Kind() string { return "regenerate_object_prototype" }

type RegenerateObjectAnimationJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (RegenerateObjectAnimationJob) Kind() string { return "regenerate_object_animation" }

type RegenerateObjectFramesJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (RegenerateObjectFramesJob) Kind() string { return "regenerate_object_frames" }

type GenerateTileSetJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
}

func (GenerateTileSetJob) Kind() string { return "generate_tileset" }

type RegenerateItemJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
	ItemIndex int  `json:"item_index"`
}

func (RegenerateItemJob) Kind() string { return "regenerate_item" }

type RegenerateTilesJob struct {
	TaskID    uint `json:"task_id"`
	ProjectID uint `json:"project_id"`
	AssetID   uint `json:"asset_id"`
}

func (RegenerateTilesJob) Kind() string { return "regenerate_tiles" }
