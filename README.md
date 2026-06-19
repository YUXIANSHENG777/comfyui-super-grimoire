# 超级魔导书V8 — 项目架构总结

**🤖 AI 开发指引**：本文档包含该项目的完整架构、全局状态、API 路由、数据流、函数速查和 Bug 排查指南。将整个项目文件夹交给 AI，让它先阅读本文件，即可理解代码结构并进行功能开发、Bug 修复和版本迭代。

面向 Stable Diffusion / ComfyUI 的标签浏览、随机组合、AI润色、批量生图全功能 Web 工具。桌面/手机双端适配，数据通过 Flask 服务端同步。

---

## 项目功能总览

### 标签管理
- 两套独立标签库自由切换：短语标签（2553条自然语言短句）+ 单一标签（2547条 Danbooru 风格单词）
- 三级分类浏览：大类 → 子类 → 标签网格，左侧分类树展开/折叠记忆
- 中英文搜索、⭐ 收藏夹、自定义标签增删改、分类/子类增删
- NSFW 标签分类及开关控制

### 提示词组合
- 正面/负面双面板，分组显示、拖拽排序、🔒 锁定标签（随机不替换）
- 独立权重滑块（0.5~2.0），⚡ 全局权重开关，🔄 空格转换
- 📐 提示词模板（`{tags}` 占位符），模板保存/加载多套管理
- 📝 批量添加（中英文混合匹配）、多种导出格式（通用 / NovelAI / SD WebUI）
- 🚫 负面提示词预设：6 套内置预设，生图时自动注入，支持保存加载

### 随机生成
- 🎲 手气不错：分类/子类每级独立上限、📁/📂 随机模式切换
- 🔞 NSFW 开关、⚖ 随机权重、智能防冲突体系（`single`/`singlePool`/`poolGroup`）
- 🎲 随机生图：每次重抽标签→排队生成，张张不同
- 📄 批量导出 N 组随机提示词

### AI 润色
- 支持 OpenAI / LM Studio / Ollama / 自定义 API，配置服务端存储桌面手机共享
- 自定义系统指令，💾 保存/📂 加载润色预设（内置 5 套默认预设）
- 🤖 手动润色 + 🎨 生图前自动润色，中/英文发送
- 📜 润色记录：保存最近 100 条，翻页浏览，独立复制/发送
- 负面标签和负面预设不经过大模型，直接拼回

### ComfyUI 集成
- 工作流管理：API 格式 JSON 放入 `workflows/` 文件夹即可识别
- 🔗 CLIP 正负节点绑定（保存后换工作流互不干扰）
- ⚙ 工作流参数设置（采样器/步数/CFG/Denoise）
- 🎭 模型选择（Checkpoint / UNET / CLIP / VAE / LoRA + 权重）
- 🌐 端口配置 + 连接测试
- 🚀 普通生图 / 🎲 随机生图 / ✏ 手写生图 / 📜 润色记录生图
- 🖼 加载图片：上传图片绑定 LoadImage 节点，自动注入工作流，支持拖拽
- 队列系统：排队生成、逐一出图、终止、清空
- 返图预览：缩略图横向滚动 → 点击放大 → 缩放/拖拽/下载/键盘导航
- 图片代理：手机端通过 Flask 访问 ComfyUI 图片

### 数据同步
- 收藏、随机限制、模板、润色记录、工作流参数、CLIP 绑定、负面预设、模型选择等全部服务端存储
- 桌面和手机自动双向同步，刷新不丢失
- LLM 配置和润色预设独立存储到 `user_data/`，多设备共享

### 手机端专属
- 底部三 Tab 导航：标签 / 提示词 / 生图
- 左侧滑出抽屉：分类树 + 步进器 + 随机模式 + 收藏/预设
- 标签网格下方已选标签栏（🔒 锁定金色高亮）
- 全屏按钮、NSFW 开关、免责声明弹窗
- ComfyUI 返图画廊直接在生图 Tab 显示
- 预览图手指缩放拖拽

---

## 首次使用指南

### 运行环境
- Windows 系统，安装 Python 3
- Chrome / Edge 浏览器（桌面端），手机浏览器（手机端）
- 可选：ComfyUI（生图）、LM Studio / Ollama（AI 润色）

