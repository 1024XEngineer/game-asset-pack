package domain

type Project struct {
	UserID         uint
	ID             uint
	Name           string
	GameType       GameType `json:"gameType"`
	ViewType       ViewType `json:"viewType"`
	TargetPlatform PlatformType
	Description    string
	Reference      string
	Style          string
}
