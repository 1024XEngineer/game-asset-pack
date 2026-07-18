# MS1-产品 Proposal

## 一句话产品总结

本产品是一个以Project为核心，基于自然语言、资产引用、全局约束，帮助2d游戏开发者轻松生成风格一致的像素资产，高效管理和复用游戏资产的一体化平台。

---

## 用户画像

面向像素画/形象or游戏爱好者、独立游戏开发者、小型游戏团队和游戏原型制作者。区别在于使用的目的，不在于专业能力

- 像素画/形象or游戏爱好者用户群体比较大，但并非核心用户群体。个人使用量比较小，付费意愿较低。主要在于引流，提高用户基数和项目曝光度，不重在直接盈利。
- 独立游戏开发者分为两种
  - 一种是个人或者团队完全不具备绘画能力的，提供更加完备的方案。
  - 另一种为美工人员少，美工团队生产力较低，需要 AI 辅助，提高生产力的个人或者团队。提供类似 "vibe creating"/"AI assistant creating" 的方案。集成在独立游戏开发者常用的创作环境里面。
- 游戏原型制作者则主要针对想要快速开发一个游戏 demo。Demo 期间显然开发一些基础的简单的游戏功能的速度会远大于美术资产的开发。当然也有可能会直接让美术团队 demo 期间先用 AI 来直接生成素材而不是花精力去画。所以这部分本质上讲和独立游戏开发者的两类需求是高度重叠的。

---

## 解决的问题

目前使用通用 AI 图像工具制作游戏资源时，通常会遇到以下问题：

1. 单次生成结果与实际游戏开发流程脱节，只能得到一张图片，无法直接得到动画帧、Spritesheet、Tileset 或游戏引擎对象。
2. 同一个游戏项目中的多个资源分别生成，AI 缺少项目上下文，容易出现画风、比例、色板和设定不一致。
3. 一个资源往往需要多次生成和修改，但通用对话工具很难集中管理其对话、历史版本和分支。
4. 角色、动画、武器、音效和场景之间存在关系，但这些关系通常没有被系统记录，导致用户需要不断重复说明。
5. 生成结果仍然需要手动裁剪、拆帧、整理文件并转换格式，才能进入 Unity、Godot 等开发环境。
6. 音乐和音效的制作门槛高于一般图像资源。不会绘画的用户仍然可以通过简单草图表达想法，但完全没有音乐知识的用户通常很难自行开始制作 BGM 和音效。
7. 同类产品与开发流程脱节，无法集成到实际工作流中使用。

因此，本产品的目标是建立一个面向像素风的一站式 2D 游戏资源生产和管理系统，让用户能够在统一的项目上下文中生成、修改、关联、管理和交付游戏资源。

---

## 基本概念及其信息结构

### Project

为了帮助用户围绕同一个游戏持续生成、管理和维护资源，我们引入了 Project 的概念。一个 Project 通常对应一个游戏、一个游戏 Demo 或一套具有统一风格的资源包，是整个资源生产过程的工作空间。

Project有三种创建方式：已有游戏导入、有游戏想法、没有游戏想法，创建一个最简单的project。目前优先实现有游戏想法创建project。
每个Project包含：
- Project Name
- Game Type (游戏类型)
- Visual Style (视觉风格)
- Target Platform (目标平台，e.g. PC、Web)
- Game Description
- Visual direction

我们会生成一张大图(Visual direction)，这张大图尽可能包含了Character、UI、Background、Object等Asset的例子来作为后续资源生成的参考，用户不满意可以修改提示词重新生成，也可以上传自己的图片替代。

Project 为用户提供以下能力：

- **统一的 AI 上下文**
  - 用户创建project时提供的信息会作为 Project 的默认上下文，在后续生成 Character、UI、Background、Object 等资源时自动引用，减少重复输入 Prompt，并尽可能保持项目内资源风格的一致性。

- **资源统一管理**
  - 用户可以在 Project 中创建、查看和管理多个 Asset。
  - 所有资源均归属于唯一的 Project，不同 Project 之间相互独立，实现不同游戏、不同资源包之间的资源隔离。

---

### Asset

为了帮助用户持续迭代和管理游戏资源，我们引入了 Asset 的概念。Asset 是 Project 中最小的资源管理单元，一个 Asset 对应游戏中的一个独立资源，例如 Character、Object、UI、Background。

#### Character

Character 代表了一个角色的所有信息，其下管理有一张或多张该角色的protoType(原型图)、基于protoType生成的Animation以及附属于相应Animation的音效

Character 包括有
- Asset Name
- Creative brief (用户对于这个Character的具体描述)
- Canvas size (生成的 Character 画布尺寸，e.g. 32X32px)
- Perspective  (用户可以选择 Top down or Side on or Isometric)
- Reference (参考图片)
- 归属的Project

用户在定义好Character后AI会为用户生成protoType,它描述了Character的外观信息。
protoType 包括有：
- Name
- 所属的Character
- AI生成的形象资源 (目前是多向图的形式来表示，会要求用户决定Direction count)