### 启动步骤
1. 双击 `start.bat` 或命令行运行 `python launch.py`
2. 浏览器自动打开 `http://127.0.0.1:5801`
3. 如需 ComfyUI 生图：
   - 先启动 ComfyUI（默认 `http://127.0.0.1:8188`）
   - 在 ComfyUI 中搭好工作流 → **Workflow → Export (API)** → 保存为 JSON
   - 将 JSON 文件放入项目的 `workflows/` 文件夹
   - 回到页面，刷新，下拉选择工作流
4. 如需 AI 润色：启动 LM Studio / Ollama → 页面 AI 润色区配置地址和模型

### ComfyUI 首次使用流程
1. 页面下拉选择工作流 → 自动读取宽高
2. 点击 🔗 **正负绑定** → 指定正面/负面提示词分别发到哪个 CLIP 节点 → 💾 保存
3. 点击 ⚙ **工作流参数** → 调整采样器/步数/CFG → 保存
4. 点击 🎭 **模型** → 选择 Checkpoint / LoRA 等
5. 选标签 → 点 🚀 **生图**

### 手机端使用
- 手机和电脑连接同一 WiFi
- 手机浏览器访问 `http://<电脑IP>:5801`（电脑 IP 见启动窗口日志）
- 数据自动双向同步，收藏/预设/润色记录/配置全部共享
- 底部 Tab 切换：📁 标签 / 📝 提示词 / 🎨 生图

---

## 一、技术栈

| 层 | 技术 | 说明 |
|---|------|------|
| 后端 | Python 3 + Flask | 单文件 `server.py`，所有路由集中管理 |
| 前端 | 原生 JS（零框架）| 单文件 `app.js`，全局状态对象 `S` 统一管理 |
| 样式 | CSS 变量 + 媒体查询 | 桌面暗色主题，`@media (max-width: 768px)` 手机适配 |
| 存储 | JSON 文件 + localStorage | 服务端存 `user_data/`，客户端存 `localStorage`，双向同步 |
| AI 润色 | OpenAI 兼容 API | 支持 LM Studio / Ollama / 自定义 |
| 生图 | ComfyUI REST API | 通过 Flask 代理转发 |

---

## 二、项目文件结构

```
超级魔导书/
├── server.py                  # Flask 后端，所有 API 路由
├── launch.py                  # 启动器，自动打开浏览器
├── start.bat                  # 双击启动
├── data/
│   ├── tags.json              # 短语标签库（14大类，2553条）
│   └── tags_single.json       # 单一标签库（14大类，2547条）
├── user_data/                  # 用户数据（自动创建）
│   ├── custom_tags.json       # 自定义标签
│   ├── presets/               # 用户保存的预设组合（JSON文件）
│   ├── history/               # 提示词复制历史
│   ├── comfyui_config.json    # ComfyUI 连接地址
│   ├── llm_config.json        # LLM API 配置（桌面/手机共享）
│   ├── llm_presets.json       # 润色预设列表
│   └── sync_data.json         # 统一同步数据（收藏/上限/模式等）
├── workflows/                  # ComfyUI API 格式工作流 JSON
├── static/
│   ├── index.html             # 前端 HTML（所有弹窗、模态框）
│   ├── app.js                 # 前端逻辑（约 900 行单文件）
│   └── style.css              # 样式（约 360 行）
└── PROJECT_SUMMARY.md         # 本文档
```

---

## 三、前端全局状态 `S`

所有状态集中在一个全局对象 `S` 中，方便追踪和调试：

