package domain

import "github.com/1024XEngineer/Holonic-Asset/internal/common"

func BuildJob(taskType TaskType, taskID, projectID uint, metadata map[string]any) any {
	aid := assetIDFromMeta(metadata)

	switch taskType {
	case GenerateCharacterProtoType:
		return common.GenerateCharacterProtoTypeJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	case GenerateCharacterAnimation:
		return common.GenerateCharacterAnimationJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	case RegenerateCharacterProtoType:
		return common.RegenerateCharacterProtoTypeJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	case RegenerateCharacterAnimation:
		return common.RegenerateCharacterAnimationJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	case RegenerateCharacterFrames:
		return common.RegenerateCharacterFramesJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	case GenerateObjectProtoType:
		return common.GenerateObjectProtoTypeJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	case GenerateObjectAnimation:
		return common.GenerateObjectAnimationJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	case RegenerateObjectProtoType:
		return common.RegenerateObjectProtoTypeJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	case RegenerateObjectAnimation:
		return common.RegenerateObjectAnimationJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	case RegenerateObjectFrames:
		return common.RegenerateObjectFramesJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	case GenerateTileSet:
		return common.GenerateTileSetJob{
			TaskID: taskID, ProjectID: projectID,
		}
	case RegenerateItem:
		return common.RegenerateItemJob{
			TaskID:    taskID,
			ProjectID: projectID,
			AssetID:   aid,
			ItemIndex: itemIndexFromMeta(metadata),
		}
	case RegenerateTiles:
		return common.RegenerateTilesJob{
			TaskID: taskID, ProjectID: projectID, AssetID: aid,
		}
	default:
		return nil
	}
}

func assetIDFromMeta(m map[string]any) uint {
	if m == nil {
		return 0
	}
	switch v := m["asset_id"].(type) {
	case float64:
		return uint(v)
	case uint:
		return v
	case int:
		return uint(v)
	}
	return 0
}

func itemIndexFromMeta(m map[string]any) int {
	if m == nil {
		return 0
	}
	switch v := m["item_index"].(type) {
	case float64:
		return int(v)
	case int:
		return v
	}
	return 0
}