用户满意后便可基于protoType去生成附属于该Character的Animation,Animation包括：
- Animation Name
- First Frame (Animation 的第一帧)
- Description (对于生成的动作的具体描述，用户可以选择自己编写，也可以使用我们提供的预设如idle再加以更改)
- Frame count (帧数 4～16)
- AI生成的帧图资源
- 所属的Character
一个 Character可以关联多个Animation

我们支持为Animation添加音效(soundEffect)，音效包括：
- 归属的Character
- Animation (对应动画)
- Descrption (音效描述)
- AI生成的音效资源

#### Object

Object表示游戏中的静态或可交互物体，与Character类似，包含一张或多张protoType(原型图)、基于protoType生成的Animation以及附属于相应Animation的音效。

#### UI

UI Asset 代表了一套UI组件，第一阶段先考虑最基础的静态UI，第二阶段会为UI增加不同state(如 hover)，最终阶段提供UI的动画功能。
UI包括的信息有：
- Asset Name
- Style (对这套UI组件的整体风格描述)
- Reference (风格参考图)
- 归属的Project

我们会为用户展示一张大图并对其分割，这张大图包含了所有的Component,Component 代表一个具体的UI组件(目前只是最基础的单状态静态UI组件),包括：
- Name
- 所属的UI
- Size (Component的大小规格)
- 切割后的资源
![alt text](/doc/image/ui-example.png)

#### Background

Background 包含Scenery 与TileSet两种具体的Asset类别。

##### Scenery

Scenery 代表由多个图层堆叠展示的场景，包括的信息有：
- Asset Name
- Style (对这个场景一个整体的风格描述)
- Layer num (层数)
- Aspect ratio （比例，e.g. 16:9）
- Reference (参考图片)
![alt text](/doc/image/secenery-example.png)
- 归属的Project

其下管理有对应Layer num数量的Layer,Layer包含：
- Name
- Descirption
- AI生成的资源

生成后用户可以直接看到多个图层堆叠起来的效果，若对某些图层不满意，可以针对具体图层进行进一步修改

##### TileSet

TileSet 代表一组瓦片资源，包括的信息有：
- Asset Name
- Description (对这个TileSet的描述)
- Reference (参考图片)
![alt text](/doc/image/tile-example.png)
- 归属的Project

Tile Set下管理有用户定义的多个Item，Item是可独立放置的、具有逻辑概念的一个单位(比如一张床，可能占有两个Tile，这两个Tile各自并不具有逻辑概念，两个组合成的床才是Item),我们会为用户提供一张大的Tile Set图，将其分割为一个个Tile,根据用户的预设决定其属于哪个Item.

Item包含有：
- Name
- Description (对这个Item内容的具体描述)
- Shape(e.g. 16X32)
- Location (位置 (x,y))
- 归属的TileSet

Tile作为Tile Set的基本图块，包含有：
- 归属的TileSet
- 归属的Item
- 切割后的资源



#### Audio

Audio 不同于附属于动画的音效，它属于Asset的一种类型，通常用于生成我们游戏中的BGM、环境音等，它包含的信息有：
- Asset Name
- Style (音乐风格，用户可以选择预设的风格如摇滚风，也可以自己编写提示词) 
- Reference (音频参考)
- Length (时长)
- 归属的Project

目前阶段仅支持简单的裁剪与倍速操作，后面会考虑引入Track实现更灵活的处理。

#### Asset 提供以下通用能力：

- **资源持续迭代**
  - 用户可以围绕同一个 Asset 持续进行 AI 生成、局部重绘以及人工微调。
  - 每一次修改都会保留到当前 Asset 中，而不会创建新的独立资源，方便用户持续完善同一个素材。

- **Record管理**
  - Asset 内置 Record 管理，用户每次使用 AI 生成都会产生新的 Record。
  - 用户可以查看历史版本、回退到任意历史版本，或基于历史版本 copy 出一个新的 Asset。

- **资源关联**
  - Asset 支持 AI 自动建立关联关系。系统在生成或修改时会自动引用这些相关资源作为上下文，提高生成结果的一致性。

- **标签分类**
  - 用户可以为 Asset 添加一个或多个 Tag，用于资源分类、快速检索以及批量修改。
  - 同一个 Tag 可以关联多个 Asset，方便统一管理一组具有共同特征的资源。

- **资源导出**
  - Asset 可以根据资源类型导出为 PNG、GIF、Spritesheet、Tileset、JSON 等多种格式，也可以进一步转换为 Unity、Godot 等游戏引擎所需的资源格式，帮助用户开箱即用。

---

### Record

为了支持游戏资源的持续迭代与历史追溯，我们引入了 **Record** 的概念。

Record 是 Asset 的持久化历史记录。每一次经过用户确认的创建或编辑操作，系统都会自动创建一条新的 Record，用于记录当时 Asset 的完整状态，而不会覆盖历史内容。

Record 提供以下能力：