```javascript
var S = {
  // 标签库
  allData: null,           // 当前加载的标签库数据
  activeCat: null,         // 当前选中的大类名
  activeSc: null,          // 当前选中的子类名
  isSearching: false,      // 是否在搜索模式

  // 选中的标签
  posTags: [],             // 正面标签 [{en,zh,weight,category,subcategory,locked}]
  negTags: [],             // 负面标签
  autoSortPos: true,       // 正面自动排序
  autoSortNeg: true,       // 负面自动排序
  activeTab: 'positive',   // 当前面板标签页

  // 开关
  useQuality: false,       // 基础质量词
  useWeights: false,       // 权重语法
  allowNsfw: false,        // NSFW 开关
  randWeight: false,       // 随机权重
  spaceMode: 0,            // 空格转换(0关/1空格→_/2_→空格)

  // 模板
  template: '',            // 提示词模板文本

  // 收藏和限制
  favs: {},                // {en: true} 收藏的标签
  catLimits: {},           // {大类名: 上限} 随机数量限制
  scLimits: {},            // {"大类|子类": 上限}
  catModes: {},            // {"大类名": "cat"/"sc"} 随机模式
  hidden: {},              // 隐藏的分类和子类

  // ComfyUI
  comfyuiQueue: [],        // 任务队列 [{idx,body,done}]
  comfyuiRunning: false,   // 是否正在运行
  comfyuiStopped: false,   // 是否已终止
  wfSettings: {},          // 工作流参数 {文件名: {steps,cfg,...}}
  clipMaps: {},            // CLIP绑定 {文件名: {pos:"节点ID", neg:"节点ID"}}
  comfyuiLang: 'en',       // ComfyUI 语言

  // LLM 润色
  llmRunning: false,       // LLM 是否运行中
  llmHistory: [],          // 润色记录

  // 负面提示词预设
  negTemplate: '',         // 预设文本
  negTemplateAuto: false,  // 是否自动发送

  // 加载图片
  loadImage: null,         // {node_id, filename}

  // 其他
  undoStack: [],           // 撤销栈
  undoIdx: -1,
  tagMode: 'phrase',       // 标签模式 'phrase'/'single'
};
```

### localStorage 键名表

| 键名 | 内容 |
|------|------|
| `grimoire2_favs` | 收藏列表 `{en: true}` |
| `grimoire2_catLimits` | 大类随机上限 |
| `grimoire2_scLimits` | 子类随机上限 |
| `grimoire2_catModes` | 大类随机模式 |
| `grimoire2_allowNsfw` | NSFW 开关布尔值 |
| `grimoire2_randWeight` | 随机权重布尔值 |
| `grimoire2_spaceMode` | 空格模式 |
| `grimoire2_ui` | UI 状态（宽高/张数/种子/模板/工作流） |
| `grimoire2_llm` | LLM 配置 |
| `grimoire2_llmhist` | 润色记录 |
| `grimoire2_llm_presets` | 润色预设 |
| `grimoire2_templates` | 提示词模板列表 |
| `grimoire2_wfsettings` | 工作流参数设置 |
| `grimoire2_clipmaps` | CLIP 正负绑定 |
| `grimoire2_cuiUrl` | ComfyUI 地址 |
| `grimoire2_modelsel` | 模型选择 |
| `grimoire2_state` | 页面状态（展开的分类/移动Tab） |
| `grimoire2_tagMode` | 标签模式 |
| `grimoire2_locked` | 锁定标签列表 |
| `grimoire2_gallery` | 返图记录 |
| `grimoire2_negtpl` | 负面提示词预设 |
| `grimoire2_negtpl_list` | 负面预设列表 |
| `grimoire2_loadimg` | 加载的图片信息 |

---

## 四、后端 API 路由表

### 标签相关
| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/tags?mode=phrase\|single` | GET | 获取标签库 |
| `/api/search?q=&mode=` | GET | 搜索标签 |
| `/api/custom-tags` | GET | 获取自定义标签 |
| `/api/custom-tags/save` | POST | 覆盖自定义标签 |
| `/api/custom-tags/add` | POST | 添加单条标签 |
| `/api/custom-tags/delete` | POST | 删除标签 |
| `/api/custom-tags/edit` | POST | 编辑标签 |
| `/api/custom-tags/add-category` | POST | 新建大类 |
| `/api/custom-tags/delete-category` | POST | 删除大类 |
| `/api/custom-tags/add-subcategory` | POST | 新建子类 |
| `/api/custom-tags/delete-subcategory` | POST | 删除子类 |

### 预设相关
| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/presets` | GET | 获取内置+用户预设 |
| `/api/presets/save` | POST | 保存预设 `{name, tags[], weights{}, ...}` |
| `/api/presets/delete/<name>` | DELETE | 删除用户预设 |
| `/api/presets/export/<name>` | GET | 导出预设 |
| `/api/presets/import` | POST | 导入预设 |

