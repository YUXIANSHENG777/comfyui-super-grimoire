/**
 * 国际化语言包
 * 添加 data-i18n="key" 到 HTML 元素，切换语言时自动替换
 * JS 动态文本用 i18nStr(key) 取值
 */
var I18N = {
  lang: 'zh',
  texts: {
    // 顶部工具栏
    'toolbar.random': { en: '🎲 Lucky', zh: '🎲 手气不错' },
    'toolbar.quality': { en: '✨ Quality Tags', zh: '✨ 基础质量词' },
    'toolbar.nsfw': { en: '🔞 NSFW', zh: '🔞 NSFW' },
    'toolbar.randWeight': { en: '⚖ Rand Weight', zh: '⚖ 随机权重' },
    'toolbar.export': { en: '📄 Export', zh: '📄 批量导出' },
    'toolbar.checkUpdate': { en: '🔄 Check Update', zh: '🔄 检查更新' },
    'toolbar.clear': { en: '🗑 Clear All', zh: '🗑 清空全部' },
    'toolbar.help': { en: '❓ Guide', zh: '❓ 使用说明' },
    'toolbar.tagMode': { en: '🏷 Single Tag', zh: '🏷 单一标签' },
    'toolbar.phraseMode': { en: '📋 Phrase Tags', zh: '📋 短语标签' },
    // 左侧
    'sidebar.search': { en: 'Search tags (EN/CN)...', zh: '搜索标签 (中/英文)...' },
    'sidebar.emptyTree': { en: 'No categories', zh: '未找到分类' },
    'sidebar.categories': { en: '📁 Categories', zh: '📁 标签分类' },
    'sidebar.favorites': { en: '⭐ Favorites', zh: '⭐ 我的收藏' },
    'sidebar.presets': { en: '📦 Presets', zh: '📦 预设组合' },
    'sidebar.history': { en: '🕐 History', zh: '🕐 历史记录' },
    'sidebar.randProfile': { en: '💾 Rand Profiles', zh: '💾 随机配置' },
    // 标签网格
    'grid.empty': { en: 'Select a subcategory from the left', zh: '请从左侧选择一个子类别' },
    'grid.noResult': { en: 'No matching tags', zh: '未找到匹配标签' },
    'grid.title': { en: 'Select a subcategory', zh: '请选择一个子类别' },
    // 右侧面板
    'panel.positive': { en: 'Positive Tags', zh: '正面标签' },
    'panel.selected': { en: 'Selected {0}', zh: '已选 {0} 个' },
    'panel.empty': { en: 'Click tags on the left to add', zh: '点击左侧标签添加到此处' },
    'panel.sort': { en: 'Natural Sort', zh: '自然语言排序' },
    'panel.addPositive': { en: 'Add Positive', zh: '添加到正面' },
    'panel.addNegative': { en: 'Add Negative', zh: '添加到负面' },
    'panel.editTag': { en: 'Edit Tag', zh: '编辑标签' },
    'panel.deleteTag': { en: 'Delete Tag', zh: '删除标签' },
    // 提示词预览
    'preview.title': { en: '📝 Generated Prompt', zh: '📝 生成的提示词' },
    'preview.copyEn': { en: '📋 Copy EN', zh: '📋 复制英文' },
    'preview.copyCn': { en: '📋 Copy CN', zh: '📋 复制中文' },
    'preview.batchAdd': { en: '📝 Batch Add', zh: '📝 批量添加' },
    'preview.savePreset': { en: '💾 Save Preset', zh: '💾 保存预设' },
    'preview.template': { en: '📐 Prompt Template ▾', zh: '📐 提示词模板 ▾' },
    'preview.negTemplate': { en: '🚫 Negative Preset ▾', zh: '🚫 负面提示词预设 ▾' },
    // LLM
    'llm.title': { en: '🤖 AI Refine ▾', zh: '🤖 AI润色 ▾' },
    'llm.sysprompt': { en: 'System instruction for the model', zh: '系统指令（给大模型的条件）' },
    'llm.send': { en: '🤖 Send Refine', zh: '🤖 发送润色' },
    'llm.copy': { en: '📋 Copy Result', zh: '📋 复制结果' },
    'llm.auto': { en: 'Auto-refine before generating', zh: '🎨 AI自动润色' },
    'llm.history': { en: '📜 Refine History', zh: '📜 润色记录' },
    'llm.presets': { en: '📂 Presets', zh: '📂 预设' },
    'llm.savePreset': { en: '💾 Save', zh: '💾 保存' },
    'llm.lang': { en: 'Lang', zh: '语言' },
    // ComfyUI
    'comfy.title': { en: '🎨 ComfyUI', zh: '🎨 ComfyUI' },
    'comfy.notDetected': { en: 'Not detected', zh: '未检测' },
    'comfy.workflow': { en: '-- Select Workflow --', zh: '-- 选择工作流 --' },
    'comfy.generate': { en: '🚀 Generate', zh: '🚀 生图' },
    'comfy.posNegBind': { en: '🔗 CLIP Bind', zh: '🔗 正负绑定' },
    'comfy.workflowParams': { en: '⚙ WF Params', zh: '⚙ 工作流参数' },
    'comfy.port': { en: '🌐 Port', zh: '🌐 端口' },
    'comfy.models': { en: '🎭 Models', zh: '🎭 模型' },
    'comfy.randomGen': { en: '🎲 Random Gen', zh: '🎲 随机生图' },
    'comfy.manualGen': { en: '✏ Manual Gen', zh: '✏ 手写生图' },
    'comfy.loadImg': { en: '🖼 Load Image', zh: '🖼 加载图片' },
    'comfy.width': { en: 'W', zh: '宽' },
    'comfy.height': { en: 'H', zh: '高' },
    'comfy.count': { en: 'Count', zh: '张' },
    'comfy.randSeed': { en: '🎲 Random Seed', zh: '🎲 随机种子' },
    'comfy.queue': { en: 'Queue: {0}/{1}', zh: '队列: {0}/{1}' },
    'comfy.running': { en: ' Generating', zh: ' ⏳生成中' },
    'comfy.done': { en: ' Done', zh: ' ✅完成' },
    // 手机端
    'mobile.tabTags': { en: 'Tags', zh: '标签' },
    'mobile.tabPrompt': { en: 'Prompt', zh: '提示词' },
    'mobile.tabGen': { en: 'Generate', zh: '生图' },
    // 反推
    'reverse.title': { en: '🔄 Reverse Generate (Vision)', zh: '🔄 反推生图（视觉模型）' },
    'reverse.sysprompt': { en: 'System instruction for reverse-engineering...', zh: '系统指令：描述你想让大模型如何反推图片提示词...' },
    'reverse.btn': { en: '🔄 Reverse & Generate', zh: '🔄 反推并生图' },
    'reverse.presets': { en: 'Presets', zh: '预设' },
    'reverse.noPresets': { en: 'No saved presets', zh: '暂无保存的预设' },
    // 通用
    'common.loading': { en: 'Loading...', zh: '加载中...' },
    'common.noData': { en: 'Data not loaded', zh: '数据未加载' },
    'common.error': { en: 'Error', zh: '错误' },
    'common.close': { en: 'Close', zh: '关闭' },
    'common.confirm': { en: 'Confirm', zh: '确定' },
    'common.cancel': { en: 'Cancel', zh: '取消' },
    'common.save': { en: 'Save', zh: '保存' },
    'common.load': { en: 'Load', zh: '加载' },
    'common.delete': { en: 'Delete', zh: '删除' },
    // Toasts
    'toast.copied': { en: 'Copied', zh: '已复制' },
    'toast.tagAdded': { en: 'Tag added', zh: '已添加标签' },
    'toast.tagRemoved': { en: 'Tag removed', zh: '已移除' },
    'toast.promptEmpty': { en: 'Prompt is empty', zh: '提示词为空' },
    'toast.noCopy': { en: 'Nothing to copy', zh: '没有可复制的内容' },
    'toast.paramsSaved': { en: 'Saved', zh: '已保存' },
    'toast.syncFailed': { en: 'Sync failed', zh: '同步失败' },
    'toast.undo': { en: 'Undone', zh: '已撤销' },
    'toast.redo': { en: 'Redone', zh: '已重做' },
    'toast.fileRequired': { en: 'Select a file first', zh: '请先选择文件' },
    'toast.wfRequired': { en: 'Select a workflow first', zh: '请先选择工作流' },
    'toast.refining': { en: 'AI refining...', zh: 'AI润色中...' },
    'toast.refined': { en: 'Refined result sent', zh: '已添加(已润色)' },
    'toast.rawSent': { en: 'Sent to queue', zh: '已发送到队列' },
    'toast.randomGen': { en: 'Added {0} random tasks', zh: '已添加 {0} 个任务' },
    'toast.reverseDone': { en: 'Reverse done, sent to queue', zh: '反推完成，已发送到队列' },
    'toast.reverseFail': { en: 'Reverse failed', zh: '反推失败' },
    'toast.presetLoaded': { en: 'Loaded: {0}', zh: '已加载: {0}' },
    'toast.presetSaved': { en: 'Saved: {0}', zh: '已保存: {0}' },
    'toast.presetDeleted': { en: 'Deleted', zh: '已删除' },
    'toast.updateAvail': { en: 'New version {0}', zh: '🆕 发现新版本 {0}' },
    'toast.latest': { en: 'Already latest', zh: '✅ 已是最新版本' },
    'toast.updateFail': { en: 'Check failed', zh: '❌ 检查失败' },
    'toast.updateDone': { en: 'Update complete! Restart server', zh: '✅ 更新完成！请重启服务器' },
    'toast.clearHistory': { en: 'Cleared', zh: '已清空' },
    'toast.modelEmpty': { en: 'Model returned empty', zh: '模型返回空内容' },
    'toast.llmBusy': { en: 'LLM is busy', zh: 'AI润色进行中，请等待' },
    'toast.refineFail': { en: 'Refine failed, using original', zh: '润色失败，使用原文' },
    'toast.noTagMatch': { en: 'No matching tags found', zh: '未找到匹配标签' },
    'toast.uploadFail': { en: 'Upload failed', zh: '上传失败' },
    'toast.uploadSuccess': { en: 'Uploaded & bound', zh: '上传并绑定成功' },
    'toast.historySent': { en: 'Sent to queue', zh: '已发送润色记录到队列' },
    'toast.profileSaved': { en: 'Profile saved', zh: '已保存方案' },
    'toast.profileLoaded': { en: 'Profile loaded', zh: '已加载方案' },
    'toast.noImage': { en: 'No image record', zh: '该图片无提示词记录' },
    'toast.disclaimer': { en: 'AI-generated content may contain inaccuracies', zh: 'AI 生成内容可能存在偏差或不当之处' },
    'toast.comfyuiRunning': { en: 'ComfyUI is running, please wait', zh: 'ComfyUI正在运行，请等待' },
    'toast.selectImage': { en: 'Please select an image', zh: '请先选择一张图片' },
    'toast.noRecords': { en: 'No refine history', zh: '暂无润色记录' },
    'toast.generationStopped': { en: 'Generation stopped', zh: '队列已终止' },
    'toast.generationDone': { en: 'All tasks complete', zh: '队列任务全部完成' },
    'toast.customTagAdded': { en: 'Custom tag added', zh: '自定义标签已添加' },
    'toast.customTagDeleted': { en: 'Tag deleted', zh: '标签已删除' },
    'toast.customCatAdded': { en: 'Category added', zh: '大类已添加' },
    'toast.customCatDeleted': { en: 'Category deleted', zh: '大类已删除' },
    'toast.customScAdded': { en: 'Subcategory added', zh: '子类已添加' },
    'toast.customScDeleted': { en: 'Subcategory deleted', zh: '子类已删除' },
  }
};

