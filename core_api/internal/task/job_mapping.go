package task

import (
	"encoding/json"
	"fmt"

	"github.com/1024XEngineer/Holonic-Asset/internal/common"
	"github.com/1024XEngineer/Holonic-Asset/pkg/queue"
)

func DeserializeJob(kind string, payload []byte) (queue.Job, error) {
	switch kind {
	case "generate_character_prototype":
		var j common.GenerateCharacterProtoTypeJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "generate_character_animation":
		var j common.GenerateCharacterAnimationJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "regenerate_character_prototype":
		var j common.RegenerateCharacterProtoTypeJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "regenerate_character_animation":
		var j common.RegenerateCharacterAnimationJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "regenerate_character_frames":
		var j common.RegenerateCharacterFramesJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "generate_object_prototype":
		var j common.GenerateObjectProtoTypeJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "generate_object_animation":
		var j common.GenerateObjectAnimationJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "regenerate_object_prototype":
		var j common.RegenerateObjectProtoTypeJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "regenerate_object_animation":
		var j common.RegenerateObjectAnimationJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "regenerate_object_frames":
		var j common.RegenerateObjectFramesJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "generate_tileset":
		var j common.GenerateTileSetJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "regenerate_item":
		var j common.RegenerateItemJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	case "regenerate_tiles":
		var j common.RegenerateTilesJob
		if err := json.Unmarshal(payload, &j); err != nil {
			return nil, err
		}
		return j, nil
	default:
		return nil, fmt.Errorf("unknown job kind %q", kind)
	}
}