### ComfyUI 相关
| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/comfyui/status` | GET | 在线状态 |
| `/api/comfyui/test-conn` | POST | 测试连接 |
| `/api/comfyui/set-url` | POST | 设置地址 |
| `/api/comfyui/workflows` | GET | 工作流列表 |
| `/api/comfyui/workflow-size?file=` | GET | 读取宽高 |
| `/api/comfyui/workflow-info?file=` | GET | 解析模型节点类型 |
| `/api/comfyui/loadimage-nodes?file=` | GET | 获取 LoadImage 节点列表 |
| `/api/comfyui/models` | GET | 获取可用模型 |
| `/api/comfyui/generate` | POST | 提交生成任务 |
| `/api/comfyui/result/<id>` | GET | 轮询结果 |
| `/api/comfyui/proxy-image` | GET | 代理图片（手机能访问） |
| `/api/comfyui/upload-image` | POST | 上传图片到 ComfyUI |

### LLM 相关
| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/llm/translate` | POST | 润色翻译 |
| `/api/llm/config` | GET | 获取 LLM 配置 |
| `/api/llm/config/save` | POST | 保存 LLM 配置 |
| `/api/llm/presets` | GET | 获取润色预设 |
| `/api/llm/presets/save` | POST | 保存润色预设 |

### 同步相关
| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/user/sync` | GET | 获取同步数据 |
| `/api/user/sync` | POST | 保存同步数据（深度合并） |

---

## 五、核心数据流

### 1. 标签选入 → 发送生图（完整链路）

```
用户点击标签
  → addTag(en, zh, panel)
    → S.posTags.push({en,zh,weight,...})
    → refreshPanel(panel)     # 更新右侧面板
    → updatePreview()         # 更新提示词预览
    → renderGrid()            # 刷新标签网格
    → saveLocked()            # 持久化锁定的标签

用户点击 🚀 生图
  → getCuiPrompt()            # 读取 preview 文本
  → _queueWithRefine(prompt, wf, w, h, count)
    → 如果开启自动润色:
        → _buildRawPrompt()  # 取正面部分
        → _callLlm(posOnly)  # 发给大模型
        → 返回后拼回 "--neg 负面标签"
    → _queueCuiPrompt(prompt, wf, w, h, count)
      → body = {prompt, workflow, width, height, overrides,
                rand_seed, wf_settings, clip_mapping,
                neg_template, load_image}
      → S.comfyuiQueue.push(...)
      → _execNextQueue() → api('/api/comfyui/generate')

服务端 server.py:
  → 加载工作流 JSON
  → 注入正面提示词到 CLIP 节点
  → 注入负面提示词（负面标签 + 负面预设）
  → 注入 loaded_image 到 LoadImage 节点
  → 应用宽高/参数/种子/模型覆盖
  → 发送到 ComfyUI
```

### 2. 数据同步流程（桌面 ↔ 手机）

```
任何数据修改
  → 对应的 saveXxx() 函数
    → localStorage.setItem(...)    # 本地保存
    → _syncSave({key:1})           # 推送到服务器

页面加载
  → loadXxx()                      # 从 localStorage 读
  → _syncLoad(callback)            # 从服务器拉取
    → 深度合并 → 覆盖 localStorage → 更新 UI

服务端 user_data/sync_data.json:
  {favs:{...}, catLimits:{...}, ...}
  POST 写入时做深度合并，不覆盖已有字段
```

### 3. 图片代理流程（手机能看 ComfyUI 返图）

```
桌面电脑:
  ComfyUI 在 127.0.0.1:8188
  Flask 在 0.0.0.0:5801

手机访问: 192.168.2.100:5801
  返图 URL: /api/comfyui/proxy-image?filename=...
  → Flask 转发到 ComfyUI → 返回图片流