// 切换语言
function i18nSetLang(lang) {
  I18N.lang = lang;
  // 更新所有带 data-i18n 的元素
  var els = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var key = el.getAttribute('data-i18n');
    var dict = I18N.texts[key];
    if (!dict) continue;
    var str = dict[lang] || dict.zh || key;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.hasAttribute('data-i18n-placeholder')) el.placeholder = str;
      else el.value = str;
    } else if (el.tagName === 'OPTION') {
      el.textContent = str;
    } else {
      // data-i18n-replace: 整体替换（忽略子元素如 icon）
      if (el.hasAttribute('data-i18n-replace')) {
        el.textContent = str;
      } else {
        // 保留子元素，只更新最后的文本节点
        var nodes = el.childNodes;
        for (var j = nodes.length - 1; j >= 0; j--) {
          if (nodes[j].nodeType === 3 && nodes[j].textContent.trim()) {
            nodes[j].textContent = str;
            break;
          }
        }
        // 如果没有文本节点，追加
        if (el.textContent.trim() === '' && nodes.length === 0) {
          el.textContent = str;
        }
      }
    }
  }
  // 更新 HTML title 属性
  var titleEls = document.querySelectorAll('[data-i18n-title]');
  for (var i = 0; i < titleEls.length; i++) {
    var tel = titleEls[i];
    var tkey = tel.getAttribute('data-i18n-title');
    var tdict = I18N.texts[tkey];
    if (tdict) tel.title = tdict[lang] || tdict.zh || tkey;
  }
  // 更新语言按钮
  var lb = document.getElementById('btn-lang-switch');
  if (lb) lb.textContent = lang === 'zh' ? 'English' : '中文';
  // 更新 HTML lang 属性
  document.documentElement.lang = lang;
  // 保存
  localStorage.setItem('grimoire2_lang', lang);
  if (typeof S !== 'undefined') S.lang = lang;
}

// JS 中取翻译
function i18nStr(key, args) {
  var text = I18N.texts[key];
  if (!text) return key;
  var s = text[I18N.lang] || text.zh || key;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      s = s.replace('{' + i + '}', args[i]);
    }
  }
  return s;
}
