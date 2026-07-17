# Project Service 数据结构

本文档定义 Project Service 的领域实体和值类型。服务职责与系统边界参见[系统架构设计](../system-architecture-design.md)，服务接口参见[Project Service 接口](../interfaces/project.md)。

## 数据结构与领域模型

`Project` 是项目领域的核心实体；`GameType` 和 `ViewType` 是描述项目属性的值类型。下面的 Go 定义是这些领域概念在代码中的表示，而不是独立的系统模块。

```go

type GameType string

type ViewType string

type PlatformType string



const (

GameTypeRPG GameType = "RPG"

GameTypeACT GameType = "ACT"

GameTypeSLG GameType = "SLG"

GameTypeOther GameType = "Other"

ViewTypeTopDown ViewType = "TopDown"

ViewTypeSideView ViewType = "SideView"

ViewTypeIsometric ViewType = "Isometric"

PlatformTypePC Platform = "PC"

PlatformTypeMobile Platform = "Mobile"

PlatformTypeWeb Platform = "Web"

)



type Project struct {

ID uint

Name string

GameType GameType `json:"gameType"` // RPG、ACT、SLG 等

ViewType ViewType `json:"viewType"` // TopDown、SideView、Isometric 等

TargetPlatform  PlatformType 

Description string // 项目描述

Reference string // 基于项目描述由 AI 生成的参考图

Style string // 项目的美术风格

}

```