- **自动保存**
  - 每一次需要用户确认的创建或编辑操作都会自动生成一条新的 Record，例如 AI Generate、AI Edit、手动编辑确认等。
  - 用户无需手动保存，系统会自动完成历史记录的持久化，让用户专注于资源创作。

- **完整的历史记录**
  - 每一条 Record 都保存 Asset 在该时刻的完整快照。

- **历史回溯**
  - 用户可以回退到之前的历史版本来避免误操作带来的问题。

---

## Feature

第一阶段主要完成游戏资源 AI 生成平台的核心业务闭环，实现从 **Project 创建 → Asset 生成与管理 → 迭代 → 批量处理 → 导出** 的完整流程。

### Feature 1：Web 端

提供基于浏览器的资源管理平台，作为用户进行资源生成、管理和导出的主要入口。

---

### Feature 2：快速生成

提供简化的生成入口，用户无需关心 Project 等概念和专业化的表单数据，仅需提供必须的几个参数与提示词即可快速创建游戏资源。
保存用户的 AI 创作历史，方便用户查看历史生成记录。

---

### Feature 3：Project 管理与全局配置

提供 Project 的创建与管理能力，作为整个游戏资源的工作空间。

支持：

- 创建 Project
- 编辑 Project
- 删除 Project
- 查看 Project

并为 Project 配置统一的 AI 上下文，生成或上传Visual Direction 大图提高资源生成的一致性，避免同一个游戏项目中的多个资源分别生成，AI 缺少项目上下文，出现画风、设定不一致的问题。

支持配置：

- 游戏类型
- 美术风格
- 游戏视角
- 目标平台
- 参考图片

---

### Feature 4：Asset 管理

提供 Project 内资产的组织和管理能力，帮助用户在资产数量增长后依然能够高效定位和维护。

支持：

- 创建 Asset
- 编辑 Asset
- 删除 Asset
- 搜索 Asset
- 查看 Asset 详情
- 复制 Asset

---

### Feature 5：Asset 内资源修改

支持 Asset内资源进行 AI重新生成或用户手动修改。

---

### Feature 6：Record 管理

自动记录Asset的完整演化过程，解决了一个资源往往需要多次生成和修改其历史版本难以回溯管理的问题。

支持：

- 自动记录 Record
- 回退历史版本
- 查看版本详情

---

### Feature 7：Animation 与音效生成

基于 ProtoType 生成角色或物体的动画帧，并为动画附加音效，形成"角色 → 动画 → 音效"的完整链条，解决了原型、动画、音效没有关联需要用户重复描述与音效制作门槛高的问题。

支持：

- 基于 ProtoType 生成 Animation
- 动画与音效的预览

---

### Feature 8：Tag

支持资源分类与批量管理。

支持：

- 创建 Tag
- Asset 绑定 Tag
- Tag 检索
- Tag 批量操作

---

### Feature 9：资源关联

自动建立 Asset 之间的关联关系，使生成与修改时能够引用相关资源作为上下文，提升项目内资源的一致性，解决了角色、物品、场景等资源间存在关系用户需要重复说明的问题。

支持：

- AI 自动识别并建立 Asset 关联

---

### Feature 10：资源导出

支持将资源导出为通用格式。

---

### Feature 11: SDK

网络游戏需要将图片、音频、动画等素材托管到对象存储中，平台内置经过优化的对象存储服务，并封装客户端 SDK，用户直接在代码中通过 SDK 调用素材，无需经历"下载素材 → 上传到自有对象桶 → 配置访问地址"的流程。

支持：

- JS SDK（npm 安装）
- 资源加载

---

### Feature 12：MCP 能力

为了将平台资源无缝集成到游戏开发工作流中，我们引入 MCP（Model Context Protocol）接口。

MCP 面向两种典型游戏开发场景：

- **网络游戏场景：获取SDK信息 **
  - Agent 通过 MCP 读取 SDK 实时文档，自动生成资源调用代码，实现 vibe coding——用户只需描述需求，Agent 即可完成从资源获取到代码集成的全流程。

- **本地游戏场景：项目直落**
  - 用户在 Web 编辑器中完成资源配置后，Agent 通过 MCP 直接将资源文件落地到本地项目目录。
  - 自动生成目标引擎所需的场景文件（如 Godot 的 .tscn 文件），包含Sprite节点、动画帧引用等配置。

解决了产品与开发流程脱节无法集成到实际工作流与无法直接得到可落地的资源的问题 

支持：

- 读取 SDK 实时文档
- 查询 Project 信息与 Asset 列表
- 搜索 Project 中的 Asset
- 获取 Asset 详情与关联资源
- 下载资源文件到指定目录
- 生成目标游戏引擎所需的场景文件与资源配置

---

### Feature 13：Audio 生成 

提供独立的 BGM、环境音等音频资源生成能力，解决了BGM等音乐资产制作门槛高的问题

支持：

- 音频在线播放
- 时长控制
- 简单裁剪与倍速调整