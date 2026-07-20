# Layer-based Scenery Studio

一个只聚焦 Scenery 的完整 live demo。界面沿用产品 `live-demo` 分支的视觉语言，并实现 Issue #31 所定义的真实 Layer 编辑、文生图接入、持久化与导出能力。

## 已实现

- 独立的 `Scenery` 与 `Layer` Asset，Layer 通过 `parentId` 关联 Scenery。
- 右侧输入描述，调用 `D:\Project\2Dgame\generate-image` 生成一个独立 PNG Layer。
- 图层选择、显隐、删除、拖拽排序和缩略图。
- Figma 风格画布缩放、平移、拖动、缩放控制点和旋转控制点。
- 完整支持 `zIndex`、`position`、`scale`、`visible`、`opacity`、`rotation`。
- 保存但不在编辑器中模拟 `size`、`repeat`、`speed`、`parallax`。
- SQLite 持久化、自动保存、撤销/重做、JSON 与 ZIP 导出。
- ZIP 包含 `scenery.json` 和所有 Layer PNG；导出不会用扁平合成图替代分层数据。
- 后端校验生图结果，统一保存为 RGBA PNG，并记录真实 Alpha 元数据。
- 导出契约位于 `contracts/scenery-export.schema.json`。

## 目录

```text
frontend/   Next.js + React + Zustand + Konva 编辑器
backend/    FastAPI + SQLite + Pillow 场景服务
contracts/  Scenery 导出 JSON Schema
```

## 启动

### 1. 启动现有文生图服务

```powershell
cd D:\Project\2Dgame\generate-image
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

该服务需要提供：

```http
POST /generate
Content-Type: application/json

{"prompt":"..."}
```

响应体为图片二进制。

### 2. 启动 Scenery 后端

```powershell
cd D:\Project\2Dgame\layer-based-scenery-data\backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

可选环境变量见 `backend/.env.example`；文生图地址默认为 `http://127.0.0.1:8000`。

### 3. 启动前端

```powershell
cd D:\Project\2Dgame\layer-based-scenery-data\frontend
npm.cmd install
npm.cmd run dev
```

打开 <http://127.0.0.1:3000>。

## 验证

```powershell
cd backend
python -B -m pytest -q

cd ..\frontend
npm.cmd run typecheck
npm.cmd run build
```

后端测试使用确定性的 Mock 生图客户端，不消耗真实模型额度。`backend/tests/mock_generation_app.py` 可用于本地全链路联调。

## API

```text
POST   /api/v1/sceneries
GET    /api/v1/sceneries/{id}/document
PATCH  /api/v1/sceneries/{id}

POST   /api/v1/sceneries/{id}/generation-jobs
GET    /api/v1/generation-jobs/{jobId}

POST   /api/v1/sceneries/{id}/layers
PATCH  /api/v1/layers/{layerId}
DELETE /api/v1/layers/{layerId}
PUT    /api/v1/sceneries/{id}/layer-order

GET    /api/v1/sceneries/{id}/export.json
GET    /api/v1/sceneries/{id}/export.zip
```

## 透明背景说明

非 Sky Layer 的有效 Prompt 会自动加入独立图层与透明背景约束。模型仍可能返回完全不透明的 PNG；后端会检测真实 Alpha，前端会显示警告，但不会用不稳定的自动抠图破坏原始结果。

