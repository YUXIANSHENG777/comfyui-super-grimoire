# 超级无敌魔导书 — 开发者文档

> 技术架构、API、数据流、状态管理、调试指南

---

## 一、技术栈

| 层 | 技术 | 说明 |
|---|------|------|
| 后端 | Python 3 + Flask | 单文件 `server.py`，所有路由集中管理 |
| 前端 | 原生 JS（零框架）| 单文件 `app.js`，全局状态对象 `S` 统一管理 |
| 样式 | CSS 变量 + 媒体查询 | 桌面暗色主题，`@media (max-width: 768px)` 手机适配 |
| 存储 | SQLite + localStorage | 服务端 `sync.db`（事务安全），客户端 `localStorage`，双向同步 |
| AI 润色 | OpenAI 兼容 API | 支持 LM Studio / Ollama / 自定义 |
| 生图 | ComfyUI REST API | 通过 Flask 代理转发 |

---

## 二、项目文件结构

```
超级无敌魔导书/
├── server.py                  # Flask 后端，所有 API 路由
├── launch.py                  # 启动器，自动打开浏览器
├── start.bat                  # 双击启动
├── data/
│   ├── tags.json              # 短语标签库（14大类）
│   └── tags_single.json       # 单一标签库（14大类）
├── user_data/                  # 用户数据（自动创建）
│   ├── custom_tags.json       # 自定义标签
│   ├── presets/               # 用户保存的预设组合（JSON文件）
│   ├── history/               # 生图记录
│   ├── comfyui_config.json    # ComfyUI 连接地址
│   ├── llm_config.json        # LLM API 配置（桌面/手机共享）
│   ├── llm_presets.json       # 润色预设列表
│   ├── sync.db                # SQLite 同步数据（收藏/上限/模式/相册/隐藏等，v1.0.73+）
│   └── sync_data.json.bak     # 旧 JSON 同步数据备份（自动迁移后产生）
├── workflows/                  # ComfyUI API 格式工作流 JSON
├── screenshots/                # 界面截图
├── static/
│   ├── index.html             # 前端 HTML（所有弹窗、模态框）
│   ├── app-core.js            # 前端核心：S 对象、ICONS、通用工具函数
│   ├── app.js                 # 前端逻辑（标签、ComfyUI、相册、预览）
│   └── style.css              # 样式
└── DEV.md                     # 本文档
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
| `grimoire2_albums` | 相册数据 `[{id,name,images[{url,filename,prompt}]}]` |
| `grimoire2_active_album` | 当前活跃相册 ID |
| `grimoire2_bp` | 绑定路径列表 |
| `grimoire2_bottom_h` | 底部区域高度 |
| `grimoire2_hidden` | 隐藏的分类/子分类 |
| `grimoire2_ui_glass` | 全局透明度 (0-100) |
| `grimoire2_ui_blur` | 模糊程度 (0-40px) |
| `grimoire2_ui_left` | 左侧栏透明度 (0-100) |
| `grimoire2_ui_center` | 中间区域透明度 (0-100) |
| `grimoire2_ui_right` | 右侧面板透明度 (0-100) |
| `grimoire2_ui_theme` | 主题 `"dark"` / `"light"` |
| `grimoire2_ui_bg` | 自定义背景图 (base64) |
| `grimoire2_ui_ripple1` | 水面涟漪特效开关 |
| `grimoire2_ui_vanta_birds` | 3D 群鸟特效开关 |
| `grimoire2_ui_vanta_waves` | 3D 波浪特效开关 |
| `grimoire2_ui_wave_color` | 波浪颜色 Hex |

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
| `/api/llm/unload-model` | POST | 代理卸载 LM Studio 模型（避免跨域） |

### 同步相关
| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/user/sync` | GET | 获取同步数据（从 SQLite 读取） |
| `/api/user/sync` | POST | 保存同步数据（深度合并，写入 SQLite 事务） |