```

---

## 六、关键函数速查

### 前端 `app.js`

| 函数 | 用途 |
|------|------|
| `init()` | 初始化入口，加载所有数据和状态 |
| `renderTree()` | 渲染桌面端左侧分类树 |
| `renderGrid()` | 渲染中间标签网格 |
| `refreshPanel(panel)` | 渲染右侧选中面板（正面/负面） |
| `updatePreview()` | 更新提示词预览 |
| `addTag(en,zh,panel)` | 添加标签到面板 |
| `removeTag(en,panel)` | 从面板移除标签 |
| `_genRandomTags(lockedPos)` | 随机生成标签（遵守防冲突规则） |
| `genPrompt(tags)` | 标签数组 → 提示词字符串 |
| `_queueCuiPrompt(p,wf,w,h,count)` | 将任务加入 ComfyUI 队列 |
| `_execNextQueue()` | 执行队列中的下一个任务 |
| `_pollComfyUI(promptId,start,qi)` | 轮询 ComfyUI 生成结果 |
| `_callLlm(prompt,callback)` | 调用 LLM API |
| `_buildRawPrompt()` | 构建完整原始提示词（含 `--neg`） |
| `_tagsToPrompt(pk)` | 标签数组 → 提示词（含模板） |
| `_updateMobileSelected()` | 更新手机端已选标签栏 |
| `_buildMobileDrawer()` | 构建手机端抽屉分类树 |
| `_syncSave(keys)` | 推送数据到服务器 |
| `_syncLoad(callback)` | 从服务器拉取并合并数据 |

### 后端 `server.py`

| 函数 | 用途 |
|------|------|
| `merge_tags()` | 合并内置标签 + 用户自定义标签 |
| `_load_tags(mode)` | 按模式加载标签库 |
| `read_json(path, def)` / `write_json(path, data)` | JSON 文件读写 |
| `_load_workflow_raw(name)` | 加载工作流文件 |
| `_getClipMapping()` | 前端调用，获取 CLIP 绑定 |
| `api_comfyui_generate()` | 核心生成逻辑 |
| `api_comfyui_result()` | 轮询生成结果 |
| `api_user_sync_save()` | 同步数据保存（深度合并） |

---

## 七、手机端适配机制

### 检测方式
```javascript
var _isMobile = window.innerWidth <= 768;
```

### 布局变化
- 桌面三栏 → 手机单栏 + 底部三 Tab
- 左侧分类树 → 左侧滑出抽屉（📁 分类按钮打开）
- 右侧面板 → 手机提示词 Tab
- ComfyUI 区 → 手机生图 Tab
- 免责声明 → 工具栏 ⚠ 按钮 → 弹窗

### 关键 DOM 元素
- `#m-tabbar` — 底部导航栏
- `#m-drawer` — 左侧抽屉
- `#m-overlay` — 抽屉遮罩
- `#m-selected-bar` — 标签网格下方已选标签区
- `#disclaimer-modal` — 手机端免责弹窗
- `<div id="m-tabbar" style="display:none">` — 桌面端隐藏

---

## 八、标签库防冲突逻辑

写入 `data/tags.json` 和 `data/tags_single.json` 的子类配置：

| 配置字段 | 作用 | 示例 |
|---------|------|------|
| `"type": "single"` | 子类级互斥，随机只抽 1 个 | 发型、发色、表情 |
| `"randomMode": "singlePool"` | 大类级，163 个标签中全局只抽 1 个 | 艺术风格 |
| `"poolGroup": "scene"` | 子类跨组共享，几个子类共享 1 个抽取名额 | 自然场景/城市建筑/室内场景 |

`_genRandomTags()` 函数实现三层防护，保证生成的提示词不自相矛盾。

---

## 九、常见 Bug 排查指南

### 手机端看不到图片
→ 检查 ComfyUI 地址是否配置正确（手机不能访问 127.0.0.1）
→ 图片 URL 是否走了 `/api/comfyui/proxy-image` 代理

### 刷新后数据丢失
→ 检查对应 `saveXxx()` 是否调用了 `_syncSave()`
→ 检查 `_syncLoad()` 是否处理了对应数据键
→ 检查服务器 `sync_data.json` 深度合并是否正确

### JS 卡死/页面无响应
→ 检查 `app.js` 是否有语法错误（打开浏览器控制台 F12）
→ 常见：括号不匹配、`if` 缺 `}`、引号未闭合
→ 用 `python -c "compile(open('static/app.js').read(),'app.js','exec')"` 快速检查语法

### ComfyUI 不生效
→ 检查工作流是否为 API 格式（在 ComfyUI 中 Export → API）
→ 检查 CLIP 节点是否正负绑定正确（🔗 正负绑定按钮）
→ 检查 ComfyUI 是否运行中（🌐 端口按钮测试连接）

---

## 十、添加新功能的规范

1. **状态变量**：需要在 `S` 对象中声明
2. **持久化**：添加 `loadXxx()` / `saveXxx()` 函数
3. **服务器同步**：在 `_syncSave()` 添加 `add('key', value)`
4. **服务器恢复**：在 `_syncLoad()` 添加对应处理
5. **手机端**：宽度检测 `_isMobile`，在 `_initMobile()` 中添加逻辑
6. **版本号**：每次修改 JS/CSS 后更新 `index.html` 中的 `?v=XX`
