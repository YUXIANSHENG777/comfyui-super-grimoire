/* 语言切换 - B方案增强版：MutationObserver 实时翻译动态内容 */
(function(){
  var lang = localStorage.getItem('grimoire2_lang') || 'zh';
  document.documentElement.lang = lang;

  // ==================== 精确匹配表 ====================
  var MAP = {
    // ---- 工具栏 ----
    '✨ 基础质量词': '✨ Quality Tags',
    '🎲 手气不错': '🎲 Lucky',
    '🔞 NSFW': '🔞 NSFW',
    '⚖ 随机权重': '⚖ Rand Weight',
    '📄 批量导出': '📄 Export',
    '🔄 检查更新': '🔄 Check Update',
    '🗑 清空全部': '🗑 Clear All',
    '❓ 使用说明': '❓ Guide',

    // ---- 左侧面板 ----
    '📁 标签分类': '📁 Categories',
    '⭐ 我的收藏': '⭐ Favorites',
    '📦 预设组合': '📦 Presets',
    '🕐 历史记录': '🕐 History',
    '💾 随机配置': '💾 Rand Profiles',
    '📋 短语标签': '📋 Phrase Tags',
    '🏷 单一标签': '🏷 Single Tags',
    '💾 随机配置方案': '💾 Rand Profiles',

    // ---- 手机端 ----
    '点子类浏览 · 右侧 +/- 控制每次随机上限': 'Subcategory browser · Right +/- controls random limit',

    // ---- 右侧面板 ----
    '自然语言排序': 'Natural Sort',
    '点击左侧标签添加到此处': 'Click tags on the left to add',
    '📝 生成的提示词': '📝 Generated Prompt',
    '📋 复制英文': '📋 Copy EN',
    '📋 复制中文': '📋 Copy CN',
    '📝 批量添加': '📝 Batch Add',
    '💾 保存预设': '💾 Save Preset',
    '⚡ 权重': '⚡ Weight',
    '🔄 空隔转换': '🔄 Space Mode',
    '🚀 允许并发（性能强可开启）': '🚀 Concurrent (fast GPU)',

    // ---- 关闭/空格转换 ----
    '关闭': 'Off',
    '空格→_': 'Space→_',
    '_→空格': '_→Space',

    // ---- 提示词模板 ----
    '📐 提示词模板 ▾': '📐 Prompt Template ▾',
    '📐 提示词模板 ▴': '📐 Prompt Template ▴',
    '🚫 负面提示词预设 ▾': '🚫 Negative Preset ▾',
    '🚫 负面提示词预设 ▴': '🚫 Negative Preset ▴',

    // ---- LLM/AI润色 ----
    '🤖 AI润色 ▾': '🤖 AI Refine ▾',
    '🤖 AI润色 ▴': '🤖 AI Refine ▴',
    '🤖 发送润色': '🤖 Send Refine',
    '📋 复制结果': '📋 Copy Result',
    '💾 保存': '💾 Save',
    '📂 加载预设': '📂 Presets',
    '📜 润色记录': '📜 History',
    '发送语言: 英文标签': 'Send: EN Tags',
    '发送语言: 中文标签': 'Send: CN Tags',
    '🎨 生图前自动润色': '🎨 Auto-refine',
    '📂 加载': '📂 Load',
    '💾 保存预设': '💾 Save Preset',
    '📜 润色记录': '📜 History',

    // ---- ComfyUI ----
    '🎨 ComfyUI 使用说明': '🎨 ComfyUI Guide',
    '🎨 ComfyUI': '🎨 ComfyUI',
    '🚀 生图': '🚀 Generate',
    '🔗 正负绑定': '🔗 CLIP Bind',
    '⚙ 工作流参数': '⚙ WF Params',
    '🌐 端口': '🌐 Port',
    '🎭 模型': '🎭 Models',
    '🎲 随机生图': '🎲 Random Gen',
    '✏ 手写生图': '✏ Manual Gen',
    '🖼 加载图片': '🖼 Load Image',
    '🎲 随机种子': '🎲 Random Seed',
    '⏹ 终止': '⏹ Stop',
    '宽': 'W',
    '高': 'H',
    '张': 'N',

    // ---- 图库 ----
    '🖼 生成结果': '🖼 Results',
    '清空': 'Clear',

    // ---- 弹窗按钮 ----
    '关闭': 'Close',
    '取消': 'Cancel',
    '保存': 'Save',
    '确定': 'OK',
    '导入': 'Import',
    '创建': 'Create',
    '清空记录': 'Clear History',
    '⬇ 自动更新': '⬇ Auto Update',
    '忽略': 'Ignore',
    '添加到正面': 'Add Positive',
    '添加到负面': 'Add Negative',
    '导出 TXT': 'Export TXT',
    '批量添加': 'Batch Add',
    '批量删除': 'Batch Delete',
    '✚ 添加': '✚ Add',
    '✚ 批量添加': '✚ Batch Add',
    '🗑 批量删除': '🗑 Batch Delete',

    // ---- 弹窗标题 ----
    '📝 批量添加标签': '📝 Batch Add Tags',
    '保存预设': 'Save Preset',
    '导入预设': 'Import Preset',
    '新建大类': 'New Category',
    '新建子类别': 'New Subcategory',
    '✚ 批量添加标签': '✚ Batch Add Tags',
    '🗑 批量删除标签': '🗑 Batch Delete Tags',
    '📄 批量导出随机提示词': '📄 Batch Export Random Prompts',
    '添加标签': 'Add Tag',
    '编辑标签': 'Edit Tag',
    '📂 润色预设': '📂 Refine Presets',
    '🖼 加载图片到 ComfyUI': '🖼 Load Image to ComfyUI',
    '🔗 正负面提示词绑定': '🔗 CLIP Bind Setup',
    '⚙ 工作流参数设置': '⚙ Workflow Settings',
    '🎭 选择模型 & LoRA': '🎭 Select Model & LoRA',
    '🌐 ComfyUI 连接设置': '🌐 ComfyUI Connection',
    '💾 随机配置方案': '💾 Random Config Profiles',
    '📂 加载模板': '📂 Load Template',
    '📂 反推预设': '📂 Reverse Presets',
    '📜 润色记录': '📜 Refine History',
    '✏ 手写正向提示词生图': '✏ Manual Prompt Gen',
    '📝 正面提示词': '📝 Positive Prompt',

    // ---- 按钮文本（动态设置） ----
    '🗑 清空': '🗑 Clear',
    '添加标签': 'Add Tag',
    '✚ 批量添加': '✚ Batch Add',
    '🗑 批量删除': '🗑 Batch Delete',
    '✚ 添加第一个标签': '✚ Add First Tag',
    '点击标签旁的 ⭐ 收藏': 'Click ⭐ on tags to favorite',

    // ---- 动态状态消息 ----
    '暂无生图记录': 'No generation history',
    '暂无保存的预设': 'No saved presets',
    '暂无保存的方案': 'No saved profiles',
    '暂无润色记录': 'No refine history',
    '暂无收藏': 'No favorites',
    '暂无预设': 'No presets',
    '此子类别暂无标签': 'No tags in this subcategory',
    '未找到相关标签': 'No tags found',
    '请从左侧选择一个子类别开始浏览': 'Select a subcategory from the left',
    '请从左侧选择一个子类别': 'Select a subcategory',
    '⏳ 生成中...': '⏳ Generating...',
    '未检测': 'Not detected',
    '手动标注': 'Manual Note',
    '✅ 已是最新版本': '✅ Already latest',
    '❌ 检查失败，请确保能访问 GitHub': '❌ Check failed, ensure GitHub access',

    // ---- 标签模式按钮文本 ----
    '📋 短语标签': '📋 Phrase Tags',
    '🏷 单一标签': '🏷 Single Tags',

    // ---- 模板区按钮 ----
    '💾 保存': '💾 Save',
    '📂 加载': '📂 Load',
    '重置': 'Reset',
    '💾 保存预设': '💾 Save Preset',
    '📂 加载预设': '📂 Presets',
    '📜 润色记录': '📜 History',

    // ---- Toast 消息 ----
    '已清空全部标签': 'All tags cleared',
    '已清空所有生图记录': 'All history cleared',
    '已清空待处理队列': 'Queue cleared',
    '已复制提示词': 'Prompt copied',
    '已复制英文提示词!': 'Copied EN prompt!',
    '已复制中文提示词!': 'Copied CN prompt!',
    '标签已添加': 'Tag added',
    '标签已更新': 'Tag updated',
    '添加失败': 'Add failed',
    '更新失败': 'Update failed',
    '创建失败': 'Create failed',
    '删除失败': 'Delete failed',
    '大类已创建': 'Category created',
    '子类别已创建': 'Subcategory created',
    '请输入名称': 'Please enter a name',
    '请输入英文标签': 'Please enter English tag',
    '提示词为空': 'Prompt is empty',
    '请先选择工作流': 'Please select a workflow first',
    '请先选择标签': 'Please select tags first',
    '没有可复制的内容': 'Nothing to copy',
    '数据未加载': 'Data not loaded',
    'JSON格式错误': 'Invalid JSON format',
    '缺少名称': 'Name required',
    '需要视觉模型，请先配置大模型': 'Vision model required, configure LLM first',
    '请先选择一张图片': 'Please select an image first',
    '准备下载...': 'Preparing download...',
    '已发送': 'Sent',
    '⬆ 上传并绑定': '⬆ Upload & Bind',
    '🗑 清除绑定': '🗑 Clear Binding',
    '🔄 反推并生图': '🔄 Reverse & Generate',
    '✅ 应用并关闭': '✅ Apply & Close',
    '💾 保存并关闭': '💾 Save & Close',
    '💾 保存当前配置': '💾 Save Config',
    '🔍 测试连接': '🔍 Test Connection',
    '💾 保存': '💾 Save',

    // ---- 手机端标签栏 ----
    '标签': 'Tags',
    '提示词': 'Prompts',
    '生图': 'Generate',

    // ---- 免责声明 ----
    '⚠ 免责声明': '⚠ Disclaimer',
    '⚠️ 免责声明': '⚠️ Disclaimer',
    '⚠️ 免责声明：本工具仅供学习交流使用，使用者对生成内容承担全部责任，AI 生成可能存在偏差请理性辨别': '⚠️ Disclaimer: For learning & research only. Users bear full responsibility. AI results may contain bias, please judge rationally.',
    '本工具仅供学习、研究和交流使用。用户在使用本工具生成 AI 绘画提示词及图像时，应遵守相关法律法规及 AI 平台的使用条款。': 'This tool is for learning, research, and communication only. Users must comply with laws and AI platform ToS when generating prompts and images.',
    '使用者须对生成内容承担全部责任，包括但不限于确保内容不侵犯他人合法权益、不违反公序良俗。本工具开发者不对用户使用本工具产生的任何内容及后果承担任何法律责任。': 'Users bear full responsibility for generated content, including non-infringement and compliance with public order. The developer assumes no liability for any content or consequences.',
    'AI 生成内容可能存在偏差或不当之处，请理性辨别和使用。': 'AI-generated content may contain bias or inaccuracies. Please use with discretion.',
    '点击查看完整免责声明': 'Click to view full disclaimer',

    // ---- 更新弹窗 ----
    '🆕 发现新版本！': '🆕 New Version Available!',



    // ---- 弹窗内部标签 ----
    '添加标签到当前子类别': 'Add tag to subcategory',
    '批量添加标签到当前子类别': 'Batch add tags',
    '批量删除标签': 'Batch delete tags',
    '取消收藏': 'Unfavorite',
    '导出': 'Export',
    '删除': 'Delete',
    '我的': 'Mine',
    '加载': 'Load',
    '重置': 'Reset',
  };

  // ==================== 关键词替换表（部分匹配） ====================
  var KW = {
    '已选 ': 'Selected ',
    ' 个': '',
    '搜索标签 (中/英文)...': 'Search tags (EN/CN)...',
    '🔍 搜索标签 (中/英文)...': '🔍 Search tags (EN/CN)...',
    // 动态拼接文本
    '搜索: ': 'Search: ',
    '找到 ': 'Found ',
    ' 个标签，分布在 ': ' tags across ',
    ' 个子类别': ' subcategories',
    ' 个)': ')',
    '已加载: ': 'Loaded: ',
    '已删除分类: ': 'Deleted category: ',
    '已删除子类别: ': 'Deleted subcategory: ',
    '已删除标签: ': 'Deleted tag: ',
    '已导入: ': 'Imported: ',
    '失败: ': 'Failed: ',
    '删除失败: ': 'Delete failed: ',
    '发送失败: ': 'Send failed: ',
    '还需': 'Need ',
    '次': ' more',
    '再点': 'Click ',
    '队列: ': 'Queue: ',
    '-- 选择工作流 --': '-- Select Workflow --',
    // Toast 消息（带变量）
    '已复制提示词': 'Prompt copied',
    // 提示词模板区 tips（HTML标签切分后的文本片段）
    ' = 标签组合位置，前后可加固定文字': ' = tag position, prepend/append fixed text',
    '用途': 'Usage',
    '：放 LoRA 触发词、画风前缀等，': ': LoRA triggers, style prefixes, etc. ',
    'AI润色不会影响模板内容': 'AI refine won\'t affect template',
    '例：': 'e.g.: ',
    '留空不使用模板。': 'Leave empty to disable template.',
    // 负面提示词预设区 tips
    '这里的负面提示词会': 'These negative prompts will be',
    '自动附加': 'auto-appended',
    '到每次 ComfyUI 生图的负面节点。': 'to every ComfyUI generation\'s negative node.',
    '与你在负面面板选的标签': 'Combined with negative panel tags',
    '叠加生效': 'stacked together',
    '，互不影响。': ', no conflicts.',
    '🚀 生图时自动发送': '🚀 Auto-send on generate',
    // AI润色区 tips
    '将标签提示词发送给大模型，转为自然语言描述。': 'Send tags to LLM for natural language conversion.',
    // 其他常见片段
    '例如：': 'e.g.: ',
    '，系统会自动查找匹配的标签添加到当前面板。': ', matched tags will be auto-added.',
    '输入标签名称（英文或中文），用逗号、空格或换行分隔。': 'Enter tag names (EN or CN), separated by commas, spaces, or newlines.',
    // 更新面板
    '最新 ': 'Latest ',
    '，当前 v': ', current v',
    '点击自动更新将下载并安装新版本': 'Click to download and install new version',
  };

  // ==================== Title 属性翻译 ====================
  var TITLES = {
    '添加标签到当前子类别': 'Add tag to current subcategory',
    '批量添加标签到当前子类别': 'Batch add tags to current subcategory',
    '批量删除标签': 'Batch delete tags',
    '删除标签(需连点2次)': 'Delete tag (double-click)',
    '删除分类(需连点6次)': 'Delete category (6 clicks)',
    '删除子类别(需连点6次)': 'Delete subcategory (6 clicks)',
    '添加子类别': 'Add subcategory',
    '新建大类': 'New category',
    '切换标签库：短语标签 ↔ 单一标签': 'Switch: Phrase ↔ Single tags',
    '随机上限(0=不取)': 'Random limit (0=skip)',
    '取消收藏': 'Unfavorite',
    '导出': 'Export',
    '删除': 'Delete',
    '主题': 'Theme',
    '下载原图': 'Download original',
    '正面提示词': 'Positive prompt',
    '清空所有图片': 'Clear all images',
    '免责声明': 'Disclaimer',
    '关闭': 'Close',
    '上一张': 'Previous',
    '下一张': 'Next',
    '缩小': 'Zoom out',
    '放大': 'Zoom in',
    '原始大小': 'Original size',
    '适应窗口': 'Fit to window',
    '保存当前模板': 'Save template',
    '加载已保存的模板': 'Load saved template',
    '保存当前': 'Save current',
    '加载已保存': 'Load saved',
    '保存当前指令为预设': 'Save as preset',
    '加载已保存的反推预设': 'Load reverse preset',
    'ComfyUI使用说明 & 玩法指南': 'ComfyUI guide & tips',
    'Switch Language': '切换语言',
    '目标: ': 'Target: ',
    '提示词模板 - 在标签前后添加固定内容': 'Prompt template - prepend/append fixed text',
    '将标签提示词发送给大模型，转为自然语言描述。': 'Send tags to LLM for natural language conversion.',
    '将图片发给视觉大模型，反推出提示词，再自动发送到 ComfyUI 生图。': 'Send image to vision LLM for reverse prompt, then auto-generate.',
    '导入预设': 'Import preset',
  };

  // ==================== 分类名翻译 ====================
  var CAT = {
    '画质与渲染': 'Quality & Rendering',
    '艺术风格': 'Art Style',
    '构图与视角': 'Composition & View',
    '人物主体': 'Character Subject',
    '发型与发色': 'Hair & Color',
    '五官与表情': 'Face & Expression',
    '服装与配饰': 'Clothing & Accessories',
    '场景与背景': 'Scene & Background',
    '色彩与氛围': 'Color & Atmosphere',
    '动作姿态': 'Pose & Action',
    '物品与道具': 'Items & Props',
    '动植物与自然': 'Flora & Fauna',
    '负面提示词': 'Negative Prompts',
    '日系美少女': 'JP Bishoujo',
    '赛博朋克': 'Cyberpunk',
    '奇幻仙境': 'Fantasy Realm',
    '武侠古风': 'Wuxia Ancient',
  };

  // ==================== 子类名翻译 ====================
  var SCAT = {
    '品质保证': 'Quality Assurance',
    '光影效果': 'Lighting & Shadow',
    '渲染特效': 'Render Effects',
    '绘画媒介': 'Painting Media',
    '数字艺术': 'Digital Art',
    '经典风格': 'Classic Styles',
    '现代潮流': 'Modern Trends',
    '地域文化风格': 'Regional Styles',
    '动漫画风': 'Anime/Manga',
    '游戏画风': 'Game Art',
    '镜头景别': 'Shot Types',
    '视角方向': 'View Angles',
    '构图法则': 'Composition Rules',
    '镜头效果': 'Lens Effects',
    '人数与性别': 'Count & Gender',
    '职业身份': 'Occupation',
    '幻想种族': 'Fantasy Races',
    '日漫女角色': 'Anime Female',
    '日漫男角色': 'Anime Male',
    '游戏女角色': 'Game Female',
    '游戏男角色': 'Game Male',
    '体型特征': 'Body Type',
    '发型': 'Hairstyles',
    '发色': 'Hair Colors',
    '眼睛': 'Eyes',
    '表情': 'Expressions',
    '面部细节': 'Facial Details',
    '脸型': 'Face Shapes',
    '妆容': 'Makeup',
    '日常服装': 'Daily Wear',
    '特殊服饰': 'Special Attire',
    '战甲武装': 'Armor & Combat',
    '鞋袜': 'Footwear',
    '配饰装饰': 'Accessories',
    '自然风景': 'Nature Scenery',
    '城市建筑': 'Urban & Architecture',
    '室内场景': 'Indoor Scenes',
    '天空天气': 'Sky & Weather',
    '色调': 'Color Tone',
    '氛围': 'Atmosphere',
    '静态姿态': 'Static Poses',
    '动态动作': 'Dynamic Actions',
    '互动姿态': 'Interaction Poses',
    '手部姿态': 'Hand Gestures',
    '武器': 'Weapons',
    '日常物品': 'Daily Items',
    '奇幻物品': 'Fantasy Items',
    '动物': 'Animals',
    '植物花卉': 'Plants & Flowers',
    '自然元素': 'Natural Elements',
    '画质缺陷': 'Quality Defects',
    '内容过滤': 'Content Filter',
    '暴露程度': 'Exposure Level',
    '暧昧氛围': 'Intimate Mood',
    '亲密互动': 'Intimate Interaction',
    '氛围暗示': 'Mood Hints',
    '神态暗示': 'Expression Hints',
    'NSFW': '🔞 NSFW',
  };

  // ==================== 合并类别名到关键词替换表 ====================
  // 处理 "品质保证 (5)"、"画质与渲染 › 品质保证 (5个)" 等模式
  (function(){
    // 按长度降序排列，避免短词匹配到长词的一部分
    var keys = [];
    for (var k in CAT) { keys.push(k); }
    for (var k in SCAT) { keys.push(k); }
    keys.sort(function(a,b){ return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var en = CAT[k] || SCAT[k];
      if (!KW.hasOwnProperty(k)) KW[k] = en;
    }
  })();

  // ==================== 翻译函数 ====================
  // 缓存排序后的 KW 键名
  var _sortedKwKeys = null;
  function _getSortedKwKeys() {
    if (_sortedKwKeys) return _sortedKwKeys;
    _sortedKwKeys = Object.keys(KW);
    _sortedKwKeys.sort(function(a, b) { return b.length - a.length; });
    return _sortedKwKeys;
  }

  function translateNode(node) {
    if (!node || node.nodeType !== 3) return;
    var text = node.textContent;
    if (!text || !text.trim()) return;

    // 1. 精确匹配（包括带首尾空白的）
    if (MAP.hasOwnProperty(text)) { node.textContent = MAP[text]; return; }
    // 1b. Trim 后精确匹配（处理类似 "⭐ 我的收藏 " 带尾部空格的情况）
    var trimmed = text.trim();
    if (trimmed !== text && MAP.hasOwnProperty(trimmed)) {
      node.textContent = MAP[trimmed];
      return;
    }

    // 2. 分类名精确匹配
    if (CAT.hasOwnProperty(trimmed)) { node.textContent = CAT[trimmed]; return; }

    // 3. 子类名精确匹配
    if (SCAT.hasOwnProperty(trimmed)) { node.textContent = SCAT[trimmed]; return; }

    // 4. 关键词替换（支持链式：'已选 5 个' → 'Selected 5'）
    //    键按长度降序，确保 "氛围暗示" 先于 "氛围" 匹配
    var changed = false;
    var result = text;
    var kwKeys = _getSortedKwKeys();
    for (var i = 0; i < kwKeys.length; i++) {
      var k = kwKeys[i];
      if (result.indexOf(k) >= 0) {
        result = result.split(k).join(KW[k]);
        changed = true;
      }
    }
    if (changed && result !== text) {
      node.textContent = result;
    }
  }

  function translateTitle(el) {
    if (!el || !el.title) return;
    var t = el.title;
    if (TITLES.hasOwnProperty(t)) { el.title = TITLES[t]; return; }
    // 也检查分类/子类名
    if (CAT.hasOwnProperty(t)) { el.title = CAT[t]; return; }
    if (SCAT.hasOwnProperty(t)) { el.title = SCAT[t]; return; }
  }

  // ==================== Placeholder 翻译 ====================
  var PLACEHOLDERS = {
    '搜索标签 (中/英文)...': 'Search tags (EN/CN)...',
    '🔍 搜索标签 (中/英文)...': '🔍 Search tags (EN/CN)...',
    '选择标签后这里会显示完整提示词...': 'Select tags to see the full prompt...',
    '例如：score_9, score_8_up, {tags}': 'e.g.: score_9, score_8_up, {tags}',
    '例如：low quality, blurry, bad anatomy': 'e.g.: low quality, blurry, bad anatomy',
    '或中文：低质量, 模糊, 结构崩坏': 'or CN: 低质量, 模糊, 结构崩坏',
    'API地址: http://127.0.0.1:1234/v1': 'API URL: http://127.0.0.1:1234/v1',
    '模型名: gpt-4o-mini / qwen2.5': 'Model: gpt-4o-mini / qwen2.5',
    'API Key（本地可留空）': 'API Key (leave empty for local)',
    '系统指令（给大模型的条件）': 'System prompt (LLM instructions)',
    '输入预设名称...': 'Enter preset name...',
    '输入标签名称（英文或中文），用逗号、空格或换行分隔。系统会自动查找匹配的标签添加到当前面板。': 'Enter tag names (EN/CN), separated by commas, spaces, or newlines.',
    '例如: 1girl, smile, sunset, masterpiece': 'e.g.: 1girl, smile, sunset, masterpiece',
    '或每行一个': 'or one per line',
    '粘贴预设JSON数据...': 'Paste preset JSON...',
    '大类名称': 'Category name',
    '子类别名称': 'Subcategory name',
    '例如:': 'e.g.:',
    '英文标签': 'English tag',
    '中文翻译 (可选)': 'Chinese translation (optional)',
    '方案名称，如：人物特写、风景大片': 'Profile name, e.g.: portrait, landscape',
    '在这里写正面提示词...': 'Write positive prompt here...',
    '系统指令：描述你想让大模型如何反推图片提示词...': 'System prompt: describe how the LLM should reverse the image...',
    '每行一个标签，英文和中文用逗号分隔（中文可选）': 'One tag per line, EN and CN separated by comma (CN optional)',
    '每行一个标签关键词（英文或中文），将删除匹配的标签': 'One tag per line (EN or CN), matching tags will be deleted',
  };

  function translatePlaceholder(el) {
    if (!el || !el.placeholder) return;
    var t = el.placeholder;
    if (PLACEHOLDERS.hasOwnProperty(t)) { el.placeholder = PLACEHOLDERS[t]; return; }
    // 检查分类/子类名
    if (CAT.hasOwnProperty(t)) { el.placeholder = CAT[t]; return; }
    if (SCAT.hasOwnProperty(t)) { el.placeholder = SCAT[t]; return; }
  }

  function _shouldSkip(el) {
    if (!el || !el.tagName) return true;
    var tag = el.tagName;
    return tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' ||
           tag === 'INPUT' || tag === 'CODE' || tag === 'PRE' || tag === 'NOSCRIPT';
  }

  function walk(root) {
    if (!root) return;
    try {
      // 先翻译 root 自身的 title（仅元素节点）
      if (root.nodeType === 1 && !_shouldSkip(root)) {
        translateTitle(root);
      }
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      var node;
      while ((node = walker.nextNode())) {
        if (_shouldSkip(node.parentNode)) continue;
        translateNode(node);
      }
      // 遍历所有有 title 的元素（仅元素节点）
      if (root.nodeType === 1 && !_shouldSkip(root)) {
        var titled = root.querySelectorAll('[title]');
        for (var i = 0; i < titled.length; i++) {
          translateTitle(titled[i]);
        }
        // 翻译 placeholder 属性
        var phElems = root.querySelectorAll('[placeholder]');
        for (var i = 0; i < phElems.length; i++) {
          translatePlaceholder(phElems[i]);
        }
      }
    } catch(e) {
      // 静默忽略错误，避免影响页面
    }
  }

  // ==================== MutationObserver ====================
  var _observer;

  function _observeBody() {
    _observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function startObserver() {
    if (_observer) return;
    _observer = new MutationObserver(function(mutations) {
      // 断开监听，避免自身修改触发级联循环导致页面卡死
      _observer.disconnect();
      try {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type === 'childList') {
            for (var j = 0; j < m.addedNodes.length; j++) {
              walk(m.addedNodes[j]);
            }
          }
          if (m.type === 'characterData') {
            translateNode(m.target);
          }
        }
      } catch(e) {
        // 静默忽略
      }
      // 重新连接，继续监听后续变化
      _observeBody();
    });
    _observeBody();
  }

  // ==================== 执行翻译 ====================
  function doTranslate() {
    if (lang === 'zh') return;
    walk(document.body);

    // 更新语言按钮
    var btn = document.getElementById('btn-lang-switch');
    if (btn) btn.textContent = '中文';

    // 标题更新
    document.title = document.title
      .replace('超级无敌魔导书', 'Super Grimoire')
      .replace(/v\d+\.\d+\.\d+/, (document.title.match(/v\d+\.\d+\.\d+/) || [''])[0]);

    // app标题
    var t = document.querySelector('.app-title');
    if (t) {
      var span = t.querySelector('span');
      if (span) {
        var v = (span.textContent.match(/v\d+\.\d+\.\d+/) || [''])[0];
        span.textContent = v;
      }
      // "超级无敌魔导书" → "Super Grimoire"
      var cn = t.childNodes[0];
      if (cn && cn.nodeType === 3 && cn.textContent.indexOf('超级') >= 0) {
        cn.textContent = cn.textContent.replace('超级无敌魔导书', 'Super Grimoire');
      }
    }

    // ===== 使用说明模态框完整翻译 =====
    var helpModal = document.getElementById('modal-comfyui-help');
    if (helpModal) {
      var divs = helpModal.querySelectorAll('div');
      for (var hi = 0; hi < divs.length; hi++) {
        var d = divs[hi];
        if (d.style && d.style.lineHeight === '1.9') {
          var h = d.innerHTML;
          // 标题行
          h = h.replace(/>🚀 首次配置</g, '>🚀 First Setup</');
          h = h.replace(/>🎮 四种生图方式</g, '>🎮 4 Ways to Generate</');
          h = h.replace(/>🤖 AI润色说明</g, '>🤖 AI Refine Guide</');
          h = h.replace(/>📦 队列 &amp; 返图</g, '>📦 Queue & Results</');
          h = h.replace(/>💡 技巧</g, '>💡 Tips</');
          // 首次配置
          h = h.replace(/ComfyUI中导出工作流：/g, 'Export workflow in ComfyUI: ');
          h = h.replace(/保存JSON到 /g, 'save JSON to ');
          h = h.replace(/文件夹/g, 'folder');
          h = h.replace(/刷新页面 → 下拉选择工作流 → 🔗 /g, 'Refresh page → select workflow → 🔗 ');
          h = h.replace(/正负绑定/g, 'CLIP Bind');
          h = h.replace(/指定CLIP节点 → 💾 保存/g, 'assign CLIP nodes → 💾 Save');
          h = h.replace(/设宽高\/张数 → ⚙ 调采样器\/步数\/CFG → 🎭 选模型\/权重/g, 'Set W×H/count → ⚙ sampler/steps/CFG → 🎭 models/weights');
          // 四种生图方式
          h = h.replace(/>普通生图</g, '>Normal Gen</');
          h = h.replace(/用当前面板选好的标签直接生图/g, 'generate with current selected tags');
          h = h.replace(/勾选「🤖AI自动润色」可先发大模型润色再出图/g, 'check "🤖Auto-refine" to polish with LLM first');
          h = h.replace(/>随机生图</g, '>Random Gen</');
          h = h.replace(/每次重新随机抽标签再出图，张张不同/g, 'randomly pick new tags each time, every image unique');
          h = h.replace(/张数由上方「张」控制，配合随机种子可复现/g, 'count controlled by "N" above, reproducible with fixed seed');
          h = h.replace(/>手写生图</g, '>Manual Gen</');
          h = h.replace(/直接手写正向提示词，勾选润色会先AI加工/g, 'write prompt directly, refine first if checked');
          h = h.replace(/>加载图片</g, '>Load Image</');
          h = h.replace(/上传图片绑定LoadImage节点，支持拖拽/g, 'upload image → bind to LoadImage node, supports drag & drop');
          h = h.replace(/>反推生图</g, '>Reverse Gen</');
          h = h.replace(/选图片 → AI视觉模型分析 → 自动反推提示词 → 发送生图/g, 'select image → vision LLM → auto reverse prompt → generate');
          h = h.replace(/内置6套反推预设：通用\/转动漫\/转真人\/转油画\/转赛博\/中文反推/g, '6 built-in reverse presets: General/To-Anime/To-Realism/To-Oil/To-Cyberpunk/CN Reverse');
          // AI润色说明
          h = h.replace(/标签发送时自动带分类名 \[人物主体\] \[发型与发色\] 等，大模型理解更准确/g, 'tags sent with category names for better LLM understanding');
          h = h.replace(/支持 OpenAI \/ LM Studio \/ Ollama \/ 自定义API/g, 'supports OpenAI / LM Studio / Ollama / Custom API');
          h = h.replace(/反推生图需要视觉多模态模型（gpt-4o \/ qwen-vl \/ glm-4v）/g, 'reverse gen needs vision models (gpt-4o / qwen-vl / glm-4v)');
          h = h.replace(/润色记录自动保存最近100条，翻页浏览，可重新发送/g, 'refine history auto-saves last 100, paginated, resendable');
          // 队列&返图
          h = h.replace(/排队生成 → 进度条 → 逐一出图 → 可终止\/清空/g, 'queue → progress → images one by one → stop/clear');
          h = h.replace(/返图缩略图横向滚动 → 点击放大 → 缩放\/拖拽 → ⬇下载 → 📝查看提示词/g, 'thumbnails → click to zoom → scale/drag → ⬇download → 📝view prompt');
          h = h.replace(/手机端通过Flask代理访问ComfyUI图片/g, 'mobile: Flask proxy for ComfyUI images');
          // 技巧
          h = h.replace(/关闭随机种子 = 同标签同参数出固定图（可复现）/g, 'disable random seed = same tags & params = same image (reproducible)');
          h = h.replace(/模板区 \{tags\} 放LoRA触发词\/画风前缀，润色不会影响模板内容/g, 'template {tags} for LoRA triggers/style prefix, refine won\'t affect');
          h = h.replace(/负面预设自动注入，和面板负面标签叠加生效/g, 'negative preset auto-injects, stacks with panel negative tags');
          h = h.replace(/空隔转换：标记直接拼接 \/ 空格转下划线 \/ 下划线转空格/g, 'space mode: direct join / space→underscore / underscore→space');
          h = h.replace(/手机连同一WiFi访问 http:\/\/电脑IP:5802 即可使用/g, 'mobile: same WiFi http://your-IP:5802');
          d.innerHTML = h;
          break;
        }
      }
    }

    // 启动 MutationObserver 监控后续动态内容
    startObserver();

    // 延迟再次扫描：捕获 _syncLoad 等异步回调在 observer 建立前后设置的文本
    // （如 "单一标签" 按钮、标签面板等可能在 app.js 异步初始化中设置）
    setTimeout(function() {
      if (lang !== 'zh') walk(document.body);
    }, 300);
    setTimeout(function() {
      if (lang !== 'zh') walk(document.body);
    }, 1000);
  }

  // ==================== 初始化 ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doTranslate);
    document.addEventListener('readystatechange', function() {
      if (document.readyState === 'interactive') doTranslate();
    });
  } else {
    doTranslate();
  }

  // ==================== 暴露语言切换 ====================
  window.i18nSwitch = function() {
    var l = lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('grimoire2_lang', l);
    location.reload();
  };

  // ==================== 全局翻译工具函数（供 app.js 使用） ====================
  window.tt = function(text) {
    if (lang === 'zh' || !text) return text;
    if (MAP.hasOwnProperty(text)) return MAP[text];
    if (CAT.hasOwnProperty(text)) return CAT[text];
    if (SCAT.hasOwnProperty(text)) return SCAT[text];
    // 尝试关键词替换
    var result = text;
    var kwKeys = Object.keys(KW);
    for (var i = 0; i < kwKeys.length; i++) {
      var k = kwKeys[i];
      if (result.indexOf(k) >= 0) {
        result = result.split(k).join(KW[k]);
      }
    }
    return result;
  };

  window.i18nLang = function() { return lang; };
})();