### 绑定路径 & 回收站 & 图片元数据
| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/bind/scan` | POST | 扫描 output 文件夹，返回所有图片（最新在前） |
| `/api/bind/img` | GET | 直接提供绑定目录的图片文件 |
| `/api/bind/delete` | POST | 删除文件到 Windows 回收站 |
| `/api/bind/delete-by-filename` | POST | 按文件名在绑定路径中搜索删除到回收站 |
| `/api/bind/meta` | POST | 本地 PNG 元数据读取，解析 tEXt 块提取 CLIP 提示词；**v1.0.72** 增强：按图连接（KSampler positive/negative 链路）准确分离正面/负面提示词；**v1.0.73** 增强：按路径 hash + mtime 缓存，删除时自动清除缓存 |
| `/api/bind/resolve-path` | POST | 根据文件名在绑定路径中搜索，返回完整路径 |
| `/api/comfyui/image-meta` | GET | 读取 PNG 元数据（生成参数，需 ComfyUI 运行） |
| `/api/update/changelog` | GET | 返回 CHANGELOG.md 最新 3 个版本的更新日志 |
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
  Flask 在 0.0.0.0:5802

手机访问: 192.168.2.100:5802
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
| `_pollComfyUI(promptId,start,qi)` | 轮询 ComfyUI 生成结果（含步数进度估算） |
| `_connectCuiWS(clientId,promptId,start,qi,url)` | WebSocket 连接 ComfyUI 获取实时进度 |
| `_openResolutionPicker()` | 打开常用分辨率选择弹窗 |
| `_resSwitchTab(tab)` | 切换分辨率面板（竖屏/方图/横屏） |
| `_sortAlbumImages(arr,mode)` | 相册图片排序（8 种模式） |
| `_loadAllDims(images,cb)` | 异步加载图片真实尺寸（缓存后复用） |
| `_galleryReRender()` | 重建返图区 DOM，重新应用相册隐藏状态 |
| `_unloadLLM()` | 润色后释放显存（Ollama keep_alive=0 / LM Studio API） |
| `_playNotifSound()` | 生图完成播放提示音（Web Audio API） |
| `_showDesktopNotification(title,body)` | 浏览器桌面通知 |
| `_connectCuiWS(clientId,promptId,start,qi,url)` | WebSocket 连接 ComfyUI 获取实时进度 |
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

检测方式：`var _isMobile = window.innerWidth <= 768;`

| 桌面 | 手机 |
|------|------|
| 三栏布局 | 单栏 + 底部三 Tab |
| 左侧分类树 | 左侧滑出抽屉（📁 分类按钮打开） |
| 右侧面板 | 手机提示词 Tab |
| ComfyUI 区 | 手机生图 Tab |
| 免责声明 | 工具栏 ⚠ 按钮 → 弹窗 |

关键 DOM：
- `#m-tabbar` — 底部导航栏
- `#m-drawer` — 左侧抽屉
- `#m-overlay` — 抽屉遮罩
- `#m-selected-bar` — 标签网格下方已选标签区

---

## 八、标签库防冲突逻辑

写入 `data/tags.json` 和 `data/tags_single.json` 的子类配置：

| 配置字段 | 作用 | 示例 |
|---------|------|------|
| `"type": "single"` | 子类级互斥，随机只抽 1 个 | 发型、发色、表情 |
| `"randomMode": "singlePool"` | 大类级，全部标签中全局只抽 1 个 | 艺术风格 |
| `"poolGroup": "scene"` | 子类跨组共享，几个子类共享 1 个抽取名额 | 自然场景/城市建筑/室内场景 |

`_genRandomTags()` 函数实现三层防护，保证生成的提示词不自相矛盾。

---

## 九、常见 Bug 排查指南

- **手机端看不到图片** → 检查 ComfyUI 地址（手机不能访问 127.0.0.1）→ 图片 URL 是否走了 `/api/comfyui/proxy-image` 代理
- **手机端返图区不显示** → 检查 `#comfyui-gallery` 容器是否存在，切换生图 Tab 后是否正确放置
- **提示词显示"（无）"** → 扫描的 PNG 图片通过 `/api/bind/meta` 读取本地元数据（无需 ComfyUI），预览后自动缓存；收藏时需确认 `path` 字段一并保存（`_saveToAlbum` 已修复）
- **正面提示词里出现负面提示词** → `/api/bind/meta` v1.0.72 改为图连接追踪分离正/负面；客户端统一用 `d.positive` 显示
- **返图区上百张图片卡顿** → v1.0.73 引入 IntersectionObserver 懒加载，仅渲染视口内图片
- **同步数据损坏警告** → v1.0.73 迁移到 SQLite，事务安全，零损坏风险
- **同名文件冲突**（不同绑定文件夹的同名图片相互覆盖）→ v1.0.73 所有判重逻辑统一使用 `url`（含文件夹路径），不再依赖 `filename`
- **相册删图后图片不回到返图区** → v1.0.74 `_removeFromAlbum`、网格删除、批量删除均补回 `_galleryImages` 并刷新
- **扫描加载图片误入相册** → v1.0.75 `_restoreScanBtn` 中重置 `_importMode`，关闭弹窗后标记清零
- **No Human 随机时锁定标签被删除** → v1.0.75 改为删除 `no human` 本身，保留锁定标签
- **刷新后数据丢失** → 检查 `saveXxx()` 是否调用了 `_syncSave()` → `_syncLoad()` 是否处理了对应数据键
- **JS 卡死** → F12 看报错 → `python -c "compile(open('static/app.js').read(),'app.js','exec')"` 快速检查语法
- **ComfyUI 不生效** → 工作流是否为 API 格式 → CLIP 绑定是否正确 → ComfyUI 是否运行中

---

## 十、添加新功能的规范

1. **状态变量** → 在 `S` 对象中声明
2. **持久化** → 添加 `loadXxx()` / `saveXxx()` 函数
3. **服务器同步** → 在 `_syncSave()` 添加 `add('key', value)`
4. **服务器恢复** → 在 `_syncLoad()` 添加对应处理
5. **手机端** → `_isMobile` 检测，在 `_initMobile()` 中添加逻辑
6. **版本号** → 修改 JS/CSS 后更新 `?v=XX`
