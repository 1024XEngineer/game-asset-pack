# Animation Frame Feasibility API

原型验证以下闭环：

1. 用户上传一张人物、物体单图或三视图，也可传入公开图片 URL；
2. 用户通过 `action_prompt` 完整描述动作；
3. 模型输出一张固定 `1536×1024`、`3×2` 的 Sprite Sheet；
4. 后端按固定坐标切出六张 `512×512` PNG，并生成六帧 GIF；
5. 返回 Manifest、结构质检报告和全部资产 URL。

## 运行

环境安装依赖：

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --host 127.0.0.1 --port 8080
```

默认 `ANIMATION_MOCK_PROVIDER=true`，会使用确定性的本地模拟图跑通上传、切图、质检和 GIF，不消耗模型额度。Swagger 地址为 `http://127.0.0.1:8080/docs`。

调用真实模型时修改 `.env`：

```dotenv
ANIMATION_MOCK_PROVIDER=false
QNAIGC_API_KEY=your-key

请求模型固定为 `openai/gpt-image-2`。适配层可解析 `data[0].b64_json`，也兼容 `data[0].url` 返回结果。没有模型级自动重试或逐帧补生，因此一次动画任务的生成 POST 严格为一次。

## Apifox 请求

接口：

```http
POST /v1/animations/generate
Content-Type: multipart/form-data
```

Body 选择 `form-data`：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `action_prompt` | Text | 是 | 用户动作描述，是唯一动作语义来源 |
| `reference_transport` | Text | 否 | `base64`（默认）或 `url` |
| `reference_image` | File | 条件 | `base64` 模式必填，后端转 Data URL 传模型 |
| `reference_url` | Text | 条件 | `url` 模式必填，必须是公开的 HTTP(S) URL |
| `reference_type` | Text | 否 | `single`（默认）或 `turnaround` |
| `asset_kind` | Text | 否 | `character`、`interactive_object` 或 `prop` |
| `action_name` | Text | 否 | 仅作资产名称/标签，不参与预置动作选择 |
| `fps` | Number | 否 | 默认 `8`，范围 1–50 |
| `loop` | Boolean | 否 | 默认 `true` |
| `alignment_mode` | Text | 否 | 默认 `preserve`；可选 `bottom_center` |

示例 `action_prompt`：

```text
角色先蹲下蓄力，然后向上跃起，在空中伸展身体，最后落回原位。
```

`base64` 指的是服务端接收 Apifox 文件后，将其编码为 `data:image/...;base64,...` 再放入 QNAIGC JSON 的 `image` 数组；API 客户端不需要自己生成 Base64。`url` 模式则把 `reference_url` 直接放入该数组。

接口立即返回 `202`：

```json
{
  "job_id": "anim-0123456789abcdef",
  "status": "queued",
  "stage": "queued",
  "progress": 0,
  "created_at": "...",
  "updated_at": "...",
  "error": null,
  "result": null
}
```

查询任务和资产：

```http
GET /v1/animations/{job_id}
GET /v1/animations/{job_id}/assets
```

## 输出契约

```text
outputs/<job_id>/
├── request.json
├── compiled_prompt.txt
├── reference/reference.png
├── sprite_sheet_raw.png
├── sprite_sheet.png
├── manifest.json
├── quality_report.json
├── frames_raw/frame_000.png ... frame_005.png
├── frames/frame_000.png ... frame_005.png
└── animation.gif
```

Manifest 在模型调用前创建，坐标固定为 row-major：

```text
┌───────────┬───────────┬───────────┐
│ phase_01  │ phase_02  │ phase_03  │
├───────────┼───────────┼───────────┤
│ phase_04  │ phase_05  │ phase_06  │
└───────────┴───────────┴───────────┘
```

模型结果如果不是精确的 `1536×1024` 会直接失败，不做非确定性网格检测，也不拉伸图片。结构质检会检查空帧、精确重复帧、尺寸、Alpha 信息和内容越界。

## 当前实验边界

- 只支持单个参考资产；人物与宝箱等多参考交互不在本版实现范围。
- 六阶段的具体动作由图片模型根据 `action_prompt` 分解，后端不调用额外的文本模型。
- `openai/gpt-image-2` 图生图请求不发送 `background` 参数，Prompt 要求六格使用相同的纯色背景。
- 当前不集成抠图模型；输出会保留模型生成的背景，质检报告记录每帧是否完全不透明，便于后续评估抠图方案。
- `bottom_center` 只适用于需要稳定底部锚点的素材。跳跃等动作应使用默认 `preserve`，避免后处理破坏真实位移。
