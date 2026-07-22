package data

type GameType string

type ViewType string

type PlatformType string

const (
	GameTypeRPG   GameType = "RPG"
	GameTypeACT   GameType = "ACT"
	GameTypeSLG   GameType = "SLG"
	GameTypeOther GameType = "Other"

	ViewTypeTopDown   ViewType = "TopDown"
	ViewTypeSideView  ViewType = "SideView"
	ViewTypeIsometric ViewType = "Isometric"
	ViewTypeOther     ViewType = "Other"

	PlatformTypePC     PlatformType = "PC"
	PlatformTypeMobile PlatformType = "Mobile"
	PlatformTypeWeb    PlatformType = "Web"
)

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
