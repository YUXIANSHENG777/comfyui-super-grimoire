/* 语言切换 - 页面加载前预处理（B方案） */
(function(){
  var lang = localStorage.getItem('grimoire2_lang') || 'zh';
  document.documentElement.lang = lang;

  // 翻译映射：中文 → 英文（精确匹配或包含替换）
  var MAP = {
    // 工具栏
    '✨ 基础质量词': '✨ Quality Tags',
    '🎲 手气不错': '🎲 Lucky',
    '🔞 NSFW': '🔞 NSFW',
    '⚖ 随机权重': '⚖ Rand Weight',
    '📄 批量导出': '📄 Export',
    '🔄 检查更新': '🔄 Check Update',
    '🗑 清空全部': '🗑 Clear All',
    '❓ 使用说明': '❓ Guide',
    // 左侧
    '📁 标签分类': '📁 Categories',
    '⭐ 我的收藏': '⭐ Favorites',
    '📦 预设组合': '📦 Presets',
    '🕐 历史记录': '🕐 History',
    '💾 随机配置': '💾 Rand Profiles',
    '📋 短语标签': '📋 Phrase Tags',
    '🏷 单一标签': '🏷 Single Tags',
    '请从左侧选择一个子类别开始浏览': 'Select a subcategory from the left',
    // 右侧面板
    '自然语言排序': 'Natural Sort',
    '已选': 'Selected',
    '个': '',
    '点击左侧标签添加到此处': 'Click tags on the left to add',
    // 提示词预览
    '📝 生成的提示词': '📝 Generated Prompt',
    '📋 复制英文': '📋 Copy EN',
    '📋 复制中文': '📋 Copy CN',
    '📝 批量添加': '📝 Batch Add',
    '💾 保存预设': '💾 Save Preset',
    '⚡ 权重': '⚡ Weight',
    '🔄 空隔转换': '🔄 Space Mode',
    // LLM
    '🤖 发送润色': '🤖 Send Refine',
    '📋 复制结果': '📋 Copy Result',
    '💾 保存': '💾 Save',
    '📂 加载预设': '📂 Presets',
    '📜 润色记录': '📜 History',
    '发送语言: 英文标签': 'Send: EN Tags',
    '发送语言: 中文标签': 'Send: CN Tags',
    '🎨 生图前自动润色': '🎨 Auto-refine',
    '🚀 允许并发（性能强可开启）': '🚀 Concurrent (fast GPU)',
    // ComfyUI
    '🎨 ComfyUI': '🎨 ComfyUI',
    '未检测': 'Not detected',
    '-- 选择工作流 --': '-- Select Workflow --',
    '🚀 生图': '🚀 Generate',
    '🔗 正负绑定': '🔗 CLIP Bind',
    '⚙ 工作流参数': '⚙ WF Params',
    '🌐 端口': '🌐 Port',
    '🎭 模型': '🎭 Models',
    '🎲 随机生图': '🎲 Random Gen',
    '✏ 手写生图': '✏ Manual Gen',
    '🖼 加载图片': '🖼 Load Image',
    '宽': 'W',
    '高': 'H',
    '张': 'N',
    '🎲 随机种子': '🎲 Random Seed',
    '⏹ 终止': '⏹ Stop',
    '清空': 'Clear',
    '生成中...': 'Generating...',
    // 手机端
    '📁 标签分类': '📁 Categories',
    '💾 随机配置方案': '💾 Rand Profiles',
    // 图库
    '🖼 生成结果': '🖼 Results',
    '🗑 清空': '🗑 Clear',
    // 弹窗
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
    // 其他
    '📝 正面提示词': '📝 Positive Prompt',
  };

  // 关键词替换（短词，避免误替换）
  var KW = {
    '已选 ': 'Selected ',
    ' 个': '',
    '搜索标签 (中/英文)...': 'Search tags (EN/CN)...',
    '🔍 搜索标签 (中/英文)...': '🔍 Search tags (EN/CN)...',
  };

  function translateNode(node) {
    if (!node || node.nodeType !== 3) return;
    var text = node.textContent;
    if (!text || !text.trim()) return;
    // 精确匹配
    if (MAP[text]) { node.textContent = MAP[text]; return; }
    // 关键词替换
    for (var k in KW) {
      if (text.indexOf(k) >= 0) {
        node.textContent = text.replace(k, KW[k]);
        return;
      }
    }
  }

  function walk(root) {
    var skipTags = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, CODE: 1, PRE: 1, NOSCRIPT: 1 };
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (skipTags[node.parentNode.tagName]) continue;
      // 跳过 data-i18n-keep 标记的元素
      if (node.parentNode.hasAttribute && node.parentNode.hasAttribute('data-i18n-keep')) continue;
      translateNode(node);
    }
  }

  function doTranslate() {
    if (lang === 'zh') return;
    walk(document.body);
    // 更新语言按钮
    var btn = document.getElementById('btn-lang-switch');
    if (btn) btn.textContent = '中文';
    // 标题也更新
    var t = document.querySelector('.app-title');
    if (t) {
      var span = t.querySelector('span');
      if (span) span.textContent = span.textContent.replace(/v\d+\.\d+\.\d+/, span.textContent.match(/v\d+\.\d+\.\d+/)?.[0] || '');
    }
    document.title = document.title.replace(/v\d+\.\d+\.\d+/, document.title.match(/v\d+\.\d+\.\d+/)?.[0] || '').replace('超级无敌魔导书', 'Super Grimoire');
  }

  // 在 DOM 就绪后、app.js 加载前执行翻译
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doTranslate);
    // 也尝试在 readystatechange 尽早翻译
    document.addEventListener('readystatechange', function() {
      if (document.readyState === 'interactive') doTranslate();
    });
  } else {
    doTranslate();
  }

  // 暴露语言切换函数
  window.i18nSwitch = function() {
    var l = lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('grimoire2_lang', l);
    location.reload();
  };
})();
