/* ========== 超级无敌魔导书 - 应用逻辑 ========== */
var S={allData:null,activeCat:null,activeSc:null,isSearching:false,posTags:[],autoSortPos:true,negTags:[],autoSortNeg:true,activeTab:'positive',useQuality:false,useWeights:false,allowNsfw:false,randWeight:false,spaceMode:0,template:'',favs:{},catLimits:{},scLimits:{},catModes:{},hidden:{categories:{},subcategories:{}},comfyuiPath:'',comfyuiLang:'en',comfyuiQueue:[],comfyuiRunning:false,comfyuiStopped:false,llmRunning:false,llmHistory:(function(){try{return JSON.parse(localStorage.getItem('grimoire2_llmhist')||'[]');}catch(e){return[];}})(),undoStack:[],undoIdx:-1,tagMode:'phrase'};
var QW=['masterpiece level, highest quality, breathtaking','8K resolution, insanely detailed, tack sharp'];
function el(id){return document.getElementById(id);}
function qs(s,p){return (p||document).querySelector(s);}
function qsa(s,p){return (p||document).querySelectorAll(s);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function toast(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove();},2000);}
function api(u,o){o=o||{};return fetch(u,{method:o.method||'GET',headers:{'Content-Type':'application/json'},body:o.body?JSON.stringify(o.body):undefined}).then(function(r){return r.json();});}
function loadFavs(){try{var d=localStorage.getItem('grimoire2_favs');if(d)S.favs=JSON.parse(d);}catch(e){S.favs={};}}
function loadScLimits(){try{var d=localStorage.getItem('grimoire2_scLimits');if(d)S.scLimits=JSON.parse(d);else S.scLimits={};}catch(e){S.scLimits={};}}
function saveScLimits(){localStorage.setItem('grimoire2_scLimits',JSON.stringify(S.scLimits));_syncSave({scLimits:1});}
function loadCatLimits(){try{var d=localStorage.getItem('grimoire2_catLimits');if(d)S.catLimits=JSON.parse(d);else S.catLimits={};}catch(e){S.catLimits={};}}
function saveCatLimits(){localStorage.setItem('grimoire2_catLimits',JSON.stringify(S.catLimits));_syncSave({catLimits:1});}
function loadUseScLimits(){try{var v=localStorage.getItem('grimoire2_useScLimits');S.useScLimits=v==='true';}catch(e){S.useScLimits=true;}}
function saveUseScLimits(){localStorage.setItem('grimoire2_useScLimits',S.useScLimits);}
function loadHidden(){try{var d=localStorage.getItem('grimoire2_hidden');if(d)S.hidden=JSON.parse(d);else S.hidden={categories:{},subcategories:{}};}catch(e){S.hidden={categories:{},subcategories:{}};}}
function saveHidden(){localStorage.setItem('grimoire2_hidden',JSON.stringify(S.hidden));}
function loadAllowNsfw(){try{var v=localStorage.getItem('grimoire2_allowNsfw');S.allowNsfw=v==='true';}catch(e){S.allowNsfw=false;}}
function saveAllowNsfw(){localStorage.setItem('grimoire2_allowNsfw',S.allowNsfw);_syncSave({allowNsfw:1});}
function loadRandWeight(){try{var v=localStorage.getItem('grimoire2_randWeight');S.randWeight=v==='true';}catch(e){S.randWeight=false;}}
function saveRandWeight(){localStorage.setItem('grimoire2_randWeight',S.randWeight);_syncSave({randWeight:1});}
function loadSpaceMode(){try{var v=localStorage.getItem('grimoire2_spaceMode');S.spaceMode=parseInt(v)||0;}catch(e){S.spaceMode=0;}}
function saveSpaceMode(){localStorage.setItem('grimoire2_spaceMode',S.spaceMode);_syncSave({spaceMode:1});}
function saveLlmHistory(){localStorage.setItem('grimoire2_llmhist',JSON.stringify(S.llmHistory));_syncSave({llmhist:1});}
function loadUiSettings(){try{var d=localStorage.getItem('grimoire2_ui');if(d){var s=JSON.parse(d);if(s.randCount)el('rand-count').value=s.randCount,el('rand-count-display').textContent=s.randCount;if(s.cuiW)el('comfyui-width').value=s.cuiW;if(s.cuiH)el('comfyui-height').value=s.cuiH;if(s.cuiCnt)el('comfyui-count').value=s.cuiCnt;if(s.cuiLang){S.comfyuiLang=s.cuiLang;var lb=el('btn-comfyui-lang');lb.textContent=S.comfyuiLang==='zh'?'中':'EN';if(S.comfyuiLang==='en')lb.classList.add('active');else lb.classList.remove('active');}if(s.cuiWf)setTimeout(function(){el('comfyui-workflow').value=s.cuiWf;},300);if(s.template){S.template=s.template;el('template-input').value=s.template;}if(s.randSeed===false)el('comfyui-rand-seed').checked=false;}}catch(e){}}
function saveUiSettings(){var s={randCount:parseInt(el('rand-count').value)||10,cuiW:el('comfyui-width').value,cuiH:el('comfyui-height').value,cuiCnt:el('comfyui-count').value,cuiLang:S.comfyuiLang,cuiWf:el('comfyui-workflow').value,template:S.template,randSeed:el('comfyui-rand-seed').checked};localStorage.setItem('grimoire2_ui',JSON.stringify(s));_syncSave({uiSettings:1});}
function _pushUndo(){S.undoStack=S.undoStack.slice(0,S.undoIdx+1);var ps=[],ns=[];for(var i=0;i<S.posTags.length;i++){var t=S.posTags[i];ps.push({en:t.en,zh:t.zh,weight:t.weight,category:t.category,subcategory:t.subcategory,locked:t.locked});}for(var i=0;i<S.negTags.length;i++){var t=S.negTags[i];ns.push({en:t.en,zh:t.zh,weight:t.weight,category:t.category,subcategory:t.subcategory,locked:t.locked});}S.undoStack.push({pos:ps,neg:ns});if(S.undoStack.length>50)S.undoStack.shift();else S.undoIdx++;}
function loadCatModes(){try{var d=localStorage.getItem('grimoire2_catModes');if(d)S.catModes=JSON.parse(d);else S.catModes={};}catch(e){S.catModes={};}}
function saveCatModes(){localStorage.setItem('grimoire2_catModes',JSON.stringify(S.catModes));_syncSave({catModes:1});}
function saveFavs(){localStorage.setItem('grimoire2_favs',JSON.stringify(S.favs));_syncSave({favs:1});}
function toggleFav(en){if(S.favs[en])delete S.favs[en];else S.favs[en]=true;saveFavs();renderFavs();if(!S.isSearching)renderGrid();}
function isSelected(en,panel){var a=panel==='negative'?S.negTags:S.posTags;for(var i=0;i<a.length;i++)if(a[i].en===en)return true;return false;}
function findZh(en){if(!S.allData)return null;for(var ci=0;ci<S.allData.categories.length;ci++){var c=S.allData.categories[ci];for(var si=0;si<c.subcategories.length;si++){var sc=c.subcategories[si];for(var ti=0;ti<sc.tags.length;ti++)if(sc.tags[ti].en===en)return sc.tags[ti].zh;}}return null;}
function findCat(en){if(!S.allData)return null;for(var ci=0;ci<S.allData.categories.length;ci++){var c=S.allData.categories[ci];for(var si=0;si<c.subcategories.length;si++){var sc=c.subcategories[si];for(var ti=0;ti<sc.tags.length;ti++)if(sc.tags[ti].en===en)return {category:c.name,subcategory:sc.name};}}return null;}
function saveLocked(){var d={pos:[],neg:[]};for(var i=0;i<S.posTags.length;i++){var t=S.posTags[i];if(t.locked)d.pos.push({en:t.en,zh:t.zh,weight:t.weight,category:t.category,subcategory:t.subcategory,locked:true});}for(var i=0;i<S.negTags.length;i++){var t=S.negTags[i];if(t.locked)d.neg.push({en:t.en,zh:t.zh,weight:t.weight,category:t.category,subcategory:t.subcategory,locked:true});}localStorage.setItem('grimoire2_locked',JSON.stringify(d));}
function loadLocked(){try{var d=JSON.parse(localStorage.getItem('grimoire2_locked')||'null');if(d){S.posTags=d.pos||[];S.negTags=d.neg||[];}}catch(e){}}
function addTag(en,zh,panel){var a=panel==='negative'?S.negTags:S.posTags;for(var i=0;i<a.length;i++)if(a[i].en===en)return;var info=findCat(en)||{};_pushUndo();a.push({en:en,zh:zh||en,weight:1.0,category:info.category||'',subcategory:info.subcategory||''});refreshPanel(panel);updatePreview();if(!S.isSearching)renderGrid();saveLocked();}
function removeTag(en,panel){_pushUndo();if(panel==='negative')S.negTags=S.negTags.filter(function(t){return t.en!==en;});else S.posTags=S.posTags.filter(function(t){return t.en!==en;});refreshPanel(panel);updatePreview();if(!S.isSearching)renderGrid();saveLocked();}
function updateWeight(en,w,panel){_pushUndo();var a=panel==='negative'?S.negTags:S.posTags;for(var i=0;i<a.length;i++)if(a[i].en===en){a[i].weight=w;break;}updatePreview();saveLocked();}
function clearAll(){_pushUndo();S.posTags=[];S.negTags=[];refreshPanel('positive');refreshPanel('negative');updatePreview();if(!S.isSearching)renderGrid();toast('已清空全部标签');saveLocked();}
function getSorted(panel){var a=panel==='negative'?S.negTags:S.posTags;var as=panel==='negative'?S.autoSortNeg:S.autoSortPos;var cp=a.slice();if(as)cp.sort(_naturalLanguageSort);return cp;}
// 自然语言排序：按分类语义优先级排列，使提示词读起来通顺
var _NL_ORDER={'艺术风格':1,'画质与渲染':3,'人物主体':4,'动作姿态':5,'发型与发色':6,'五官与表情':7,'服装与配饰':8,'场景与背景':9,'物品与道具':10,'动植物与自然':11,'构图与视角':12,'色彩与氛围':13,'负面提示词':91};
// NSFW子类→语义对应位置：亲密互动→动作后，神态暗示→表情后，暴露程度→服装后，暧昧氛围→场景后，氛围暗示→色调前
var _NL_NSFW_MAP={'亲密互动':5.5,'神态暗示':7.5,'暴露程度':8.5,'暧昧氛围':9.5,'氛围暗示':12.5};
function _naturalLanguageSort(a,b){
  var ns=_NL_ORDER;
  var oa=ns[a.category];if(oa===undefined)oa=90;
  var ob=ns[b.category];if(ob===undefined)ob=90;
  // NSFW开启时按子类语义位置分散插入
  if(S.allowNsfw){
    if(a.category==='NSFW')oa=_NL_NSFW_MAP[a.subcategory]||90;
    if(b.category==='NSFW')ob=_NL_NSFW_MAP[b.subcategory]||90;
  }else{
    if(a.category==='NSFW')oa=92;if(b.category==='NSFW')ob=92;
  }
  if(oa!==ob)return oa-ob;
  // 同分类内部按子分类名排序保持稳定
  var sa=a.subcategory||'';var sb=b.subcategory||'';
  if(sa!==sb)return sa<sb?-1:1;
  return 0;
}
function _applySpaceMode(txt){if(S.spaceMode===1)return txt.replace(/ /g,'_');if(S.spaceMode===2)return txt.replace(/_/g,' ');return txt;}
function genPrompt(tags,fmt){fmt=fmt||el('export-format').value;var p=[];for(var i=0;i<tags.length;i++){var t=tags[i];if(Math.abs(t.weight-1.0)<0.01){if(S.useWeights)p.push('('+_applySpaceMode(t.en)+':1.0)');else p.push(_applySpaceMode(t.en));}else{if(fmt==='novelai'){if(t.weight>1.0){var n=Math.min(Math.round((t.weight-1.0)*10),5);var b='';for(var j=0;j<n;j++)b+='{';var eb='';for(var j=0;j<n;j++)eb+='}';p.push(b+_applySpaceMode(t.en)+eb);}else{var n=Math.min(Math.round((1.0-t.weight)*10),5);var br='';for(var j=0;j<n;j++)br+='[';var ebr='';for(var j=0;j<n;j++)ebr+=']';p.push(br+_applySpaceMode(t.en)+ebr);}}else{if(t.weight>1.0)p.push('('+_applySpaceMode(t.en)+':'+t.weight.toFixed(1)+')');else p.push('['+_applySpaceMode(t.en)+':'+t.weight.toFixed(1)+']');}}}return p.join(', ');}
function genPromptCN(tags){var p=[];for(var i=0;i<tags.length;i++){var t=tags[i];var zh=t.zh||t.en;if(Math.abs(t.weight-1.0)<0.01){if(S.useWeights)p.push('('+zh+':1.0)');else p.push(zh);}else{if(t.weight>1.0)p.push('('+zh+':'+t.weight.toFixed(1)+')');else p.push('['+zh+':'+t.weight.toFixed(1)+']');}}return p.join(', ');}
function _buildRawPrompt(){var pos=getSorted('positive');var neg=getSorted('negative');var parts=[];if(S.useQuality&&pos.length>0)parts.push(QW.join(', '));if(pos.length>0)parts.push(genPrompt(pos));var txt=parts.join(', ');if(neg.length>0)txt+='\n--neg '+genPrompt(neg);return txt;}
function updatePreview(){var txt=_buildRawPrompt();if(S.template){txt=S.template.replace(/{tags}/g,txt);}el('prompt-output').value=txt;}
function refreshPanel(panel){var a=panel==='negative'?S.negTags:S.posTags;var ct=el('selected-tags-'+panel);var cnt=el(panel+'-count');if(!ct||!cnt)return;var sorted=getSorted(panel);var as=panel==='negative'?S.autoSortNeg:S.autoSortPos;cnt.textContent='已选 '+a.length+' 个';if(sorted.length===0){ct.innerHTML='<div class=empty-hint>点击左侧标签添加到此处</div>';return;}
var groups={};for(var i=0;i<sorted.length;i++){var t=sorted[i];var cat=t.category||'未分类';if(!groups[cat])groups[cat]=[];groups[cat].push(t);}
var html='';var gnames=Object.keys(groups);
for(var gi=0;gi<gnames.length;gi++){var gn=gnames[gi];var gtags=groups[gn];html+='<div class=cat-group><div class=cat-group-header><span class=cat-dot></span>'+esc(gn)+' ('+gtags.length+')</div>';
for(var ti=0;ti<gtags.length;ti++){var t=gtags[ti];html+='<div class=tag-row data-en="'+esc(t.en)+'" data-panel="'+panel+'">';
if(!as)html+='<span class=drag-handle draggable=true data-en="'+esc(t.en)+'" data-panel="'+panel+'" title=拖拽排序>☰</span>';
html+='<span class=tag-info><span class=zh>'+esc(t.zh||t.en)+'</span><span class=en>'+esc(t.en)+' ('+esc(t.category||'')+')</span></span>';
html+='<input type=range class=weight-slider min=0.5 max=2.0 step=0.1 value='+t.weight.toFixed(1)+' data-en="'+esc(t.en)+'" data-panel="'+panel+'">';
html+='<input type=number class=weight-input min=0.5 max=2.0 step=0.1 value='+t.weight.toFixed(1)+' data-en="'+esc(t.en)+'" data-panel="'+panel+'">';
html+='<button class=tag-lock data-en="'+esc(t.en)+'" data-panel="'+panel+'" title='+(t.locked?'已锁定不刷新':'点击锁定不刷新')+'>'+(t.locked?'🔒':'🔓')+'</button>';
html+='<button class=tag-remove data-en="'+esc(t.en)+'" data-panel="'+panel+'" title=移除>✕</button>';
html+='</div>';}html+='</div>';}
ct.innerHTML=html;
qsa('.weight-slider',ct).forEach(function(s){s.addEventListener('input',function(){var w=parseFloat(this.value);var en=this.dataset.en;var p=this.dataset.panel;updateWeight(en,w,p);var row=this.closest('.tag-row');if(row){var inp=qs('.weight-input',row);if(inp)inp.value=w.toFixed(1);}if((p==='negative'?S.autoSortNeg:S.autoSortPos))refreshPanel(p);});});
qsa('.weight-input',ct).forEach(function(inp){inp.addEventListener('change',function(){var w=parseFloat(this.value);if(isNaN(w)||w<0.5)w=0.5;if(w>2.0)w=2.0;this.value=w.toFixed(1);var en=this.dataset.en;var p=this.dataset.panel;updateWeight(en,w,p);var row=this.closest('.tag-row');if(row){var sl=qs('.weight-slider',row);if(sl)sl.value=w.toFixed(1);}if((p==='negative'?S.autoSortNeg:S.autoSortPos))refreshPanel(p);});});
qsa('.tag-remove',ct).forEach(function(b){b.addEventListener('click',function(){var en=this.dataset.en;var p=this.dataset.panel;removeTag(en,p);});});
qsa('.tag-lock',ct).forEach(function(b){b.addEventListener('click',function(){var en=this.dataset.en;var p=this.dataset.panel;var a=p==='negative'?S.negTags:S.posTags;for(var i=0;i<a.length;i++)if(a[i].en===en){a[i].locked=!a[i].locked;break;}refreshPanel(p);saveLocked();});});
if(!as)setupDrag(ct,panel);
if(_isMobile)_updateMobileSelected();}

function setupDrag(ct,panel){
qsa('.drag-handle',ct).forEach(function(h){
h.addEventListener('dragstart',function(e){e.dataTransfer.setData('text/plain',this.dataset.en+'|'+panel);e.dataTransfer.effectAllowed='move';});
});
qsa('.tag-row',ct).forEach(function(row){
row.addEventListener('dragover',function(e){e.preventDefault();this.classList.add('drag-over');e.dataTransfer.dropEffect='move';});
row.addEventListener('dragleave',function(e){this.classList.remove('drag-over');});
row.addEventListener('drop',function(e){e.preventDefault();this.classList.remove('drag-over');var d=e.dataTransfer.getData('text/plain');var ps=d.split('|');var fromEn=ps[0],fromP=ps[1];var toEn=this.dataset.en;var a=panel==='negative'?S.negTags:S.posTags;var fi=-1,ti=-1;for(var i=0;i<a.length;i++){if(a[i].en===fromEn)fi=i;if(a[i].en===toEn)ti=i;}if(fi>=0&&ti>=0&&fi!==ti){var item=a.splice(fi,1)[0];a.splice(ti,0,item);refreshPanel(panel);updatePreview();}});
});
}
function renderGrid(){if(S.isSearching)return;var grid=el('tag-grid');var title=el('browser-title');var acts=el('browser-actions');if(!S.activeSc||!S.allData){grid.innerHTML='';title.textContent='请从左侧选择一个子类别';acts.innerHTML='';return;}
var allTags=[];var cn='';var sn=S.activeSc;
for(var ci=0;ci<S.allData.categories.length;ci++){var c=S.allData.categories[ci];if(c.name===S.activeCat){cn=c.name;for(var si=0;si<c.subcategories.length;si++){if(c.subcategories[si].name===sn){allTags=c.subcategories[si].tags;break;}}break;}}
title.textContent=cn+' › '+sn+' ('+allTags.length+'个)';
acts.innerHTML='<button id=btn-sc-add-tag class=tool-btn title=添加标签到当前子类别>✚ 添加</button><button id=btn-sc-batch-tag class=tool-btn title=批量添加标签到当前子类别>✚ 批量添加</button><button id=btn-sc-batch-del class=tool-btn title=批量删除标签>🗑 批量删除</button>';
el('btn-sc-add-tag').addEventListener('click',function(){openTagForm(cn,sn);});
el('btn-sc-batch-tag').addEventListener('click',function(){el('modal-batch-sc').style.display='';el('sc-batch-cat').textContent=cn;el('sc-batch-sc').textContent=sn;el('sc-batch-input').value='';el('sc-batch-result').textContent='';el('sc-batch-input').focus();});
el('btn-sc-batch-del').addEventListener('click',function(){el('modal-batch-del').style.display='';el('batch-del-cat').textContent=cn;el('batch-del-sc').textContent=sn;el('batch-del-input').value='';el('batch-del-result').textContent='';el('batch-del-input').focus();});
if(allTags.length===0){grid.innerHTML='<div class=empty-hint style=padding:40px;text-align:center>此子类别暂无标签<br><button id=btn-empty-add class=action-btn style=margin-top:12px>✚ 添加第一个标签</button></div>';el('btn-empty-add').addEventListener('click',function(){openTagForm(cn,sn);});return;}
var html='<div class=tag-grid>';
for(var i=0;i<allTags.length;i++){var t=allTags[i];var ip=isSelected(t.en,'positive'),in2=isSelected(t.en,'negative');var sc='';if(ip&&in2)sc=' selected both';else if(ip)sc=' selected positive';else if(in2)sc=' selected negative';var fv=S.favs[t.en]?' faved':'';
html+='<div class=tag-chip'+sc+' data-en="'+esc(t.en)+'" data-zh="'+esc(t.zh||'')+'" title="'+esc(t.en+(t.zh?' - '+t.zh:''))+'">';
html+='<span class=tag-zh>'+esc(t.zh||t.en)+'</span><span class=tag-en>'+esc(t.en)+'</span>';
html+='<span class=tag-star'+fv+' data-en="'+esc(t.en)+'">⭐</span>';
html+='<span class=tag-edit-icon data-en="'+esc(t.en)+'" data-zh="'+esc(t.zh||'')+'" data-cat="'+esc(cn)+'" data-sc="'+esc(sn)+'" title=编辑>✎</span>';
html+='<span class=tag-del-icon data-en="'+esc(t.en)+'" data-cat="'+esc(cn)+'" data-sc="'+esc(sn)+'" title=删除标签(需连点2次)>🗑</span>';
html+='</div>';}
html+='</div>';grid.innerHTML=html;
qsa('.tag-chip',grid).forEach(function(ch){ch.addEventListener('click',function(e){if(e.target.classList.contains('tag-star')||e.target.classList.contains('tag-edit-icon')||e.target.classList.contains('tag-del-icon'))return;var en=this.dataset.en,zh=this.dataset.zh;if(S.activeTab==='negative'){if(isSelected(en,'negative'))removeTag(en,'negative');else addTag(en,zh,'negative');}else{if(isSelected(en,'positive'))removeTag(en,'positive');else addTag(en,zh,'positive');}});});
qsa('.tag-star',grid).forEach(function(s){s.addEventListener('click',function(e){e.stopPropagation();toggleFav(this.dataset.en);});});
qsa('.tag-edit-icon',grid).forEach(function(ic){ic.addEventListener('click',function(e){e.stopPropagation();openTagFormEdit(this.dataset.cat,this.dataset.sc,this.dataset.en,this.dataset.zh);});});
qsa('.tag-del-icon',grid).forEach(function(di){di.addEventListener('click',function(e){e.stopPropagation();delTagClick(this);});});
if(_isMobile)_updateMobileSelected();}

function renderTree(){if(!S.allData)return;var tree=el('category-tree');var html='';
for(var i=0;i<S.allData.categories.length;i++){var c=S.allData.categories[i];if(S.hidden.categories[c.name])continue;var oc=S.activeCat===c.name?' open':'';html+='<div class=category-item><div class=cat-header data-cat='+esc(c.name)+'>';
html+='<span class=arrow'+oc+'>▶</span><span class=cat-name>'+esc(c.name)+'</span><span class=cat-badge>'+c.subcategories.length+'</span>';
html+='<input type=number class=cat-limit min=0 max=99 value='+((S.catLimits[c.name]!==undefined&&S.catLimits[c.name]!==null)?S.catLimits[c.name]:3)+' data-cat='+esc(c.name)+' title=随机上限(0=不取)>';
var cm=S.catModes[c.name]==='cat'?'cat':'sc';html+='<button class=cat-mode-btn data-cat='+esc(c.name)+' title='+(cm==='cat'?'按分类随机':'按子类随机')+'>'+(cm==='cat'?'📁':'📂')+'</button>';
html+='<button class=cat-add-sc data-cat='+esc(c.name)+' title=添加子类别>✚</button><button class=cat-del title=删除分类(需连点6次) data-cat='+esc(c.name)+'>🗑</button></div>';
html+='<div class=subcat-list'+oc+'>';
for(var j=0;j<c.subcategories.length;j++){var sc=c.subcategories[j];var scKey=c.name+'|'+sc.name;if(S.hidden.subcategories[scKey])continue;var ac=S.activeSc===sc.name&&S.activeCat===c.name?' active':'';var sv=(S.scLimits[scKey]!==undefined&&S.scLimits[scKey]!==null)?S.scLimits[scKey]:1;
html+='<div class=subcat-item'+ac+' data-cat='+esc(c.name)+' data-sc='+esc(sc.name)+'><span class=sc-name>'+esc(sc.name)+' ('+sc.tags.length+')</span><input type=number class=sc-limit min=0 max=99 value='+sv+' data-sckey='+esc(scKey)+' title=随机上限(0=不取)><button class=sc-del title=删除子类别(需连点6次) data-sckey='+esc(scKey)+' data-cat='+esc(c.name)+' data-sc='+esc(sc.name)+'>🗑</button></div>';}
html+='</div></div>';}
tree.innerHTML=html;
// 恢复展开的分类
if(S._expandedCats&&S._expandedCats.length){
  var cats=S._expandedCats;
  qsa('.cat-header',tree).forEach(function(h){var cn=h.dataset.cat;if(cats.indexOf(cn)>=0){var item=h.parentElement;var a=qs('.arrow',h);var l=qs('.subcat-list',item);l.classList.add('open');a.classList.add('open');}});
}
qsa('.cat-header',tree).forEach(function(h){h.addEventListener('click',function(e){if(e.target.classList.contains('cat-add-sc')||e.target.classList.contains('cat-limit')||e.target.classList.contains('cat-del')||e.target.classList.contains('cat-mode-btn'))return;var item=this.parentElement;var a=qs('.arrow',this);var l=qs('.subcat-list',item);var io=l.classList.contains('open');if(io){l.classList.remove('open');a.classList.remove('open');}else{l.classList.add('open');a.classList.add('open');}
// 记住展开状态
S._expandedCats=[];qsa('.subcat-list.open',tree).forEach(function(sl){var h=sl.parentElement.querySelector('.cat-header');if(h)S._expandedCats.push(h.dataset.cat);});saveState();});});
qsa('.cat-add-sc',tree).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();openNewSc(this.dataset.cat);});});
qsa('.cat-limit',tree).forEach(function(inp){inp.addEventListener('change',function(){var v=parseInt(this.value);if(isNaN(v)||v<0)v=0;if(v>99)v=99;this.value=v;S.catLimits[this.dataset.cat]=v;saveCatLimits();});});
qsa('.sc-limit',tree).forEach(function(inp){inp.addEventListener('change',function(){var v=parseInt(this.value);if(isNaN(v)||v<0)v=0;if(v>99)v=99;this.value=v;S.scLimits[this.dataset.sckey]=v;saveScLimits();});});
qsa('.subcat-item',tree).forEach(function(it){it.addEventListener('click',function(e){if(e.target.classList.contains('sc-limit')||e.target.classList.contains('sc-del'))return;S.isSearching=false;S.activeCat=this.dataset.cat;S.activeSc=this.dataset.sc;el('search-input').value='';el('btn-search-clear').style.display='none';el('search-results-info').style.display='none';qsa('.subcat-item',tree).forEach(function(s){s.classList.remove('active');});this.classList.add('active');renderGrid();});});
if(!tree._delBound){tree._delBound=true;tree.addEventListener('click',function(e){var t=e.target;if(t.classList.contains('cat-del')){e.stopPropagation();delBtnClick(t,'cat');}else if(t.classList.contains('sc-del')){e.stopPropagation();delBtnClick(t,'sc');}else if(t.classList.contains('cat-mode-btn')){e.stopPropagation();var cat=t.dataset.cat;S.catModes[cat]=S.catModes[cat]==='cat'?'sc':'cat';saveCatModes();loadAllData();}});}}

function doSearch(q){if(q.length<1){clearSearch();return;}api('/api/search?q='+encodeURIComponent(q)+'&mode='+S.tagMode).then(function(rs){S.isSearching=true;var grid=el('tag-grid');var title=el('browser-title');var info=el('search-results-info');el('browser-actions').innerHTML='';var tc=0;for(var i=0;i<rs.length;i++)tc+=rs[i].tags.length;title.textContent='搜索: '+q;info.style.display='block';info.innerHTML='找到 <b>'+tc+'</b> 个标签，分布在 <b>'+rs.length+'</b> 个子类别';if(rs.length===0){grid.innerHTML='<div class=empty-hint style=padding:40px;text-align:center>未找到相关标签</div>';return;}
var html='';for(var i=0;i<rs.length;i++){var r=rs[i];html+='<div class=search-result-group><h3>'+esc(r.category)+' › '+esc(r.subcategory)+'</h3><div class=tag-grid>';
for(var j=0;j<r.tags.length;j++){var t=r.tags[j];var ip=isSelected(t.en,'positive'),in2=isSelected(t.en,'negative');var sc='';if(ip&&in2)sc=' selected both';else if(ip)sc=' selected positive';else if(in2)sc=' selected negative';var fv=S.favs[t.en]?' faved':'';
html+='<div class=tag-chip'+sc+' data-en="'+esc(t.en)+'" data-zh="'+esc(t.zh||'')+'"><span class=tag-zh>'+esc(t.zh||t.en)+'</span><span class=tag-en>'+esc(t.en)+'</span><span class=tag-star'+fv+' data-en="'+esc(t.en)+'">⭐</span></div>';}
html+='</div></div>';}
grid.innerHTML=html;
qsa('.tag-chip',grid).forEach(function(ch){ch.addEventListener('click',function(e){if(e.target.classList.contains('tag-star'))return;var en=this.dataset.en,zh=this.dataset.zh;if(S.activeTab==='negative'){if(isSelected(en,'negative'))removeTag(en,'negative');else addTag(en,zh,'negative');}else{if(isSelected(en,'positive'))removeTag(en,'positive');else addTag(en,zh,'positive');}doSearch(q);});});
qsa('.tag-star',grid).forEach(function(s){s.addEventListener('click',function(e){e.stopPropagation();toggleFav(this.dataset.en);doSearch(q);});});
});}
function clearSearch(){S.isSearching=false;el('search-results-info').style.display='none';if(S.activeSc)renderGrid();else{el('tag-grid').innerHTML='';el('browser-title').textContent='请从左侧选择一个子类别';}}
function renderFavs(){var list=el('favorites-list');var count=Object.keys(S.favs).length;el('fav-count').textContent=count>0?'('+count+')':'';el('m-fav-count').textContent=count>0?'('+count+')':'';var html='';var keys=Object.keys(S.favs);for(var i=0;i<keys.length;i++){var en=keys[i];var zh=findZh(en);var disp=zh||en;var sub=zh?en:'';html+='<div class=fav-item data-en="'+esc(en)+'" data-zh="'+esc(zh||'')+'"><span style=flex:1;min-width:0><span style=display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap>⭐ '+esc(disp)+'</span>'+(sub?'<span style=display:block;font-size:10px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px>'+esc(sub)+'</span>':'')+'</span><button class=fav-del data-en="'+esc(en)+'" title=取消收藏>✕</button></div>';}if(keys.length===0)html='<div style=padding:4px 14px;font-size:11px;color:var(--text-muted)>点击标签旁的 ⭐ 收藏</div>';list.innerHTML=html;qsa('.fav-item',list).forEach(function(it){it.addEventListener('click',function(e){if(e.target.classList.contains('fav-del'))return;var en=this.dataset.en,zh=this.dataset.zh;if(S.activeTab==='negative'){if(isSelected(en,'negative'))removeTag(en,'negative');else addTag(en,zh,'negative');}else{if(isSelected(en,'positive'))removeTag(en,'positive');else addTag(en,zh,'positive');}});});qsa('.fav-del',list).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();toggleFav(this.dataset.en);});});}
function loadPresets(){api('/api/presets').then(function(d){var list=el('presets-list');var html='';for(var i=0;i<d.builtin.length;i++){var p=d.builtin[i];html+='<div class=preset-item data-preset='+esc(p.name)+' data-type=builtin><span class=preset-cat>'+esc(p.category)+'</span>'+esc(p.name)+' ('+p.tags.length+')<button class=preset-exp data-name='+esc(p.name)+' data-type=builtin title=导出>📤</button><button class=preset-del data-name='+esc(p.name)+' data-type=builtin title=删除>🗑</button></div>';}for(var i=0;i<d.user.length;i++){var p=d.user[i];html+='<div class=preset-item data-filename='+esc(p._filename)+' data-type=user><span class=preset-cat style=background:var(--accent)>我的</span>'+esc(p.name)+' ('+p.tags.length+')<button class=preset-exp data-filename='+esc(p._filename)+' data-type=user title=导出>📤</button><button class=preset-del data-filename='+esc(p._filename)+' data-type=user title=删除>🗑</button></div>';}html+='<div class=preset-item id=btn-import-preset style=color:var(--accent);cursor:pointer;justify-content:center>📥 导入预设...</div>';list.innerHTML=html;qsa('.preset-item',list).forEach(function(it){it.addEventListener('click',function(e){if(e.target.classList.contains('preset-del')||e.target.classList.contains('preset-exp'))return;if(this.dataset.type==='builtin'){var nm=this.dataset.preset;for(var i=0;i<d.builtin.length;i++)if(d.builtin[i].name===nm){applyPreset(d.builtin[i]);break;}}else{var fn=this.dataset.filename;for(var i=0;i<d.user.length;i++)if(d.user[i]._filename===fn){applyPreset(d.user[i]);break;}}});});qsa('.preset-exp',list).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();var rn;if(this.dataset.type==='builtin')rn=this.dataset.name;else rn=this.dataset.filename;api('/api/presets/export/'+encodeURIComponent(rn)).then(function(p){if(p.error){toast(p.error);return;}var bl=new Blob([JSON.stringify(p,null,2)],{type:'application/json'});var u=URL.createObjectURL(bl);var a=document.createElement('a');a.href=u;a.download=rn+'.json';a.click();URL.revokeObjectURL(u);toast('已导出');});});});qsa('.preset-del',list).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();if(!confirm('确定删除预设?'))return;var tp=this.dataset.type;if(tp==='builtin'){var nm=this.dataset.name;api('/api/presets/delete-builtin/'+encodeURIComponent(nm),{method:'DELETE'}).then(function(r){if(r.ok){toast('已删除');loadAllData();loadPresets();}});}else{var fn=this.dataset.filename;api('/api/presets/delete/'+encodeURIComponent(fn),{method:'DELETE'}).then(function(r){if(r.ok){toast('已删除');loadPresets();}});}});});var ib=el('btn-import-preset');if(ib)ib.addEventListener('click',function(){el('modal-import').style.display='';el('import-preset-json').value='';});});}
function applyPreset(p){S.posTags=[];S.negTags=[];var w=p.weights||{};for(var i=0;i<(p.tags||[]).length;i++){var en=p.tags[i];var zh=findZh(en);var info=findCat(en)||{};S.posTags.push({en:en,zh:zh||en,weight:w[en]||1.0,category:info.category||'',subcategory:info.subcategory||''});}var nw=p.negative_weights||{};for(var i=0;i<(p.negative_tags||[]).length;i++){var en=p.negative_tags[i];var zh=findZh(en);var info=findCat(en)||{};S.negTags.push({en:en,zh:zh||en,weight:nw[en]||1.0,category:info.category||'',subcategory:info.subcategory||''});}refreshPanel('positive');refreshPanel('negative');updatePreview();if(!S.isSearching)renderGrid();toast('已加载: '+p.name);}
function _saveGenHistory(prompt){if(!prompt||!prompt.trim())return;
  api('/api/history',{method:'POST',body:{prompt:prompt,tags:S.posTags.map(function(x){return x.en;}),negative_tags:S.negTags.map(function(x){return x.en;})}}).then(function(){loadHistory();});
}
function loadHistory(){api('/api/history').then(function(items){var html='';if(items.length>0){
  html+='<div style=\"display:flex;align-items:center;gap:6px;padding:4px 14px\"><span style=\"font-size:10px;color:var(--text-muted);flex:1\">共 '+items.length+' 条</span><button class=btn-history-clear-m style=\"border:none;background:none;color:var(--text-muted);font-size:10px;cursor:pointer;padding:2px 6px\" title=\"连点5次清空全部记录\">🗑 清空</button></div>';
  for(var i=0;i<Math.min(items.length,50);i++){var h=items[i];var p=h.prompt.length>60?h.prompt.substring(0,60)+'...':h.prompt;html+='<div class=history-item data-id='+esc(h._filename)+' title='+esc(h.created)+'><span style=flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px>'+esc(p)+'</span><button class=hist-del-btn data-id='+esc(h._filename)+' style=\"border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:12px;padding:2px 4px\">✕</button></div>';}
}else{html='<div style=padding:6px 14px;font-size:11px;color:var(--text-muted)>暂无生图记录</div>';}
// 桌面端侧栏
var list=el('history-list');if(list){list.innerHTML=html;}
// 移动端抽屉
var mlist=el('m-history-content');if(mlist){mlist.innerHTML=html;}
// 绑定事件（桌面 + 移动）
_attachHistoryEvents();
});}
function _attachHistoryEvents(){
  // 5次点击清空 — 桌面端和移动端
  qsa('.btn-history-clear-m').forEach(function(clearBtn){
    if(clearBtn._attached)return;clearBtn._attached=true;
    clearBtn._clicks=0;clearBtn.addEventListener('click',function(){clearBtn._clicks++;var left=5-clearBtn._clicks;if(left<=0){api('/api/history/clear',{method:'DELETE'}).then(function(){loadHistory();toast('已清空所有生图记录');});}else{clearBtn.textContent='再点'+left+'次';clearBtn.style.color='var(--danger)';setTimeout(function(){clearBtn._clicks=Math.max(0,clearBtn._clicks-1);var l=5-clearBtn._clicks;clearBtn.textContent=l>=5?'🗑 清空':'再点'+l+'次';if(l>=5)clearBtn.style.color='';},3000);}});
  });
  // 点击历史条目复制提示词
  qsa('.history-item').forEach(function(it){
    if(it._hAttached)return;it._hAttached=true;
    it.addEventListener('click',function(e){if(e.target.classList.contains('hist-del-btn'))return;var id=this.dataset.id;api('/api/history').then(function(items2){for(var j=0;j<items2.length;j++)if(items2[j]._filename===id){el('prompt-output').value=items2[j].prompt;copyText(items2[j].prompt);toast('已复制提示词');break;}});});
  });
  // 删除按钮
  qsa('.hist-del-btn').forEach(function(b){
    if(b._hAttached)return;b._hAttached=true;
    b.addEventListener('click',function(e){e.stopPropagation();var id=this.dataset.id;api('/api/history/'+encodeURIComponent(id),{method:'DELETE'}).then(function(){loadHistory();});});
  });
}
/* === 标签管理弹窗 === */
var tagFormCtx={};
function openTagForm(cat,sc){tagFormCtx={cat:cat,sc:sc,mode:'add'};el('tag-form-title').textContent='添加标签';el('tag-form-info').textContent=cat+' › '+sc;el('tag-form-en').value='';el('tag-form-zh').value='';el('tag-form-old-en').value='';el('modal-tag-form').style.display='';el('tag-form-en').focus();}
function openTagFormEdit(cat,sc,en,zh){tagFormCtx={cat:cat,sc:sc,mode:'edit',oldEn:en};el('tag-form-title').textContent='编辑标签';el('tag-form-info').textContent=cat+' › '+sc;el('tag-form-en').value=en;el('tag-form-zh').value=zh||'';el('tag-form-old-en').value=en;el('modal-tag-form').style.display='';}
function submitTagForm(){var en=el('tag-form-en').value.trim();var zh=el('tag-form-zh').value.trim()||en;if(!en){toast('请输入英文标签');return;}
if(tagFormCtx.mode==='add'){api('/api/custom-tags/add',{method:'POST',body:{category:tagFormCtx.cat,subcategory:tagFormCtx.sc,en:en,zh:zh}}).then(function(r){if(r.ok){toast('标签已添加');el('modal-tag-form').style.display='none';loadAllData();}else{toast(r.error||'添加失败');}});}
else{api('/api/custom-tags/edit',{method:'POST',body:{category:tagFormCtx.cat,subcategory:tagFormCtx.sc,old_en:tagFormCtx.oldEn,new_en:en,new_zh:zh}}).then(function(r){if(r.ok){toast('标签已更新');el('modal-tag-form').style.display='none';loadAllData();}else{toast(r.error||'更新失败');}});}}
function openNewCat(){el('modal-new-cat').style.display='';el('new-cat-name').value='';el('new-cat-name').focus();}
function submitNewCat(){var nm=el('new-cat-name').value.trim();if(!nm){toast('请输入名称');return;}api('/api/custom-tags/add-category',{method:'POST',body:{name:nm}}).then(function(r){if(r.ok){delete S.hidden.categories[nm];saveHidden();toast('大类已创建');el('modal-new-cat').style.display='none';loadAllData();}else{toast(r.error||'创建失败');}});}
function openNewSc(cat){el('new-sc-cat-name').textContent='大类: '+cat;el('modal-new-sc').style.display='';el('new-sc-name').value='';el('modal-new-sc').dataset.cat=cat;el('new-sc-name').focus();}
function submitNewSc(){var cat=el('modal-new-sc').dataset.cat;var nm=el('new-sc-name').value.trim();if(!nm){toast('请输入名称');return;}api('/api/custom-tags/add-subcategory',{method:'POST',body:{category:cat,subcategory:nm}}).then(function(r){if(r.ok){delete S.hidden.subcategories[cat+'|'+nm];saveHidden();toast('子类别已创建');el('modal-new-sc').style.display='none';loadAllData();}else{toast(r.error||'创建失败');}});}

function loadAllData(){api('/api/tags?mode='+S.tagMode).then(function(d){S.allData=d;renderTree();if(S.posTags.length||S.negTags.length){refreshPanel('positive');refreshPanel('negative');updatePreview();}});}
function delBtnClick(btn,type){var s=parseInt(btn.dataset.strike||'0');s++;btn.dataset.strike=s;if(s<6){var remain=6-s;btn.textContent='还需'+remain+'次';btn.style.color='var(--warning)';if(btn._delTimer)clearTimeout(btn._delTimer);btn._delTimer=setTimeout(function(){btn.dataset.strike='0';btn.textContent='🗑';btn.style.color='';},3000);}else{btn.style.color='';var afterDel=function(){loadAllData();refreshPanel('positive');refreshPanel('negative');updatePreview();};if(type==='cat'){fetch('/api/custom-tags/delete-category',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:btn.dataset.cat})}).then(function(r){return r.json();}).then(function(r){if(r.ok){S.activeCat=null;S.activeSc=null;afterDel();toast('已删除分类: '+btn.dataset.cat);}else{toast(r.error||'删除失败');}});}else{var scKey=btn.dataset.sckey;fetch('/api/custom-tags/delete-subcategory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category:btn.dataset.cat,subcategory:btn.dataset.sc})}).then(function(r){return r.json();}).then(function(r){if(r.ok){S.activeCat=null;S.activeSc=null;afterDel();toast('已删除子类别: '+btn.dataset.sc);}else{toast(r.error||'删除失败');}});}}}
function delTagClick(btn){var s=parseInt(btn.dataset.strike||'0');s++;btn.dataset.strike=s;if(s<2){btn.textContent='🔥';btn.style.color='var(--danger)';if(btn._delTimer)clearTimeout(btn._delTimer);btn._delTimer=setTimeout(function(){btn.dataset.strike='0';btn.textContent='🗑';btn.style.color='';},3000);}else{btn.style.color='';var en=btn.dataset.en;if(S.posTags.some(function(t){return t.en===en;}))S.posTags=S.posTags.filter(function(t){return t.en!==en;});if(S.negTags.some(function(t){return t.en===en;}))S.negTags=S.negTags.filter(function(t){return t.en!==en;});fetch('/api/custom-tags/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category:btn.dataset.cat,subcategory:btn.dataset.sc,en:en})}).then(function(r){return r.json();}).then(function(r){if(r.ok){loadAllData();refreshPanel('positive');refreshPanel('negative');updatePreview();toast('已删除标签: '+en);}else{toast('删除失败: '+(r.error||'未知错误'));}});}}

function loadTagMode(){try{var v=localStorage.getItem('grimoire2_tagMode');S.tagMode=v||'phrase';}catch(e){S.tagMode='phrase';}}
function saveTagMode(){localStorage.setItem('grimoire2_tagMode',S.tagMode);_syncSave({tagMode:1});}
function saveState(){var d={mobileTab:(function(){var a=document.querySelector('#m-tabbar .m-tab.active');return a?a.dataset.view:'browser';})(),useQuality:S.useQuality,useWeights:S.useWeights,expandedCats:S._expandedCats||[],autoSortPos:S.autoSortPos,autoSortNeg:S.autoSortNeg};localStorage.setItem('grimoire2_state',JSON.stringify(d));}
function loadState(){try{var d=JSON.parse(localStorage.getItem('grimoire2_state')||'null');if(d){S._expandedCats=d.expandedCats||[];if(d.mobileTab)S._restoreTab=d.mobileTab;if(d.useQuality!==undefined)S.useQuality=d.useQuality;if(d.useWeights!==undefined)S.useWeights=d.useWeights;if(d.autoSortPos!==undefined){S.autoSortPos=d.autoSortPos;if(el('auto-sort-positive'))el('auto-sort-positive').checked=S.autoSortPos;}if(d.autoSortNeg!==undefined)S.autoSortNeg=d.autoSortNeg;}}catch(e){}}
// 服务端同步
function _syncSave(keys){
  var d={};
  function add(k,v){if(!keys||keys[k]){if(typeof v==='object'&&v!==null){if(Array.isArray(v)){if(v.length)d[k]=v;}else{if(Object.keys(v).length)d[k]=v;}}else if(v!==undefined&&v!==null&&v!==''){d[k]=v;}}}
  add('favs',S.favs);
  add('catLimits',S.catLimits);
  add('scLimits',S.scLimits);
  add('catModes',S.catModes);
  add('allowNsfw',S.allowNsfw);
  add('randWeight',S.randWeight);
  add('spaceMode',S.spaceMode);
  add('tagMode',S.tagMode);
  try{var tl=JSON.parse(localStorage.getItem('grimoire2_templates')||'[]');add('templates',tl);}catch(e){}
  add('wfSettings',S.wfSettings||{});
  add('clipMaps',S.clipMaps||{});
  try{add('modelSel',JSON.parse(localStorage.getItem('grimoire2_modelsel')||'{}'));}catch(e){}
  add('llmHist',S.llmHistory||[]);
  add('gallery',_galleryImages);
  try{add('negtpl_list',JSON.parse(localStorage.getItem('grimoire2_negtpl_list')||'[]'));}catch(e){}
  try{add('negtpl',JSON.parse(localStorage.getItem('grimoire2_negtpl')||'{}'));}catch(e){}
  add('loadImg',S.loadImage||{});
  try{add('randprof',JSON.parse(localStorage.getItem('grimoire2_randprof')||'[]'));}catch(e){}
  try{add('uiSettings',JSON.parse(localStorage.getItem('grimoire2_ui')||'{}'));}catch(e){}
  if(Object.keys(d).length)api('/api/user/sync',{method:'POST',body:d});
}
function _syncLoad(cb){
  api('/api/user/sync').then(function(d){
    if(!d)return cb&&cb();
    if(d.favs){S.favs=Object.assign(S.favs||{},d.favs);saveFavs();}
    if(d.catLimits){S.catLimits=Object.assign(S.catLimits||{},d.catLimits);saveCatLimits();}
    if(d.scLimits){S.scLimits=Object.assign(S.scLimits||{},d.scLimits);saveScLimits();}
    if(d.catModes){S.catModes=Object.assign(S.catModes||{},d.catModes);saveCatModes();}
    if(d.allowNsfw!==undefined){S.allowNsfw=d.allowNsfw;saveAllowNsfw();}
    if(d.randWeight!==undefined){S.randWeight=d.randWeight;saveRandWeight();}
    if(d.spaceMode!==undefined){S.spaceMode=d.spaceMode;saveSpaceMode();}
    if(d.tagMode){S.tagMode=d.tagMode;saveTagMode();}
    if(d.templates){localStorage.setItem('grimoire2_templates',JSON.stringify(d.templates));}
    if(d.wfSettings){S.wfSettings=Object.assign(S.wfSettings||{},d.wfSettings);_saveWfSettings();}
    if(d.clipMaps){S.clipMaps=Object.assign(S.clipMaps||{},d.clipMaps);_saveClipMaps();}
    if(d.modelSel){localStorage.setItem('grimoire2_modelsel',JSON.stringify(d.modelSel));}
    if(d.llmHist&&d.llmHist.length){S.llmHistory=d.llmHist;saveLlmHistory();}
    if(d.negtpl_list&&d.negtpl_list.length){localStorage.setItem('grimoire2_negtpl_list',JSON.stringify(d.negtpl_list));}
    if(d.negtpl){localStorage.setItem('grimoire2_negtpl',JSON.stringify(d.negtpl));S.negTemplate=d.negtpl.text||'';S.negTemplateAuto=d.negtpl.auto||false;el('neg-template-input').value=S.negTemplate;el('neg-template-auto').checked=S.negTemplateAuto;}
    if(d.loadImg&&d.loadImg.node_id){S.loadImage=d.loadImg;localStorage.setItem('grimoire2_loadimg',JSON.stringify(d.loadImg));}
    if(d.randprof&&d.randprof.length){localStorage.setItem('grimoire2_randprof',JSON.stringify(d.randprof));}
    if(d.uiSettings){localStorage.setItem('grimoire2_ui',JSON.stringify(d.uiSettings));loadUiSettings();}
    if(d.gallery&&d.gallery.length){
      var merged={};
      for(var i=0;i<d.gallery.length;i++)merged[d.gallery[i].url]=d.gallery[i];
      for(var i=0;i<_galleryImages.length;i++)merged[_galleryImages[i].url]=_galleryImages[i];
      _galleryImages=Object.values(merged);
      localStorage.setItem('grimoire2_gallery',JSON.stringify(_galleryImages));
      // 重建画廊DOM
      if(_galleryImages.length){
        el('comfyui-gallery').style.display='block';
        var imgArea=el('comfyui-gallery-imgs');imgArea.innerHTML='';
        for(var i=0;i<_galleryImages.length;i++){
          var gi=_galleryImages[i];
          var wrap=document.createElement('div');wrap.className='gallery-img-wrap';
          var elm=document.createElement('img');elm.src=gi.url;elm.loading='lazy';
          elm.onerror=function(){this.parentElement.style.display='none';};
          (function(g){elm.addEventListener('click',function(){_openImgPreview(g.url,g.filename||'');});})(gi);
          var info=document.createElement('div');info.className='gallery-img-info';
          var lbl=document.createElement('span');lbl.className='gallery-img-label';lbl.textContent=gi.filename||'';
          info.appendChild(lbl);wrap.appendChild(elm);wrap.appendChild(info);
          imgArea.appendChild(wrap);
        }
        el('gallery-count').textContent=_galleryImages.length+' 张';
      }
    }
    cb&&cb();
  });
}

function init(){
loadFavs();loadCatLimits();loadScLimits();loadCatModes();loadHidden();loadAllowNsfw();loadRandWeight();loadSpaceMode();loadTagMode();loadState();loadLocked();loadUiSettings();loadAllData();loadPresets();loadHistory();renderFavs();_loadGallery();
// 从服务端拉取同步数据
_syncLoad(function(){
  var nsfwBtn=el('btn-nsfw');if(S.allowNsfw)nsfwBtn.classList.add('active');else nsfwBtn.classList.remove('active');
  var rwBtn=el('btn-rand-weight');if(S.randWeight)rwBtn.classList.add('active');else rwBtn.classList.remove('active');
  var tmBtn=el('btn-tag-mode');tmBtn.textContent=S.tagMode==='single'?'📋 短语标签':'🏷 单一标签';if(S.tagMode==='single')tmBtn.classList.add('active');else tmBtn.classList.remove('active');
  var qBtn=el('btn-quality');if(S.useQuality)qBtn.classList.add('active');else qBtn.classList.remove('active');
  var wBtn=el('btn-weights');if(S.useWeights)wBtn.classList.add('active');else wBtn.classList.remove('active');
  updatePreview();
  // 首次推送本地数据到服务器（确保收藏等已有数据同步）
  _syncSave();
});
el('search-input').addEventListener('input',function(){var q=this.value.trim();var b=el('btn-search-clear');if(q){b.style.display='block';doSearch(q);}else{b.style.display='none';clearSearch();}});
el('btn-search-clear').addEventListener('click',function(){el('search-input').value='';this.style.display='none';clearSearch();});
el('fav-toggle').addEventListener('click',function(){var l=el('favorites-list');l.style.display=l.style.display==='none'?'':'none';});
el('auto-sort-positive').addEventListener('change',function(){S.autoSortPos=this.checked;refreshPanel('positive');updatePreview();saveState();});
el('export-format').addEventListener('change',updatePreview);
el('btn-quality').addEventListener('click',function(){S.useQuality=!S.useQuality;if(S.useQuality)this.classList.add('active');else this.classList.remove('active');updatePreview();saveState();});
el('btn-weights').addEventListener('click',function(){S.useWeights=!S.useWeights;if(S.useWeights)this.classList.add('active');else this.classList.remove('active');updatePreview();saveState();});
el('btn-nsfw').addEventListener('click',function(){S.allowNsfw=!S.allowNsfw;if(S.allowNsfw)this.classList.add('active');else this.classList.remove('active');saveAllowNsfw();refreshPanel('positive');refreshPanel('negative');updatePreview();});
el('btn-tag-mode').addEventListener('click',function(){S.tagMode=S.tagMode==='single'?'phrase':'single';this.textContent=S.tagMode==='single'?'📋 短语标签':'🏷 单一标签';this.classList.toggle('active',S.tagMode==='single');saveTagMode();S.activeCat=null;S.activeSc=null;el('tag-grid').innerHTML='';el('browser-title').textContent='请从左侧选择一个子类别';el('search-input').value='';el('btn-search-clear').style.display='none';el('search-results-info').style.display='none';S.isSearching=false;loadAllData();});
var _smLbl=['关闭','空格→_','_→空格'];var _smBtn=el('btn-space-mode');_smBtn.textContent='🔄 '+_smLbl[S.spaceMode];_smBtn.classList.toggle('active',S.spaceMode>0);
el('btn-space-mode').addEventListener('click',function(){S.spaceMode=(S.spaceMode+1)%3;this.textContent='🔄 '+_smLbl[S.spaceMode];this.classList.toggle('active',S.spaceMode>0);saveSpaceMode();updatePreview();});
el('btn-copy').addEventListener('click',function(){var t=el('prompt-output').value;if(!t.trim()){toast('没有可复制的内容');return;}copyText(t);toast('已复制英文提示词!');});
el('btn-copy-cn').addEventListener('click',function(){var pos=getSorted('positive');var neg=getSorted('negative');var parts=[];if(pos.length>0)parts.push(genPromptCN(pos));if(neg.length>0)parts.push('--neg '+genPromptCN(neg));var t=parts.join(', ');if(!t.trim()){toast('没有可复制的内容');return;}copyText(t);toast('已复制中文提示词!');});
el('btn-clear').addEventListener('click',clearAll);
el('rand-count').addEventListener('input',function(){el('rand-count-display').textContent=this.value;});
el('rand-count').addEventListener('change',saveUiSettings);
el('btn-random').addEventListener('click',function(){if(!S.allData)return;var lockedPos=S.posTags.filter(function(t){return t.locked;});var lockedNeg=S.negTags.filter(function(t){return t.locked;});_pushUndo();S.posTags=[];S.negTags=[];for(var i=0;i<lockedNeg.length;i++)S.negTags.push(lockedNeg[i]);var pk=_genRandomTags(lockedPos);S.posTags=pk;refreshPanel('positive');updatePreview();if(!S.isSearching)renderGrid();toast('随机生成 '+pk.length+' 个标签');});
el('btn-batch-add').addEventListener('click',function(){el('modal-batch').style.display='';el('batch-input').value='';el('batch-result').textContent='';el('batch-input').focus();});
el('btn-batch-cancel').addEventListener('click',function(){el('modal-batch').style.display='none';});
el('btn-batch-confirm').addEventListener('click',function(){batchAddTags('positive');});
el('btn-batch-neg').addEventListener('click',function(){batchAddTags('negative');});
function batchAddTags(panel){var raw=el('batch-input').value.trim();if(!raw){toast('请输入标签');return;}var lines=raw.split(/[\n\r]+/).map(function(s){return s.trim();}).filter(function(s){return s.length>0;});var found=0;var nf=[];for(var i=0;i<lines.length;i++){var key=lines[i].split(/[,，]/)[0].trim();if(!key)continue;var kl=key.toLowerCase();var match=null;for(var ci=0;ci<S.allData.categories.length&&!match;ci++){var c=S.allData.categories[ci];for(var si=0;si<c.subcategories.length&&!match;si++){var sc=c.subcategories[si];for(var ti=0;ti<sc.tags.length&&!match;ti++){var t=sc.tags[ti];if(t.en.toLowerCase()===kl||t.en.toLowerCase().includes(kl)||(t.zh&&(t.zh===key||t.zh.includes(key)))){match=t;}}}}if(match){if(!isSelected(match.en,panel)){addTag(match.en,match.zh||match.en,panel);}found++;}else{nf.push(key);}}var result=el('batch-result');if(found===lines.length){result.innerHTML='✅ 成功添加 <b>'+found+'</b> 个标签';result.style.color='var(--success)';}else{var msg='⚠ 找到 <b>'+found+'</b>/'+lines.length+' 个标签';if(nf.length>0)msg+='<br><span style=font-size:10px>未匹配: '+nf.join(', ')+'</span>';result.innerHTML=msg;result.style.color='var(--warning)';}}
el('btn-save-preset').addEventListener('click',function(){if(S.posTags.length===0&&S.negTags.length===0){toast('请先选择标签');return;}el('modal-save').style.display='';el('save-preset-name').value='';el('save-preset-name').focus();});
el('btn-save-confirm').addEventListener('click',function(){var nm=el('save-preset-name').value.trim();if(!nm){toast('请输入名称');return;}var w={};S.posTags.forEach(function(t){w[t.en]=t.weight;});var nw={};S.negTags.forEach(function(t){nw[t.en]=t.weight;});api('/api/presets/save',{method:'POST',body:{name:nm,tags:S.posTags.map(function(t){return t.en;}),weights:w,negative_tags:S.negTags.map(function(t){return t.en;}),negative_weights:nw}}).then(function(r){if(r.ok){toast('已保存: '+nm);el('modal-save').style.display='none';loadPresets();}else{toast(r.error||'未知错误');}});});
el('btn-save-cancel').addEventListener('click',function(){el('modal-save').style.display='none';});
el('btn-add-category').addEventListener('click',openNewCat);
el('btn-new-cat-confirm').addEventListener('click',submitNewCat);
el('btn-new-cat-cancel').addEventListener('click',function(){el('modal-new-cat').style.display='none';});
el('btn-new-sc-confirm').addEventListener('click',submitNewSc);
el('btn-new-sc-cancel').addEventListener('click',function(){el('modal-new-sc').style.display='none';});
el('btn-tag-form-confirm').addEventListener('click',submitTagForm);
el('btn-tag-form-cancel').addEventListener('click',function(){el('modal-tag-form').style.display='none';});
el('btn-sc-batch-confirm').addEventListener('click',function(){var cat=el('sc-batch-cat').textContent;var sc=el('sc-batch-sc').textContent;var raw=el('sc-batch-input').value.trim();if(!raw){toast('请输入标签');return;}var lines=raw.split('\n').map(function(s){return s.trim();}).filter(function(s){return s.length>0;});var done=0,fail=0;var next=function(i){if(i>=lines.length){el('sc-batch-result').innerHTML='✅ 成功添加 <b>'+done+'</b> 个'+(fail>0?', ⚠ '+fail+' 个失败':'')+(fail>0?'':' 🎉');el('sc-batch-result').style.color=fail>0?'var(--warning)':'var(--success)';if(fail===0){setTimeout(function(){el('modal-batch-sc').style.display='none';loadAllData();},800);}return;}var parts=lines[i].split(/[,，]/).map(function(s){return s.trim();});var en=parts[0];var zh=parts[1]||en;if(!en){next(i+1);return;}api('/api/custom-tags/add',{method:'POST',body:{category:cat,subcategory:sc,en:en,zh:zh}}).then(function(r){if(r.ok)done++;else fail++;next(i+1);});};next(0);});
el('btn-sc-batch-cancel').addEventListener('click',function(){el('modal-batch-sc').style.display='none';});
el('btn-batch-del-confirm').addEventListener('click',function(){var cat=el('batch-del-cat').textContent;var sc=el('batch-del-sc').textContent;var raw=el('batch-del-input').value.trim();if(!raw){toast('请输入标签');return;}var lines=raw.split(/[\n\r]+/).map(function(s){return s.trim();}).filter(function(s){return s.length>0;});var done=0,fail=0;var next=function(i){if(i>=lines.length){el('batch-del-result').innerHTML='✅ 已删除 <b>'+done+'</b> 个'+(fail>0?', ⚠ '+fail+' 个失败':'')+(fail>0?'':' 🎉');el('batch-del-result').style.color=fail>0?'var(--warning)':'var(--success)';if(done>0){setTimeout(function(){el('modal-batch-del').style.display='none';loadAllData();},800);}return;}var key=lines[i].split(/[,，]/)[0].trim();if(!key){next(i+1);return;}api('/api/custom-tags/delete',{method:'POST',body:{category:cat,subcategory:sc,en:key}}).then(function(r){if(r.ok)done++;else fail++;next(i+1);});};next(0);});
el('btn-batch-del-cancel').addEventListener('click',function(){el('modal-batch-del').style.display='none';});
el('btn-import-confirm').addEventListener('click',function(){var t=el('import-preset-json').value.trim();if(!t)return;try{var d=JSON.parse(t);if(!d.name){toast('缺少名称');return;}api('/api/presets/import',{method:'POST',body:d}).then(function(r){if(r.ok){toast('已导入: '+d.name);el('modal-import').style.display='none';loadPresets();}else{toast('失败: '+r.error);}});}catch(e){toast('JSON格式错误');}});
el('btn-import-cancel').addEventListener('click',function(){el('modal-import').style.display='none';});
checkComfyUI();loadWorkflows();
el('btn-comfyui-refresh').addEventListener('click',function(){checkComfyUI();loadWorkflows();});
el('btn-comfyui-help').addEventListener('click',function(){var b=el('comfyui-help-box');b.style.display=b.style.display==='none'?'block':'none';});
el('btn-comfyui-lang').addEventListener('click',function(){S.comfyuiLang=S.comfyuiLang==='zh'?'en':'zh';this.textContent=S.comfyuiLang==='zh'?'中':'EN';this.classList.toggle('active',S.comfyuiLang==='en');saveUiSettings();});
el('btn-comfyui-send').addEventListener('click',function(){try{S.comfyuiStopped=false;var wf=el('comfyui-workflow').value;if(!wf){toast('请先选择工作流');return;}var prompt=getCuiPrompt();if(!prompt.trim()){toast('提示词为空');return;}var count=parseInt(el('comfyui-count').value)||1;var w=parseInt(el('comfyui-width').value)||null;var h=parseInt(el('comfyui-height').value)||null;_queueWithRefine(prompt,wf,w,h,count);}catch(e){toast('发送失败: '+e.message);}});
el('btn-comfyui-stop').addEventListener('click',function(){S.comfyuiStopped=true;S.comfyuiQueue=S.comfyuiQueue.filter(function(x){return x.done;});updateQueueUI();toast('当前任务完成后终止');});
el('btn-comfyui-clear-queue').addEventListener('click',function(){S.comfyuiQueue=S.comfyuiQueue.filter(function(x){return x.done;});updateQueueUI();toast('已清空待处理队列');});
el('btn-comfyui-random').addEventListener('click',function(){try{var wf=el('comfyui-workflow').value;if(!wf){toast('请先选择工作流');return;}if(!S.allData){toast('数据未加载');return;}var count=parseInt(el('comfyui-count').value)||4;var w=parseInt(el('comfyui-width').value)||null;var h=parseInt(el('comfyui-height').value)||null;var usedPrompts={};var pkList=[];for(var n=0;n<count;n++){var pk=_genRandomTags();if(pk.length===0)continue;var prompt=_tagsToPrompt(pk);if(!prompt.trim())continue;if(usedPrompts[prompt])continue;usedPrompts[prompt]=true;pkList.push({pk:pk,en:prompt});}if(pkList.length===0){toast('未能生成有效提示词');return;}function _addNext(i){if(i>=pkList.length){if(!S.comfyuiRunning)_execNextQueue();updateQueueUI();toast('🎲 已添加 '+pkList.length+' 张随机生图到队列');return;}var it=pkList[i];var llmPrompt=(function(pk){var isZh=el("llm-lang").value=="zh",cats={},order=[];for(var i=0;i<pk.length;i++){var t=pk[i],cn=t.category||"未分类";if(!cats[cn]){cats[cn]=[];order.push(cn);}cats[cn].push(isZh?(t.zh||t.en):t.en);}var parts=[];for(var i=0;i<order.length;i++)parts.push("["+order[i]+"] "+cats[order[i]].join(", "));return parts.join("\n");})(it.pk);var p=el('llm-auto-refine').checked?function(cb){el('comfyui-result').innerHTML='⏳ AI润色中...('+(i+1)+'/'+pkList.length+')';el('comfyui-result').style.color='var(--text-muted)';_callLlm(llmPrompt,function(text){var r=text||it.en;if(S.template)r=S.template.replace(/{tags}/g,r);S.llmHistory.unshift(r);if(S.llmHistory.length>100)S.llmHistory.pop();saveLlmHistory();cb(r);});}:function(cb){cb(it.en);};p(function(final){S.comfyuiQueue.push({idx:S.comfyuiQueue.length,body:{prompt:final,workflow:wf,width:w,height:h,neg_template:(S.negTemplateAuto?S.negTemplate:''),load_image:S.loadImage||null},done:false});_saveGenHistory(final);_addNext(i+1);});}_addNext(0);}catch(e){toast('随机失败: '+e.message);}});
// 手写生图
el('btn-comfyui-manual').addEventListener('click',function(){el('modal-manual-prompt').style.display='';el('manual-prompt-input').focus();});
// 加载图片功能
S.loadImage=null;
try{var _li=JSON.parse(localStorage.getItem('grimoire2_loadimg')||'null');if(_li)S.loadImage=_li;}catch(e){}
function _saveLoadImage(){localStorage.setItem('grimoire2_loadimg',JSON.stringify(S.loadImage||{}));}
// 拖拽上传（桌面端）
var _loadImgBtn=el('btn-comfyui-loadimg');
_loadImgBtn.addEventListener('dragover',function(e){e.preventDefault();e.stopPropagation();this.style.borderColor='var(--accent)';this.style.background='var(--accent-glow)';});
_loadImgBtn.addEventListener('dragleave',function(e){this.style.borderColor='';this.style.background='';});
_loadImgBtn.addEventListener('drop',function(e){
  e.preventDefault();e.stopPropagation();
  this.style.borderColor='';this.style.background='';
  var file=e.dataTransfer.files[0];
  if(!file||!file.type.startsWith('image/')){toast('请拖入图片文件');return;}
  var wf=el('comfyui-workflow').value;if(!wf){toast('请先选择工作流');return;}
  el('modal-loadimg').style.display='';
  el('loadimg-node').innerHTML='<option value="">加载中...</option>';
  api('/api/comfyui/loadimage-nodes?file='+encodeURIComponent(wf)).then(function(r){
    var nodes=r.nodes||[];
    var sel=el('loadimg-node');sel.innerHTML='<option value="">-- 选择 LoadImage 节点 --</option>';
    for(var i=0;i<nodes.length;i++){sel.innerHTML+='<option value="'+nodes[i].id+'">节点 '+nodes[i].id+(nodes[i].title?' ('+nodes[i].title+')':'')+'</option>';}
    if(S.loadImage&&S.loadImage.node_id){sel.value=S.loadImage.node_id;}
    // 自动上传拖入的图片
    _doUploadImage(file);
  });
});
function _doUploadImage(file){
  var reader=new FileReader();
  reader.onload=function(e){el('loadimg-preview-img').src=e.target.result;el('loadimg-preview').style.display='block';};
  reader.readAsDataURL(file);
  el('loadimg-status').textContent='上传中...';el('loadimg-status').style.color='var(--text-muted)';
  var formData=new FormData();formData.append('file',file);
  fetch('/api/comfyui/upload-image',{method:'POST',body:formData}).then(function(r){return r.json();}).then(function(r){
    if(r.ok){el('loadimg-status').textContent='上传成功！请选择节点绑定';el('loadimg-status').style.color='var(--success)';S._pendingLoadImage={node_id:null,filename:r.filename};}
    else{el('loadimg-status').textContent='上传失败: '+(r.error||'未知');el('loadimg-status').style.color='var(--danger)';}
  });
}
el('btn-comfyui-loadimg').addEventListener('click',function(){
  var wf=el('comfyui-workflow').value;if(!wf){toast('请先选择工作流');return;}
  el('modal-loadimg').style.display='';
  el('loadimg-node').innerHTML='<option value="">加载中...</option>';
  el('loadimg-status').textContent='';
  api('/api/comfyui/loadimage-nodes?file='+encodeURIComponent(wf)).then(function(r){
    var nodes=r.nodes||[];
    var sel=el('loadimg-node');sel.innerHTML='<option value="">-- 选择 LoadImage 节点 --</option>';
    for(var i=0;i<nodes.length;i++){sel.innerHTML+='<option value="'+nodes[i].id+'">节点 '+nodes[i].id+(nodes[i].title?' ('+nodes[i].title+')':'')+'</option>';}
    if(S.loadImage&&S.loadImage.node_id){sel.value=S.loadImage.node_id;}
  });
  if(S.loadImage&&S.loadImage.filename){el('loadimg-status').textContent='已绑定: '+S.loadImage.filename;}
});
el('btn-loadimg-close').addEventListener('click',function(){el('modal-loadimg').style.display='none';});
el('btn-loadimg-clear').addEventListener('click',function(){S.loadImage=null;_saveLoadImage();el('loadimg-status').textContent='';el('loadimg-preview').style.display='none';el('loadimg-file').value='';S._pendingLoadImage=null;toast('已清除图片绑定');});
el('loadimg-file').addEventListener('change',function(){
  var f=this.files[0];if(!f)return;
  var reader=new FileReader();
  reader.onload=function(e){el('loadimg-preview-img').src=e.target.result;el('loadimg-preview').style.display='block';};
  reader.readAsDataURL(f);
});
el('btn-loadimg-upload').addEventListener('click',function(){
  var nodeId=el('loadimg-node').value;
  // 如果是拖拽上传的，使用 pending 的文件名
  if(S._pendingLoadImage&&S._pendingLoadImage.filename){
    S._pendingLoadImage.node_id=nodeId||S._pendingLoadImage.node_id;
    if(!S._pendingLoadImage.node_id){toast('请选择节点');return;}
    S.loadImage=S._pendingLoadImage;_saveLoadImage();S._pendingLoadImage=null;
    el('loadimg-status').textContent='已绑定: '+S.loadImage.filename;el('loadimg-status').style.color='var(--success)';
    return;
  }
  if(!nodeId){toast('请选择节点');return;}
  var file=el('loadimg-file').files[0];if(!file){toast('请选择图片文件');return;}
  var formData=new FormData();formData.append('file',file);
  el('loadimg-status').textContent='上传中...';el('loadimg-status').style.color='var(--text-muted)';
  fetch('/api/comfyui/upload-image',{method:'POST',body:formData}).then(function(r){return r.json();}).then(function(r){
    if(r.ok){S.loadImage={node_id:nodeId,filename:r.filename};_saveLoadImage();
      el('loadimg-status').textContent='已绑定: '+r.filename;el('loadimg-status').style.color='var(--success)';}
    else{el('loadimg-status').textContent='上传失败: '+(r.error||'未知');el('loadimg-status').style.color='var(--danger)';}
  });
});
el('btn-manual-prompt-close').addEventListener('click',function(){el('modal-manual-prompt').style.display='none';});

// ===== 反推生图 =====
// 初始化反推系统指令
(function(){
  try{var rs=JSON.parse(localStorage.getItem('grimoire2_reverse_sys')||'null');if(rs)el('reverse-sysprompt').value=rs;}catch(e){}
})();
el('reverse-sysprompt').addEventListener('change',function(){
  localStorage.setItem('grimoire2_reverse_sys',JSON.stringify(this.value));
});
// 首次加载注入默认反推预设
(function(){
  if(localStorage.getItem('grimoire2_reverse_seeded')==='v3')return;
  localStorage.removeItem('grimoire2_reverse_presets');
  localStorage.setItem('grimoire2_reverse_seeded','v3');
  var defs=[
    {name:'🔍 通用反推',sys:'# 角色\n你是电影级AI绘画提示词导演，专精于从图片反推高质量Stable Diffusion提示词。\n\n# 任务\n仔细观察这张图片，输出一段能在Stable Diffusion中生成类似画面的英文提示词。\n\n# 必须覆盖的维度\n- 具体场景：地点、人物、正在发生什么\n- 人物细节：性别、年龄感、外貌特征、表情神态、发型发色、服装款式与材质、姿态动作\n- 场景环境：空间结构、前景/中景/背景层次、关键物体与材质\n- 光线设计：主光源方向、光质软硬、阴影关系、是否有特殊光效（逆光/侧光/丁达尔/霓虹等）\n- 色彩影调：整体色调倾向、饱和度、对比度、画面情绪\n- 艺术风格：类似的艺术流派或视觉风格\n- 画质与渲染：画质词、细节水平\n- 构图与视角：镜头角度、景深、对焦\n\n# 镜头参数摘要\n在末尾添加：【镜头：焦距_光圈_景深_对焦位置_背景处理】\n\n# 核心原则\n- 不要评价、不要问我问题、不要写\'这张图片展示了...\'\n- 要具体、可执行，写出材质/光线/色彩/空间/镜头和景深的具体细节\n- 不要用空洞形容词，不要写分镜或时间轴\n- 完整一段英文输出，150词左右'},
    {name:'🎌 转二次元/动漫',sys:'# 角色\n你是顶级二次元插画风格转换专家，精通将任何现实或写实风格图片转换为动漫/二次元视觉风格的提示词。\n\n# 任务\n分析这张图片的核心内容（人物关系、构图布局、氛围情绪、视觉重心），然后完全用二次元/动漫风格的词汇重新描述。\n\n# 风格转换规则\n- 保留原图的核心内容、人物数量关系、构图框架、情绪基调\n- 将写实材质描述转换为二次元风格描述：皮肤→瓷白光滑肌肤，头发→柔顺高光发丝，服装→干净利落的衣褶\n- 添加二次元特有视觉元素：cel shading、clean linework、flat coloring with gradient shading、2D illustration\n- 画面风格建议：anime style、manga illustration、anime screencap、light novel illustration、anime key visual\n- 画质词用二次元专用描述：sharp focus、vibrant colors、detailed character design、beautiful anime lighting\n- 不使用 photorealistic / 8K / film grain 等写实摄影词汇\n\n# 输出格式\n英文一段，150词左右。末尾加【镜头】参数。只输出提示词。'},
    {name:'📸 转真人写实',sys:'# 角色\n你是专业时尚/人像摄影视觉导演，精通将任何动漫或手绘风格图片转换为真人写实摄影风格的提示词。\n\n# 任务\n分析这张图片的核心内容（人物关系、构图布局、氛围情绪、视觉重心），然后完全用真人写实/电影摄影风格的词汇重新描述。\n\n# 风格转换规则\n- 保留原图的核心内容、人物数量关系、构图框架、情绪基调\n- 将所有卡通化描述转为真实物理世界描述：动漫比例的眼睛→自然比例的人眼，扁平色彩→真实肤色与光影过渡\n- 添加摄影级写实描述：photorealistic、8K UHD、hyper-detailed skin texture、natural skin imperfections、subsurface scattering\n- 光线用摄影语言：soft diffused window light、Rembrandt lighting、golden hour rim light、studio softbox\n- 材质用真实质感描述：cotton fabric weave、leather grain、silk sheen、metal patina\n- 添加摄影技术词汇：shot on 85mm prime lens、shallow depth of field、bokeh background、Fujifilm color grading\n- 不使用 anime / cel shading / 2D / illustration 等二次元词汇\n\n# 输出格式\n英文一段，150词左右。末尾加【镜头】参数。只输出提示词。'},
    {name:'🎨 转油画/手绘',sys:'# 角色\n你是传统绘画艺术研究专家，精通将数字或摄影风格图片转换为传统手绘/油画视觉风格的提示词。\n\n# 任务\n分析这张图片的核心内容，然后用传统绘画技法语言重新描述，使其能在Stable Diffusion中生成类似传统艺术品的画面。\n\n# 风格描述要求\n- 指定具体画种：oil painting / watercolor / gouache / charcoal drawing / ink wash / pastel\n- 画面技法描述：impasto thick brushstrokes、visible canvas texture、wet-on-wet blending、dry brush technique、sgraffito scratches\n- 颜料质感：rich oil pigments、layered translucent glazes、thick paint buildup on highlights\n- 载体描述：on stretched canvas、on cold-pressed watercolor paper、on textured linen\n- 艺术流派参考：in the style of impressionism / baroque / classical realism / art nouveau\n- 灯光对传统绘画的影响：chiaroscuro dramatic lighting、soft north-facing window light\n- 画框/环境：ornate gilded frame、gallery wall、museum lighting\n\n# 输出格式\n英文一段，150词左右。末尾加【镜头】参数。只输出提示词。'},
    {name:'🌃 转赛博朋克',sys:'# 角色\n你是赛博朋克世界观视觉设计总监，精通将任何场景转换为赛博朋克/科幻反乌托邦视觉风格。\n\n# 任务\n分析这张图片的核心内容，保留人物的基本关系和构图骨架，但将所有视觉元素风格化为赛博朋克世界。\n\n# 必须替换/添加的元素\n- 环境：原图场景→密集的未来城市/黑暗街巷/工业区/高科技地下城\n- 光线：主光源→霓虹灯管（品红/青蓝/琥珀色）、全息投影的漫射光、闪烁的荧光灯、湿漉漉路面反射的霓虹倒影\n- 材质：建筑→混凝土+金属格栅+生锈管道、地面→湿沥青+金属网板、墙面→涂鸦覆盖的腐蚀金属板\n- 科技元素：cybernetic implants、neural interface ports、holographic UI displays、LED data streams、augmented reality overlays\n- 人物改装：机械义肢/数据接口/电子眼/皮下电路纹路（如果原图有相应位置可添加）\n- 氛围：雾霾/蒸汽/雨滴/闪烁的电弧、弥漫的青色或品红色环境光\n\n# 风格关键词（必须融入）\ncyberpunk、neon-lit、rain-slicked streets、dystopian megacity、high-tech low-life、Blade Runner aesthetic、synthwave color palette、volumetric fog with neon scattering\n\n# 输出格式\n英文一段，150词左右。末尾加【镜头】参数。只输出提示词。'},
    {name:'📝 中文反推（详细）',sys:'# 角色\n你是资深AI绘画审图师，专精于从图片反向提取高质量画面描述。\n\n# 任务\n仔细观察这张图片，按以下维度写出详细的中文画面描述：\n\n- 整体印象：这张画面给你的第一感觉是什么（30字以内）\n- 具体场景：什么地方、谁、在做什么\n- 人物细节：性别年龄、发型发色、五官神态、服装款式与材质、姿态动作、身材比例\n- 场景环境：空间结构、具体物品、材质质感\n- 光线设计：主光方向、光质软硬、特殊光效\n- 色彩影调：主色调、饱和度、明暗对比、情绪氛围\n- 艺术风格：类似的艺术流派或视觉风格\n- 构图视角：镜头焦段、景深、视角高低\n\n# 格式\n完整一段中文，200字左右，流畅自然，不要列表或编号。末尾附【镜头：焦距_光圈_景深_对焦位置_背景处理】。只输出描述。'}
  ];
  localStorage.setItem('grimoire2_reverse_presets',JSON.stringify(defs));
})();
// 反推并生图
el('btn-reverse-generate').addEventListener('click',function(){
  var file=el('loadimg-file').files[0];
  if(!file){toast('请先选择一张图片');return;}
  var wf=el('comfyui-workflow').value;
  if(!wf){toast('请先选择工作流');return;}
  var rd=new FileReader();
  rd.onload=function(e){
    var base64=e.target.result.split(',')[1];
    var sys=el('reverse-sysprompt').value.trim()||'请描述这张图片的内容，输出英文提示词';
    toast('⏳ AI反推中...');
    el('reverse-result').style.display='block';
    el('reverse-result').textContent='⏳ 正在分析图片...';
    api('/api/llm/translate',{method:'POST',body:{prompt:'[图片]',sysprompt:sys,url:el('llm-url').value,model:el('llm-model').value,key:el('llm-key').value,image:base64}}).then(function(r){
      if(r.ok&&r.text){
        var reversePrompt=r.text.trim();
        el('reverse-result').textContent='✅ 反推结果: '+reversePrompt;
        var w=parseInt(el('comfyui-width').value)||null,h=parseInt(el('comfyui-height').value)||null;
        var over=getModelOverrides(),rs=el('comfyui-rand-seed').checked;
        var wfs=S.wfSettings[wf]||{},clipmap=_getClipMapping(),negTpl=S.negTemplateAuto?S.negTemplate:'';
        S.comfyuiQueue.push({idx:S.comfyuiQueue.length,body:{prompt:reversePrompt,workflow:wf,width:w,height:h,overrides:over,rand_seed:rs,wf_settings:wfs,clip_mapping:clipmap,neg_template:negTpl,load_image:S.loadImage||null},done:false});
        if(!S.comfyuiRunning)_execNextQueue();updateQueueUI();
        _saveGenHistory(reversePrompt);
        el('modal-loadimg').style.display='none';
        toast('✅ 反推完成，已发送到队列');
      }else{
        el('reverse-result').textContent='❌ 反推失败: '+(r.error||'未知错误');
        toast('反推失败');
      }
    });
  };
  rd.readAsDataURL(file);
});
// 保存反推预设
el('btn-reverse-save-preset').addEventListener('click',function(){
  var nm=prompt('预设名称:');
  if(!nm)return;
  var list=(function(){try{return JSON.parse(localStorage.getItem('grimoire2_reverse_presets')||'[]');}catch(e){return[];}})();
  list=list.filter(function(x){return x.name!==nm;});
  list.push({name:nm,sys:el('reverse-sysprompt').value});
  localStorage.setItem('grimoire2_reverse_presets',JSON.stringify(list));
  toast('已保存: '+nm);
});
// 加载反推预设
el('btn-reverse-load-preset').addEventListener('click',function(){
  var list=(function(){try{return JSON.parse(localStorage.getItem('grimoire2_reverse_presets')||'[]');}catch(e){return[];}})();
  var div=el('reverse-presets-list');
  var html='';
  if(list.length===0){html='<div style="padding:20px;text-align:center;font-size:11px;color:var(--text-muted)">暂无保存的预设</div>';}
  else{
    for(var i=0;i<list.length;i++){
      var p=list[i],si=p.sys?p.sys.substring(0,60)+(p.sys.length>60?'...':''):'(空)';
      html+='<div style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--border);font-size:11px">';
      html+='<button class="rev-preset-load" data-idx="'+i+'" style="padding:2px 10px;border:1px solid var(--accent);border-radius:3px;background:none;color:var(--accent);cursor:pointer;font-size:10px;white-space:nowrap">加载</button>';
      html+='<div style="flex:1;min-width:0"><div style="font-weight:600">'+esc(p.name)+'</div><div style="font-size:10px;color:var(--text-muted)">'+esc(si)+'</div></div>';
      html+='<button class="rev-preset-del" data-idx="'+i+'" title="连点3次删除" style="border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:12px">🗑</button>';
      html+='</div>';
    }
  }
  div.innerHTML=html;
  qsa('.rev-preset-load',div).forEach(function(b){b.addEventListener('click',function(){
    var p=list[parseInt(this.dataset.idx)];
    el('reverse-sysprompt').value=p.sys||'';
    localStorage.setItem('grimoire2_reverse_sys',JSON.stringify(p.sys||''));
    el('modal-reverse-presets').style.display='none';
    toast('已加载: '+p.name);
  });});
  qsa('.rev-preset-del',div).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();
    var s=parseInt(this.dataset.strike||'0');s++;this.dataset.strike=s;
    if(s>=3){
      var nl=list.filter(function(_,j){return j!==parseInt(b.dataset.idx);});
      localStorage.setItem('grimoire2_reverse_presets',JSON.stringify(nl));
      div.removeChild(this.parentElement);toast('已删除');
    }else{this.textContent='🗑'+(3-s);this.style.color='var(--danger)';}
  });});
  el('modal-reverse-presets').style.display='';
});
el('btn-reverse-presets-close').addEventListener('click',function(){el('modal-reverse-presets').style.display='none';});
el('btn-manual-prompt-send').addEventListener('click',function(){
  var wf=el('comfyui-workflow').value;if(!wf){toast('请先选择工作流');return;}
  var text=el('manual-prompt-input').value.trim();if(!text){toast('请写提示词');return;}
  var w=parseInt(el('comfyui-width').value)||null;
  var h=parseInt(el('comfyui-height').value)||null;
  var count=parseInt(el('comfyui-count').value)||1;
  var over=getModelOverrides();var rs=el('comfyui-rand-seed').checked;
  var wfs=S.wfSettings[wf]||{};var clipmap=_getClipMapping();
  var negTpl=S.negTemplateAuto?S.negTemplate:'';
  var negPart=genPrompt(getSorted('negative'));
  // 如果没改过宽高就用工作流默认
  if(!w||!h){w=null;h=null;}
  function _addManual(finalPrompt){
    for(var n=0;n<count;n++){
      S.comfyuiQueue.push({idx:S.comfyuiQueue.length,body:{prompt:finalPrompt,workflow:wf,width:w,height:h,overrides:over,rand_seed:rs,wf_settings:wfs,clip_mapping:clipmap,neg_template:negTpl,load_image:S.loadImage||null},done:false});
    }
    _saveGenHistory(finalPrompt);
    if(!S.comfyuiRunning)_execNextQueue();updateQueueUI();
    el('modal-manual-prompt').style.display='none';
    toast('已添加 '+count+' 个手写任务到队列');
  }
  if(el('llm-auto-refine').checked){
    toast('⏳ AI润色中...');
    _callLlm(text,function(tt){
      var r=tt||text;
      if(!tt)toast('润色失败，使用原文');
      if(S.template)r=S.template.replace(/{tags}/g,r);
      if(negPart)r+='\n--neg '+negPart;
      S.llmHistory.unshift(r);if(S.llmHistory.length>100)S.llmHistory.pop();saveLlmHistory();
      _addManual(r);
    });
  }else{
    var fullPrompt=text;
    if(negPart)fullPrompt+='\n--neg '+negPart;
    _addManual(fullPrompt);
  }
});
el('btn-comfyui-size').addEventListener('click',function(){fetchSize();});
el('comfyui-width').addEventListener('change',saveUiSettings);
el('comfyui-height').addEventListener('change',saveUiSettings);
el('comfyui-count').addEventListener('change',saveUiSettings);

el('btn-template-toggle').addEventListener('click',function(){var b=el('template-body');if(!b)return;b.style.display=(b.style.display==='none'||!b.style.display)?'block':'none';});
el('template-input').addEventListener('input',function(){S.template=this.value;updatePreview();saveUiSettings();});
el('btn-template-reset').addEventListener('click',function(){S.template='';el('template-input').value='';updatePreview();saveUiSettings();});
el('btn-template-save').addEventListener('click',function(){var t=el('template-input').value.trim();if(!t){toast('模板为空');return;}var nm=prompt('模板名称:');if(!nm)return;var list=[];try{list=JSON.parse(localStorage.getItem('grimoire2_templates')||'[]');}catch(e){}list=list.filter(function(x){return x.name!==nm;});list.push({name:nm,text:t});localStorage.setItem('grimoire2_templates',JSON.stringify(list));_syncSave({templates:1});toast('已保存: '+nm);});
el('btn-template-load').addEventListener('click',function(){var list=[];try{list=JSON.parse(localStorage.getItem('grimoire2_templates')||'[]');}catch(e){}var div=el('template-load-list');var html='';for(var i=0;i<list.length;i++){html+='<div class=temp-load-item style=display:flex;align-items:center;gap:4px;padding:6px 8px;border-bottom:1px solid var(--border);font-size:11px><button class=temp-load-btn data-idx='+i+' style=padding:2px 8px;border:1px solid var(--accent);border-radius:3px;background:none;color:var(--accent);cursor:pointer;font-size:10px;white-space:nowrap;flex-shrink:0>加载</button><span style=flex:1;font-weight:500>'+esc(list[i].name)+'</span><span style=font-size:10px;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap>'+esc(list[i].text.length>40?list[i].text.substring(0,40)+'...':list[i].text)+'</span><button class=temp-load-del data-name='+esc(list[i].name)+' style=border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:11px>✕</button></div>';}div.innerHTML=html||'<div style=padding:20px;text-align:center;color:var(--text-muted);font-size:11px>暂无保存的模板</div>';qsa('.temp-load-btn',div).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();var idx=parseInt(this.dataset.idx);var t=list[idx];if(t){S.template=t.text;el('template-input').value=t.text;updatePreview();saveUiSettings();el('modal-template-load').style.display='none';toast('已加载: '+t.name);}});});qsa('.temp-load-del',div).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();var s=parseInt(this.dataset.strike||'0');s++;this.dataset.strike=s;if(s<3){var r=3-s;this.textContent=r;this.style.color='var(--danger)';if(this._delTimer)clearTimeout(this._delTimer);this._delTimer=setTimeout(function(){b.dataset.strike='0';b.textContent='✕';b.style.color='';},3000);}else{var nm=this.dataset.name;var nl=list.filter(function(x){return x.name!==nm;});localStorage.setItem('grimoire2_templates',JSON.stringify(nl));_syncSave({templates:1});el('template-load-list').removeChild(this.parentElement);if(nl.length===0)div.innerHTML='<div style=padding:20px;text-align:center;color:var(--text-muted);font-size:11px>暂无保存的模板</div>';}});});el('modal-template-load').style.display='';});
el('btn-template-load-close').addEventListener('click',function(){el('modal-template-load').style.display='none';});
// 负面提示词预设
function loadNegTemplate(){try{var d=JSON.parse(localStorage.getItem('grimoire2_negtpl')||'null');if(d){S.negTemplate=d.text||'';S.negTemplateAuto=d.auto||false;}else{S.negTemplate='';S.negTemplateAuto=false;}if(el('neg-template-input'))el('neg-template-input').value=S.negTemplate;if(el('neg-template-auto'))el('neg-template-auto').checked=S.negTemplateAuto;}catch(e){S.negTemplate='';S.negTemplateAuto=false;}
  if(!S.negTemplate&&!localStorage.getItem('grimoire2_negtpl_seeded')){
    S.negTemplate='low quality, worst quality, blurry, bad anatomy, bad hands, extra fingers, missing fingers, deformed, disfigured, ugly, watermark, text, signature';
    if(el('neg-template-input'))el('neg-template-input').value=S.negTemplate;
    localStorage.setItem('grimoire2_negtpl_seeded','1');
  }
}
function saveNegTemplate(){var d={text:el('neg-template-input').value,auto:el('neg-template-auto').checked};S.negTemplate=d.text;S.negTemplateAuto=d.auto;localStorage.setItem('grimoire2_negtpl',JSON.stringify(d));_syncSave({negtpl:1});}
loadNegTemplate();
el('btn-neg-template-toggle').addEventListener('click',function(){var b=el('neg-template-body');if(!b)return;b.style.display=(b.style.display==='none'||!b.style.display)?'block':'none';});
el('neg-template-input').addEventListener('input',function(){S.negTemplate=this.value;});
el('neg-template-auto').addEventListener('change',function(){S.negTemplateAuto=this.checked;saveNegTemplate();});
el('btn-neg-template-reset').addEventListener('click',function(){S.negTemplate='';el('neg-template-input').value='';saveNegTemplate();});
el('btn-neg-template-save').addEventListener('click',function(){
  var t=el('neg-template-input').value.trim();if(!t){toast('内容为空');return;}
  var nm=prompt('预设名称:');if(!nm)return;
  var list=[];try{list=JSON.parse(localStorage.getItem('grimoire2_negtpl_list')||'[]');}catch(e){}
  list=list.filter(function(x){return x.name!==nm;});
  list.push({name:nm,text:t});localStorage.setItem('grimoire2_negtpl_list',JSON.stringify(list));_syncSave({negtpl_list:1});toast('已保存: '+nm);
});
el('btn-neg-template-load').addEventListener('click',function(){
  var list=[];try{list=JSON.parse(localStorage.getItem('grimoire2_negtpl_list')||'[]');}catch(e){}
  if(list.length===0){
    list=[
      {name:'基础画质负面(EN)',text:'low quality, worst quality, blurry, bad anatomy, bad hands, extra fingers, missing fingers, deformed, disfigured, ugly, watermark, text, signature, jpeg artifacts, out of frame, cropped'},
      {name:'基础画质负面(CN)',text:'低质量, 最差质量, 模糊, 结构崩坏, 手部崩坏, 多余手指, 缺手指, 变形, 畸形, 丑陋, 水印, 文字, 签名, JPEG噪点, 出画, 被裁切'},
      {name:'肖像负面(EN)',text:'ugly face, distorted face, bad face, extra digit, fewer digits, bad proportions, disfigured, clone, duplicate, extra limbs, missing limbs, mutated, long neck, long body, twisted body, asymmetrical, childish'},
      {name:'风景负面(EN)',text:'people, person, human, girl, boy, portrait, face, ugly, blurry, low quality, worst quality, watermark, text, signature, frame, border'},
      {name:'通用全屏蔽(EN)',text:'nsfw, nude, naked, gore, horror, mutated, deformed, bad anatomy, bad hands, extra fingers, missing fingers, ugly, blurry, low quality, worst quality, watermark, text, signature, jpeg artifacts, disfigured, clone, duplicate, extra limbs, missing limbs, fused fingers, too many fingers, long neck'},
      {name:'动漫肖像负面(EN)',text:'realistic, photorealistic, 3d, render, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name'},
    ];
    localStorage.setItem('grimoire2_negtpl_list',JSON.stringify(list));
  }
  var html='';
  for(var i=0;i<list.length;i++){
    html+='<div style="display:flex;align-items:center;gap:4px;padding:8px 10px;border-bottom:1px solid var(--border);font-size:11px">';
    html+='<button class=negtpl-load-btn data-idx='+i+' style="padding:3px 10px;border:1px solid var(--accent);border-radius:3px;background:none;color:var(--accent);cursor:pointer;font-size:10px;white-space:nowrap;flex-shrink:0">加载</button>';
    html+='<span style=flex:1;font-weight:500>'+esc(list[i].name)+'</span>';
    html+='<span style=font-size:10px;color:var(--text-muted);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap>'+esc(list[i].text.length>30?list[i].text.substring(0,30)+'...':list[i].text)+'</span>';
    html+='<button class=negtpl-del-btn data-name='+esc(list[i].name)+' style=border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:12px>✕</button>';
    html+='</div>';
  }
  var div=el('template-load-list');div.innerHTML=html||'<div style=padding:20px;text-align:center;color:var(--text-muted);font-size:11px>暂无保存的预设</div>';
  qsa('.negtpl-load-btn',div).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();var t=list[parseInt(this.dataset.idx)];if(t){S.negTemplate=t.text;el('neg-template-input').value=t.text;saveNegTemplate();el('modal-template-load').style.display='none';toast('已加载: '+t.name);}});});
  qsa('.negtpl-del-btn',div).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();var s=parseInt(this.dataset.strike||'0');s++;this.dataset.strike=s;if(s<3){var r=3-s;this.textContent=r;this.style.color='var(--danger)';if(this._delTimer)clearTimeout(this._delTimer);this._delTimer=setTimeout(function(){b.dataset.strike='0';b.textContent='✕';b.style.color='';},3000);}else{var nm=this.dataset.name;var nl=list.filter(function(x){return x.name!==nm;});localStorage.setItem('grimoire2_negtpl_list',JSON.stringify(nl));_syncSave({negtpl_list:1});el('template-load-list').removeChild(this.parentElement);if(nl.length===0)div.innerHTML='<div style=padding:20px;text-align:center;color:var(--text-muted);font-size:11px>暂无保存的预设</div>';}})});
  el('modal-template-load').style.display='';
});
el('btn-llm-toggle').addEventListener('click',function(){var b=el('llm-body');if(!b)return;b.style.display=(b.style.display==='none'||!b.style.display)?'block':'none';});
// 随机配置方案（保存/加载 catLimits + scLimits + catModes）
function _getRandProfiles(){try{return JSON.parse(localStorage.getItem('grimoire2_randprof')||'[]');}catch(e){return[];}}
function _saveRandProfiles(list){localStorage.setItem('grimoire2_randprof',JSON.stringify(list));_syncSave({randprof:1});}
function _renderRandProfiles(){
  var list=_getRandProfiles();
  var div=el('rand-profile-list');
  if(list.length===0){div.innerHTML='<div style=\"padding:12px;text-align:center;color:var(--text-muted);font-size:11px\">暂无保存的方案</div>';return;}
  var html='';
  for(var i=0;i<list.length;i++){
    var p=list[i];
    var cats=Object.keys(p.catLimits||{}).filter(function(k){return p.catLimits[k];});
    html+='<div style=\"display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid var(--border);font-size:11px\">';
    html+='<span style=flex:1;font-weight:500>'+esc(p.name)+'</span><span style=\"font-size:10px;color:var(--text-muted)\">'+cats.length+'类</span>';
    html+='<button class=randprof-load-btn data-idx='+i+' style=\"padding:3px 8px;border:1px solid var(--accent);border-radius:3px;background:none;color:var(--accent);cursor:pointer;font-size:10px;white-space:nowrap\">加载</button>';
    html+='<button class=randprof-del-btn data-idx='+i+' style=border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:12px>✕</button>';
    html+='</div>';
  }
  div.innerHTML=html;
  qsa('.randprof-load-btn',div).forEach(function(b){b.addEventListener('click',function(){
    var p=list[parseInt(this.dataset.idx)];
    S.catLimits=JSON.parse(JSON.stringify(p.catLimits||{}));
    S.scLimits=JSON.parse(JSON.stringify(p.scLimits||{}));
    S.catModes=JSON.parse(JSON.stringify(p.catModes||{}));
    saveCatLimits();saveScLimits();saveCatModes();
    renderTree();if(_isMobile)_buildMobileDrawer();
    el('modal-rand-profile').style.display='none';
    toast('已加载方案: '+p.name);
  });});
  qsa('.randprof-del-btn',div).forEach(function(b){b.addEventListener('click',function(e){
    e.stopPropagation();
    var nl=list.filter(function(_,j){return j!==parseInt(b.dataset.idx);});
    _saveRandProfiles(nl);_renderRandProfiles();
  });});
}
el('btn-rand-profile').addEventListener('click',function(){
  el('modal-rand-profile').style.display='';
  el('rand-profile-name').value='';
  _renderRandProfiles();
});
el('btn-rand-profile-close').addEventListener('click',function(){el('modal-rand-profile').style.display='none';});
el('btn-rand-profile-save').addEventListener('click',function(){
  var nm=el('rand-profile-name').value.trim();if(!nm){toast('请输入方案名称');return;}
  var list=_getRandProfiles();
  list=list.filter(function(x){return x.name!==nm;});
  list.push({name:nm,catLimits:JSON.parse(JSON.stringify(S.catLimits)),scLimits:JSON.parse(JSON.stringify(S.scLimits)),catModes:JSON.parse(JSON.stringify(S.catModes))});
  _saveRandProfiles(list);_renderRandProfiles();el('rand-profile-name').value='';
  toast('已保存方案: '+nm);
});
var _llmDefaults={openai:{url:'https://api.openai.com/v1',model:'gpt-4o-mini'},lmstudio:{url:'http://127.0.0.1:1234/v1',model:''},ollama:{url:'http://127.0.0.1:11434/v1',model:'qwen2.5'},custom:{url:'',model:''}};
function loadLlmConfig(){
  // 优先从服务端加载（手机/桌面共享）
  api('/api/llm/config').then(function(srv){
    var s=srv&&srv.prov?srv:null;
    if(!s){try{var d=localStorage.getItem('grimoire2_llm');if(d)s=JSON.parse(d);}catch(e){}}
    if(s){
      el('llm-provider').value=s.prov||'openai';el('llm-url').value=s.url||'';el('llm-model').value=s.model||'';
      el('llm-key').value=s.key||'';el('llm-sysprompt').value=s.sys||'';el('llm-auto-refine').checked=s.auto||false;
      el('llm-lang').value=s.lang||'en';el('llm-concurrent').checked=s.allowCon||false;
    }
  }).catch(function(){
    try{var d=localStorage.getItem('grimoire2_llm');if(d){var s=JSON.parse(d);
      el('llm-provider').value=s.prov||'openai';el('llm-url').value=s.url||'';el('llm-model').value=s.model||'';
      el('llm-key').value=s.key||'';el('llm-sysprompt').value=s.sys||'';el('llm-auto-refine').checked=s.auto||false;
      el('llm-lang').value=s.lang||'en';el('llm-concurrent').checked=s.allowCon||false;
    }}catch(e){}
  });
}
function saveLlmConfig(){
  var s={prov:el('llm-provider').value,url:el('llm-url').value,model:el('llm-model').value,key:el('llm-key').value,sys:el('llm-sysprompt').value,auto:el('llm-auto-refine').checked,lang:el('llm-lang').value,allowCon:el('llm-concurrent').checked};
  localStorage.setItem('grimoire2_llm',JSON.stringify(s));
  api('/api/llm/config/save',{method:'POST',body:s});
}
loadLlmConfig();
el('llm-provider').addEventListener('change',function(){var d=_llmDefaults[this.value];if(d){if(d.url)el('llm-url').value=d.url;if(d.model)el('llm-model').value=d.model;if(this.value==='ollama'||this.value==='lmstudio')el('llm-key').value='';}saveLlmConfig();});
el('llm-url').addEventListener('change',saveLlmConfig);el('llm-model').addEventListener('change',saveLlmConfig);el('llm-key').addEventListener('change',saveLlmConfig);el('llm-sysprompt').addEventListener('change',saveLlmConfig);el('llm-auto-refine').addEventListener('change',saveLlmConfig);el('llm-lang').addEventListener('change',saveLlmConfig);el('llm-concurrent').addEventListener('change',saveLlmConfig);


function _callLlm(prompt,callback){if(!el('llm-concurrent').checked&&S.comfyuiRunning){toast('ComfyUI正在运行，请等待');callback(null);return;}S.llmRunning=true;var sys=el('llm-sysprompt').value.trim()||'你是一个AI绘画提示词转换器，将标签式提示词转换成自然语言描述。';console.log('📤 发送给LLM的标签:\n'+prompt);api('/api/llm/translate',{method:'POST',body:{prompt:prompt,sysprompt:sys,url:el('llm-url').value,model:el('llm-model').value,key:el('llm-key').value}}).then(function(r){S.llmRunning=false;callback(r.ok?r.text:null);});}
el('btn-llm-send').addEventListener('click',function(){var prompt;if(S.posTags.length){var isZh=el('llm-lang').value=='zh',cats={},order=[],pk=S.posTags;for(var i=0;i<pk.length;i++){var t=pk[i],c=t.category||'未分类';if(!cats[c]){cats[c]=[];order.push(c);}cats[c].push(isZh?(t.zh||t.en):t.en);}var parts=[];for(var i=0;i<order.length;i++)parts.push('['+order[i]+'] '+cats[order[i]].join(', '));prompt=parts.join('\n');if(S.negTags.length)prompt+='\n[负面标签] '+genPrompt(S.negTags);}else{prompt=el('prompt-output').value;}if(!prompt.trim()){toast('提示词为空');return;}el('llm-result').textContent='⏳ 生成中...';console.log('📤 AI润色发送:\n'+prompt);S.llmRunning=true;api('/api/llm/translate',{method:'POST',body:{prompt:prompt,sysprompt:el('llm-sysprompt').value.trim()||'你是一个AI绘画提示词转换器',url:el('llm-url').value,model:el('llm-model').value,key:el('llm-key').value}}).then(function(r){S.llmRunning=false;var text=r.ok?r.text:null;if(text){var r2=text;if(S.template)r2=S.template.replace(/{tags}/g,r2);S.llmHistory.unshift(r2);if(S.llmHistory.length>100)S.llmHistory.pop();saveLlmHistory();el('llm-result').textContent=r2;el('llm-result').style.color='var(--text-primary)';}else{el('llm-result').textContent='❌ 请求失败';el('llm-result').style.color='var(--danger)';}});});
el('btn-llm-copy').addEventListener('click',function(){var t=el('llm-result').textContent;if(!t.trim()||t.startsWith('❌')||t.startsWith('⏳')){toast('没有可复制的内容');return;}copyText(t);toast('已复制');});
el('btn-export-batch').addEventListener('click',function(){el('modal-export-batch').style.display='';el('export-batch-count').value='50';el('export-batch-count').focus();});
el('btn-export-batch-cancel').addEventListener('click',function(){el('modal-export-batch').style.display='none';});
el('btn-export-batch-confirm').addEventListener('click',function(){var cnt=parseInt(el('export-batch-count').value)||50;if(cnt<1)cnt=1;if(cnt>1000)cnt=1000;var lines=[];for(var n=0;n<cnt;n++){var pk=_genRandomTags();if(pk.length===0){n--;continue;}lines.push(_tagsToPrompt(pk));}var bl=new Blob([lines.join('\n---\n\n')],{type:'text/plain'});var u=URL.createObjectURL(bl);var a=document.createElement('a');a.href=u;a.download='prompts_'+cnt+'组.txt';a.click();URL.revokeObjectURL(u);el('modal-export-batch').style.display='none';toast('已导出 '+cnt+' 组提示词');});
qsa('.modal').forEach(function(m){m.addEventListener('click',function(e){if(e.target===this)this.style.display='none';});});
document.addEventListener('keydown',function(e){
if(e.ctrlKey&&e.key==='k'){e.preventDefault();el('search-input').focus();}
if(e.ctrlKey&&e.key==='z'&&!e.shiftKey){e.preventDefault();if(S.undoIdx>=0){var snap=S.undoStack[S.undoIdx];S.posTags=snap.pos;S.negTags=snap.neg;S.undoIdx--;refreshPanel('positive');refreshPanel('negative');updatePreview();if(!S.isSearching)renderGrid();toast('已撤销');}}
if(e.ctrlKey&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){e.preventDefault();if(S.undoIdx+1<S.undoStack.length){S.undoIdx++;var snap=S.undoStack[S.undoIdx];S.posTags=snap.pos;S.negTags=snap.neg;refreshPanel('positive');refreshPanel('negative');updatePreview();if(!S.isSearching)renderGrid();toast('已重做');}}
});}
function getCuiPrompt(){return el('prompt-output').value;}
function updateQueueUI(){var q=S.comfyuiQueue;var elq=el('comfyui-queue');var elt=el('comfyui-queue-text');var els=el('btn-comfyui-stop');var elc=el('btn-comfyui-clear-queue');if(q.length===0&&!S.comfyuiRunning){elq.style.display='none';}else{elq.style.display='block';var done=q.filter(function(x){return x.done;}).length;var total=q.length;elt.textContent='队列: '+done+'/'+total+(S.comfyuiRunning?' ⏳生成中':' ✅完成');els.style.display=S.comfyuiRunning?'inline':'none';elc.style.display=q.length>0?'inline':'none';}}
function _execNextQueue(){if(S.comfyuiStopped){S.comfyuiQueue=S.comfyuiQueue.filter(function(x){return x.done;});S.comfyuiRunning=false;S.comfyuiStopped=false;updateQueueUI();el('comfyui-progress').style.display='none';el('comfyui-result').innerHTML='⏹ 已终止';el('comfyui-result').style.color='var(--warning)';toast('队列已终止');return;}S.comfyuiQueue=S.comfyuiQueue.filter(function(x){return !x.done;});if(S.comfyuiQueue.length===0){S.comfyuiRunning=false;updateQueueUI();el('comfyui-progress').style.display='none';el('comfyui-result').innerHTML='✅ 全部完成';el('comfyui-result').style.color='var(--success)';toast('队列任务全部完成');return;}S.comfyuiRunning=true;updateQueueUI();var qi=S.comfyuiQueue[0];el('comfyui-progress').style.display='block';el('comfyui-bar').style.width='0%';el('comfyui-result').innerHTML='';var _cuiStart=Date.now();api('/api/comfyui/generate',{method:'POST',body:qi.body}).then(function(r){if(r.ok){el('comfyui-result').innerHTML='✅ 已提交 #'+(qi.idx+1)+'，等待出图...';el('comfyui-result').style.color='var(--success)';_pollComfyUI(r.prompt_id,_cuiStart,qi);}else{qi.done=true;qi.error=r.error;el('comfyui-result').innerHTML='❌ #'+(qi.idx+1)+' '+(r.error||'发送失败');el('comfyui-result').style.color='var(--danger)';setTimeout(function(){_execNextQueue();},1000);}});}
function _pollComfyUI(promptId,_cuiStart,qi){var maxTries=120;var tries=0;var poll=function(){try{tries++;var elapsed=Math.floor((Date.now()-_cuiStart)/1000);el('comfyui-time').textContent='⏳ '+elapsed+'s';var pct=Math.min(95,Math.floor(elapsed/60*100)||tries*2);el('comfyui-bar').style.width=pct+'%';api('/api/comfyui/result/'+promptId).then(function(r){if(r.status==='completed'){qi.done=true;el('comfyui-bar').style.width='100%';el('comfyui-time').textContent='✅ '+elapsed+'s';el('comfyui-progress-text').textContent='#'+qi.idx+'完成';el('comfyui-gallery').style.display='block';var imgArea=el('comfyui-gallery-imgs');for(var i=r.images.length-1;i>=0;i--){var img=r.images[i];var wrap=document.createElement('div');wrap.className='gallery-img-wrap';var elm=document.createElement('img');elm.src=img.url;elm.loading='lazy';elm.onerror=function(){wrap.style.display='none';};_galleryImages.unshift({url:img.url,filename:img.filename||'#'+qi.idx,prompt:qi.body.prompt||''});_saveGallery();elm.addEventListener('click',function(){_openImgPreview(img.url,img.filename||'#'+qi.idx);});var info=document.createElement('div');info.className='gallery-img-info';var lbl=document.createElement('span');lbl.className='gallery-img-label';lbl.textContent='#'+qi.idx;info.appendChild(lbl);wrap.appendChild(elm);wrap.appendChild(info);imgArea.insertBefore(wrap,imgArea.firstChild);}var total=imgArea.querySelectorAll('.gallery-img-wrap').length;el('gallery-count').textContent=total+' 张';toast('# '+qi.idx+' 生成完成');setTimeout(function(){_execNextQueue();},500);}else if(r.status==='pending'){if(tries<maxTries){el('comfyui-progress-text').textContent='生成中 #'+qi.idx;setTimeout(poll,1000);}else{qi.done=true;qi.error='超时';el('comfyui-time').textContent='❌ 超时';setTimeout(function(){_execNextQueue();},500);}}else{qi.done=true;qi.error=r.error||'查询失败';el('comfyui-result').innerHTML='❌ #'+(qi.idx+1)+' '+(r.error||'查询失败');el('comfyui-result').style.color='var(--danger)';setTimeout(function(){_execNextQueue();},500);}})}catch(e){console.error('poll error:',e);};};setTimeout(poll,1000);}
function _queueCuiPrompt(prompt,wf,w,h,count){if(!el('llm-concurrent').checked&&S.llmRunning){toast('AI润色进行中，请等待');return;}var over=getModelOverrides();var rs=el('comfyui-rand-seed').checked;var wfs=S.wfSettings[wf]||{};var clipmap=_getClipMapping();var negTpl=S.negTemplateAuto?S.negTemplate:'';for(var n=0;n<count;n++){S.comfyuiQueue.push({idx:S.comfyuiQueue.length,body:{prompt:prompt,workflow:wf,width:w,height:h,overrides:over,rand_seed:rs,wf_settings:wfs,clip_mapping:clipmap,neg_template:negTpl,load_image:S.loadImage||null},done:false});}if(!S.comfyuiRunning)_execNextQueue();updateQueueUI();_saveGenHistory(prompt);}
function _queueWithRefine(prompt,wf,w,h,count){if(el('llm-auto-refine').checked){var raw=_buildRawPrompt(),negPart='',llmInput=raw;if(raw.indexOf('--neg ')>=0)negPart='\n--neg '+raw.split('--neg ')[1];if(S.posTags.length){var isZh=el('llm-lang').value=='zh',cats={},order=[],pk=S.posTags;for(var i=0;i<pk.length;i++){var t=pk[i],c=t.category||'未分类';if(!cats[c]){cats[c]=[];order.push(c);}cats[c].push(isZh?(t.zh||t.en):t.en);}var parts=[];for(var i=0;i<order.length;i++)parts.push('['+order[i]+'] '+cats[order[i]].join(', '));llmInput=parts.join('\n');if(S.negTags.length)llmInput+='\n[负面标签] '+genPrompt(S.negTags);}el('comfyui-result').innerHTML='⏳ AI润色中...';el('comfyui-result').style.color='var(--text-muted)';console.log('📤 生图润色发送:\n'+llmInput);S.llmRunning=true;api('/api/llm/translate',{method:'POST',body:{prompt:llmInput,sysprompt:el('llm-sysprompt').value.trim()||'你是一个AI绘画提示词转换器',url:el('llm-url').value,model:el('llm-model').value,key:el('llm-key').value}}).then(function(r){S.llmRunning=false;var text=r.ok?r.text:null;if(text){prompt=text;if(S.template)prompt=S.template.replace(/{tags}/g,prompt);if(negPart)prompt+=negPart;S.llmHistory.unshift(prompt);if(S.llmHistory.length>100)S.llmHistory.pop();saveLlmHistory();}_queueCuiPrompt(prompt,wf,w,h,count);toast('已添加(已润色) '+count+' 个任务');});}else{_queueCuiPrompt(prompt,wf,w,h,count);toast('已添加 '+count+' 个任务到队列');}}

function _genRandomTags(lockedPos){try{if(!S.allData)return[];lockedPos=lockedPos||S.posTags.filter(function(t){return t.locked;});var pk=lockedPos.slice(),used={};for(var i=0;i<pk.length;i++)used[pk[i].en]=true;var _occSP={},_occPG={},_occSC={};for(var i=0;i<lockedPos.length;i++){var lt=lockedPos[i];if(lt.category){_occSC[lt.category+'|'+lt.subcategory]=!0;for(var ci=0;ci<S.allData.categories.length;ci++){var c2=S.allData.categories[ci];if(c2.name===lt.category){if(c2.randomMode==='singlePool')_occSP[c2.name]=!0;for(var si=0;si<c2.subcategories.length;si++){var s2=c2.subcategories[si];if(s2.name===lt.subcategory){if(s2.poolGroup)_occPG[s2.poolGroup]=!0;break;}}break;}}}}var globalMax=parseInt(el('rand-count').value)||10;for(var ci=0;ci<S.allData.categories.length;ci++){var c=S.allData.categories[ci];if(!S.allowNsfw&&(c.name==='NSFW'||c.name==='NSFW标签'))continue;if(S.hidden.categories[c.name])continue;if(c.randomMode==='singlePool'&&!_occSP[c.name]){var allTags=[];for(var si=0;si<c.subcategories.length;si++){var sc=c.subcategories[si];if(S.hidden.subcategories[c.name+'|'+sc.name])continue;var _sl=(S.scLimits[c.name+'|'+sc.name]!==undefined&&S.scLimits[c.name+'|'+sc.name]!==null)?S.scLimits[c.name+'|'+sc.name]:1;if(_sl===0)continue;for(var ti=0;ti<sc.tags.length;ti++){var t=sc.tags[ti];allTags.push({en:t.en,zh:t.zh,category:c.name,subcategory:sc.name});}}var shuffled=allTags.slice();for(var i=shuffled.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=shuffled[i];shuffled[i]=shuffled[j];shuffled[j]=tmp;}for(var i=0;i<shuffled.length;i++){var t=shuffled[i];if(!used[t.en]){used[t.en]=true;pk.push({en:t.en,zh:t.zh,weight:(S.randWeight?Math.round((Math.random()*0.5+1.0)*10)/10:1.0),category:t.category,subcategory:t.subcategory});break;}}}else if(S.catModes[c.name]==='cat'){var limit=(S.catLimits[c.name]!==undefined&&S.catLimits[c.name]!==null)?S.catLimits[c.name]:3;if(limit===0)continue;var allTags=[];for(var si=0;si<c.subcategories.length;si++){var sc=c.subcategories[si];var scKey=c.name+'|'+sc.name;if(S.hidden.subcategories[scKey])continue;for(var ti=0;ti<sc.tags.length;ti++){var t=sc.tags[ti];allTags.push({en:t.en,zh:t.zh,category:c.name,subcategory:sc.name,scType:sc.type});}}var shuffled=allTags.slice();for(var i=shuffled.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=shuffled[i];shuffled[i]=shuffled[j];shuffled[j]=tmp;}var picked=0;var pickedSingleSC={};for(var i=0;i<shuffled.length&&picked<limit;i++){var t=shuffled[i];if(!used[t.en]){if(t.scType==='single'&&pickedSingleSC[t.subcategory])continue;used[t.en]=true;pickedSingleSC[t.subcategory]=true;pk.push({en:t.en,zh:t.zh,weight:(S.randWeight?Math.round((Math.random()*0.5+1.0)*10)/10:1.0),category:t.category,subcategory:t.subcategory});picked++;}}}else{var _grp={'_':[]};for(var si=0;si<c.subcategories.length;si++){var sc=c.subcategories[si];var scKey=c.name+'|'+sc.name;if(S.hidden.subcategories[scKey])continue;var _gk=sc.poolGroup||'_';if(!_grp[_gk])_grp[_gk]=[];_grp[_gk].push(sc);}for(var _gk in _grp){if(_occPG[_gk])continue;var _gscs=_grp[_gk];if(_gk==='_'){for(var si=0;si<_gscs.length;si++){var sc=_gscs[si];var scKey=c.name+'|'+sc.name;if(_occSC[scKey]&&sc.type==='single')continue;var limit=(S.scLimits[scKey]!==undefined&&S.scLimits[scKey]!==null)?S.scLimits[scKey]:1;if(sc.type==='single')limit=Math.min(limit,1);if(limit===0)continue;var shuffled=sc.tags.slice();for(var i=shuffled.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=shuffled[i];shuffled[i]=shuffled[j];shuffled[j]=tmp;}var picked=0;for(var ti=0;ti<shuffled.length&&picked<limit;ti++){var t=shuffled[ti];if(!used[t.en]){used[t.en]=true;pk.push({en:t.en,zh:t.zh,weight:(S.randWeight?Math.round((Math.random()*0.5+1.0)*10)/10:1.0),category:c.name,subcategory:sc.name});picked++;}}}}else{var allTags=[];for(var si=0;si<_gscs.length;si++){var sc=_gscs[si];var scKey=c.name+'|'+sc.name;var _lim=(S.scLimits[scKey]!==undefined&&S.scLimits[scKey]!==null)?S.scLimits[scKey]:1;if(_lim===0)continue;for(var ti=0;ti<sc.tags.length;ti++){var t=sc.tags[ti];allTags.push({en:t.en,zh:t.zh,category:c.name,subcategory:sc.name});}}if(allTags.length===0)continue;var shuffled=allTags.slice();for(var i=shuffled.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=shuffled[i];shuffled[i]=shuffled[j];shuffled[j]=tmp;}for(var i=0;i<shuffled.length;i++){var t=shuffled[i];if(!used[t.en]){used[t.en]=true;pk.push({en:t.en,zh:t.zh,weight:(S.randWeight?Math.round((Math.random()*0.5+1.0)*10)/10:1.0),category:t.category,subcategory:t.subcategory});break;}}}}}}pk=pk.slice(0,Math.max(1,globalMax));var _noh=!1;for(var i=0;i<pk.length;i++){var _x=pk[i].en.toLowerCase();if(_x.indexOf('no human')>=0){_noh=!0;break;}}if(_noh){pk=pk.filter(function(t){var _sk=['发型与发色','五官与表情','服装与配饰','动作姿态','NSFW'];if(_sk.indexOf(t.category)>=0)return !1;if(t.category==='人物主体'&&t.subcategory!=='人数与性别')return !1;return !0;});}return pk;}catch(e){console.error('_genRandomTags error:',e);toast('随机生成出错: '+e.message);return[];}}
function _tagsToPrompt(pk){var raw=genPrompt(pk);if(S.useQuality&&pk.length>0)raw=QW.join(', ')+', '+raw;if(S.template)raw=S.template.replace(/{tags}/g,raw);return raw;}
function copyText(t){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).catch(function(){_fallbackCopy(t);});}else{_fallbackCopy(t);}}
function _fallbackCopy(t){var ta=document.createElement('textarea');ta.style.position='fixed';ta.style.left='-9999px';ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}ta.remove();}
function checkComfyUI(){api('/api/comfyui/status').then(function(r){var dot=el('comfyui-status'),txt=el('comfyui-status-text');if(r.online){dot.style.background='var(--success)';txt.textContent='ComfyUI '+r.url;}else{dot.style.background='var(--danger)';txt.textContent='ComfyUI 未运行';}});}
function loadWorkflows(){api('/api/comfyui/workflows').then(function(list){var sel=el('comfyui-workflow');sel.innerHTML='<option value="">-- 选择工作流 --</option>';for(var i=0;i<list.length;i++){var o=document.createElement('option');o.value=list[i].filename;o.textContent=(list[i].source==='comfyui'?'🌐 ':'⚡ ')+list[i].name;sel.appendChild(o);}var sv=null;try{sv=JSON.parse(localStorage.getItem('grimoire2_ui')||'null');}catch(e){}if(sv&&sv.cuiWf)sel.value=sv.cuiWf;});}
function fetchSize(){var f=el('comfyui-workflow').value;if(!f)return;api('/api/comfyui/workflow-size?file='+encodeURIComponent(f)).then(function(r){if(r.width){el('comfyui-width').value=r.width;el('comfyui-height').value=r.height;saveUiSettings();}});}
var S_cuiSel={};
var _ICK={checkpoint:'🧠 Checkpoint',unet:'💾 UNET',clip:'🎯 CLIP',vae:'🖼 VAE',dual_clip:'🎯🎯 DualCLIP',lora:'🎭 LoRA'};
var _cachedModels=null;
function _renderModelNodes(info,m){_cachedModels=m;_cachedInfo=info;var div=el('modal-models-body');var html='';for(var i=0;i<info.nodes.length;i++){var nd=info.nodes[i];var list=m[nd.kind]||[];html+='<div style=display:flex;align-items:center;gap:4px;margin-bottom:6px><span style=font-size:11px;white-space:nowrap;min-width:90px>'+(_ICK[nd.kind]||'📦 Model')+'</span><select class=cui-model-sel data-type='+nd.type+' data-key='+nd.key+' style=flex:1;padding:4px 6px;border:1px solid var(--border);border-radius:3px;background:var(--bg-tertiary);color:var(--text-primary);font-size:11px;outline:none>';html+='<option value=\"\">-- '+nd.kind+' --</option>';for(var j=0;j<list.length;j++){var sel=list[j]===nd.default?' selected':'';html+='<option value=\"'+esc(list[j])+'\"'+sel+'>'+esc(list[j])+'</option>';}html+='</select>';if(nd.kind==='lora'){html+='<input class=cui-lora-w data-type='+nd.type+' data-key=strength_model type=number min=0 max=2 step=0.1 value='+(nd.strength||1.0)+' style=width:40px;padding:3px 4px;border:1px solid var(--border);border-radius:3px;background:var(--bg-tertiary);color:var(--text-primary);font-size:11px;text-align:center;outline:none title=模型权重>';html+='<input class=cui-lora-w data-type='+nd.type+' data-key=strength_clip type=number min=0 max=2 step=0.1 value='+(nd.clip_strength||1.0)+' style=width:40px;padding:3px 4px;border:1px solid var(--border);border-radius:3px;background:var(--bg-tertiary);color:var(--text-primary);font-size:11px;text-align:center;outline:none title=CLIP权重>';}html+='</div>';}div.innerHTML=html||'<div style=font-size:11px;color:var(--text-muted)>当前工作流中未检测到模型节点</div>';try{var sv=localStorage.getItem('grimoire2_modelsel');if(sv){var ss=JSON.parse(sv);qsa('.cui-model-sel').forEach(function(s){var t=s.dataset.type;if(ss[t])s.value=ss[t];});qsa('.cui-lora-w').forEach(function(inp){var t=inp.dataset.type;var k=inp.dataset.key;if(ss['_w_'+t+'_'+k])inp.value=ss['_w_'+t+'_'+k];});}}catch(e){}qsa('.cui-model-sel').forEach(function(s){s.addEventListener('change',function(){var ss={};try{ss=JSON.parse(localStorage.getItem('grimoire2_modelsel')||'{}');}catch(e){}ss[this.dataset.type]=this.value;localStorage.setItem('grimoire2_modelsel',JSON.stringify(ss));});});qsa('.cui-lora-w').forEach(function(inp){inp.addEventListener('change',function(){var ss={};try{ss=JSON.parse(localStorage.getItem('grimoire2_modelsel')||'{}');}catch(e){}ss['_w_'+this.dataset.type+'_'+this.dataset.key]=this.value;localStorage.setItem('grimoire2_modelsel',JSON.stringify(ss));});});}
function fetchModels(){var f=el('comfyui-workflow').value;if(!f)return;api('/api/comfyui/workflow-info?file='+encodeURIComponent(f)).then(function(info){api('/api/comfyui/models').then(function(m){_renderModelNodes(info,m);}).catch(function(){_renderModelNodes(info,{});});}).catch(function(e){el('modal-models-body').innerHTML='<span style=font-size:11px;color:var(--danger)>工作流解析失败: '+(e.error||'未知')+'</span>';});}
el('btn-comfyui-models').addEventListener('click',function(){fetchModels();el('modal-models').style.display='';});
el('btn-models-close').addEventListener('click',function(){el('modal-models').style.display='none';});
el('btn-gallery-clear').addEventListener('click',function(){el('comfyui-gallery-imgs').innerHTML='';el('comfyui-gallery').style.display='none';el('gallery-count').textContent='';_galleryImages=[];localStorage.setItem('grimoire2_gallery','[]');api('/api/user/sync',{method:'POST',body:{gallery:[]}});});
// ===== 工作流参数设置 =====
S.wfSettings={};try{var _wfs_=localStorage.getItem('grimoire2_wfsettings');if(_wfs_)S.wfSettings=JSON.parse(_wfs_);}catch(e){S.wfSettings={};}
function _saveWfSettings(){localStorage.setItem('grimoire2_wfsettings',JSON.stringify(S.wfSettings));_syncSave({wfsettings:1});}
el('btn-comfyui-settings').addEventListener('click',function(){
  var f=el('comfyui-workflow').value;if(!f){toast('请先选择工作流');return;}
  el('wf-settings-wf-name').textContent='当前工作流: '+el('comfyui-workflow').selectedOptions[0].textContent;
  el('wf-settings-body').innerHTML='<div style=text-align:center;padding:20px;color:var(--text-muted)>⏳ 读取中...</div>';
  el('modal-wf-settings').style.display='';
  api('/api/comfyui/workflow-params?file='+encodeURIComponent(f)).then(function(p){
    if(p.error){el('wf-settings-body').innerHTML='<div style=color:var(--danger);font-size:12px;text-align:center;padding:20px>'+esc(p.error)+'</div>';return;}
    var s=S.wfSettings[f]||{};
    var sampler=p.sampler||{},res=p.resolution||{};
    var html='';
    if(p.checkpoint)html+='<div style=margin-bottom:12px><div style=font-size:10px;color:var(--text-muted);margin-bottom:3px>🧠 模型</div><input id=wfs-ckpt style=width:100%;padding:5px 8px;border:1px solid var(--border);border-radius:4px;font-size:11px;background:var(--bg-primary);color:var(--text-primary);outline:none value='+esc(s.ckpt_name||p.checkpoint||'')+'></div>';
    if(res.width!==undefined||res.height!==undefined){
      html+='<div style=margin-bottom:12px><div style=font-size:10px;color:var(--text-muted);margin-bottom:3px>📐 尺寸</div><div style=display:flex;gap:6px>';
      html+='<input id=wfs-w type=number min=64 max=8192 step=64 style=flex:1;padding:5px 8px;border:1px solid var(--border);border-radius:4px;font-size:11px;background:var(--bg-primary);color:var(--text-primary);outline:none value='+(s.width||res.width||512)+'>';
      html+='<span style=line-height:32px>×</span>';
      html+='<input id=wfs-h type=number min=64 max=8192 step=64 style=flex:1;padding:5px 8px;border:1px solid var(--border);border-radius:4px;font-size:11px;background:var(--bg-primary);color:var(--text-primary);outline:none value='+(s.height||res.height||512)+'>';
      html+='</div></div>';
    }
    html+='<div style=margin-bottom:12px><div style=font-size:10px;color:var(--text-muted);margin-bottom:3px>⚡ 采样</div>';
    html+='<div style=display:grid;grid-template-columns:1fr 1fr;gap:6px>';
    html+='<div><span style=font-size:10px;color:var(--text-muted)>Steps</span><input id=wfs-steps type=number min=1 max=200 style=width:100%;padding:5px 8px;border:1px solid var(--border);border-radius:4px;font-size:11px;background:var(--bg-primary);color:var(--text-primary);outline:none value='+(s.steps||sampler.steps||20)+'></div>';
    html+='<div><span style=font-size:10px;color:var(--text-muted)>CFG</span><input id=wfs-cfg type=number min=0 max=30 step=0.5 style=width:100%;padding:5px 8px;border:1px solid var(--border);border-radius:4px;font-size:11px;background:var(--bg-primary);color:var(--text-primary);outline:none value='+(s.cfg||sampler.cfg||7)+'></div>';
    html+='<div><span style=font-size:10px;color:var(--text-muted)>Sampler</span><select id=wfs-sampler style=width:100%;padding:5px 8px;border:1px solid var(--border);border-radius:4px;font-size:11px;background:var(--bg-primary);color:var(--text-primary);outline:none><option value=euler>euler</option><option value=euler_ancestral>euler_ancestral</option><option value=dpmpp_2m>dpmpp_2m</option><option value=dpmpp_sde>dpmpp_sde</option><option value=uni_pc>uni_pc</option><option value=ddim>ddim</option><option value=lcm>lcm</option></select></div>';
    html+='<div><span style=font-size:10px;color:var(--text-muted)>Scheduler</span><select id=wfs-scheduler style=width:100%;padding:5px 8px;border:1px solid var(--border);border-radius:4px;font-size:11px;background:var(--bg-primary);color:var(--text-primary);outline:none><option value=normal>normal</option><option value=karras>karras</option><option value=exponential>exponential</option><option value=sgm_uniform>sgm_uniform</option><option value=simple>simple</option><option value=ddim_uniform>ddim_uniform</option></select></div>';
    html+='</div></div>';
    html+='<div style=margin-bottom:12px><span style=font-size:10px;color:var(--text-muted)>Denoise</span><input id=wfs-denoise type=number min=0 max=1 step=0.01 style=width:100%;padding:5px 8px;border:1px solid var(--border);border-radius:4px;font-size:11px;background:var(--bg-primary);color:var(--text-primary);outline:none value='+(s.denoise!==undefined?s.denoise:(sampler.denoise!==undefined?sampler.denoise:1.0))+'></div>';
    el('wf-settings-body').innerHTML=html;
    if(s.sampler_name)el('wfs-sampler').value=s.sampler_name;else if(sampler.sampler_name)el('wfs-sampler').value=sampler.sampler_name;
    if(s.scheduler)el('wfs-scheduler').value=s.scheduler;else if(sampler.scheduler)el('wfs-scheduler').value=sampler.scheduler;
  });
});
el('btn-wf-settings-apply').addEventListener('click',function(){
  var f=el('comfyui-workflow').value;if(!f)return;
  var s={};
  var ckpt=el('wfs-ckpt');if(ckpt)s.ckpt_name=ckpt.value;
  var wi=el('wfs-w');if(wi)s.width=parseInt(wi.value)||null;
  var hi=el('wfs-h');if(hi)s.height=parseInt(hi.value)||null;
  var steps=el('wfs-steps');if(steps)s.steps=parseInt(steps.value)||20;
  var cfg=el('wfs-cfg');if(cfg)s.cfg=parseFloat(cfg.value)||7;
  var sampler=el('wfs-sampler');if(sampler)s.sampler_name=sampler.value;
  var scheduler=el('wfs-scheduler');if(scheduler)s.scheduler=scheduler.value;
  var denoise=el('wfs-denoise');if(denoise)s.denoise=parseFloat(denoise.value);
  S.wfSettings[f]=s;_saveWfSettings();
  el('modal-wf-settings').style.display='none';
  toast('⚙ 参数已保存，下次生图生效');
});
el('btn-wf-settings-refresh').addEventListener('click',function(){el('btn-comfyui-settings').click();});
// ===== CLIP正负节点绑定（弹窗模式） =====
S.clipMaps={};try{var _cm_=localStorage.getItem('grimoire2_clipmaps');if(_cm_)S.clipMaps=JSON.parse(_cm_);}catch(e){S.clipMaps={};}
function _saveClipMaps(){localStorage.setItem('grimoire2_clipmaps',JSON.stringify(S.clipMaps));_syncSave({clipmaps:1});}
function _loadClipNodes(fname){
  el('clip-pos').innerHTML='<option value="">自动</option>';el('clip-neg').innerHTML='<option value="">自动</option>';
  if(!fname)return;
  api('/api/comfyui/clip-nodes?file='+encodeURIComponent(fname)).then(function(r){
    var nodes=r.nodes||[];if(nodes.length<2)return;
    var posSel=el('clip-pos'),negSel=el('clip-neg');
    for(var i=0;i<nodes.length;i++){var n=nodes[i];var lbl='节点'+n.id+(n.title?' ('+n.title+')':'')+(n.text_preview?' ['+n.text_preview+']':'');posSel.innerHTML+='<option value='+n.id+'>'+esc(lbl)+'</option>';negSel.innerHTML+='<option value='+n.id+'>'+esc(lbl)+'</option>';}
    var map=S.clipMaps[fname];
    if(map){if(map.pos)posSel.value=map.pos;if(map.neg)negSel.value=map.neg;}
  });
}
el('btn-comfyui-clipbind').addEventListener('click',function(){
  var f=el('comfyui-workflow').value;if(!f){toast('请先选择工作流');return;}
  el('clipbind-wf-name').textContent='当前工作流: '+el('comfyui-workflow').selectedOptions[0].textContent;
  el('modal-clipbind').style.display='';_loadClipNodes(f);
});
el('btn-clipbind-save').addEventListener('click',function(e){
  try{e.preventDefault();var f=el('comfyui-workflow').value;if(!f)return;
  var pos=el('clip-pos').value,neg=el('clip-neg').value;
  S.clipMaps[f]={pos:pos,neg:neg};_saveClipMaps();
  el('modal-clipbind').style.display='none';toast('💾 正负节点绑定已保存');
  }catch(err){console.error('clipbind-save error:',err);toast('保存失败');}
});
function _getClipMapping(){var f=el('comfyui-workflow').value;return S.clipMaps[f]||{};}

// ===== ComfyUI端口设置 =====
el('btn-comfyui-conn').addEventListener('click',function(){
  el('modal-conn').style.display='';
  el('conn-url').value=S.cuiUrl||'http://127.0.0.1:8188';
  el('conn-result').innerHTML='';
});
el('btn-conn-test').addEventListener('click',function(){
  var u=el('conn-url').value.trim();if(!u)return;
  el('conn-result').innerHTML='⏳ 测试中...';el('conn-result').style.color='var(--text-muted)';
  api('/api/comfyui/test-conn',{method:'POST',body:{url:u}}).then(function(r){
    if(r.ok){el('conn-result').innerHTML='✅ 连接成功';el('conn-result').style.color='var(--success)';}
    else{el('conn-result').innerHTML='❌ '+(r.error||'连接失败');el('conn-result').style.color='var(--danger)';}
  });
});
el('btn-conn-save').addEventListener('click',function(){
  var u=el('conn-url').value.trim();if(!u)return;
  S.cuiUrl=u;localStorage.setItem('grimoire2_cuiUrl',u);
  api('/api/comfyui/set-url',{method:'POST',body:{url:u}}).then(function(r){
    el('modal-conn').style.display='none';checkComfyUI();toast('🌐 端口已更新');
  });
});
(function(){
  try{var _cu=localStorage.getItem('grimoire2_cuiUrl');if(_cu){S.cuiUrl=_cu;api('/api/comfyui/set-url',{method:'POST',body:{url:_cu}});}
  else{api('/api/comfyui/status').then(function(r){if(r.online)S.cuiUrl=r.url;});}
}catch(e){}}());
var _llmHistoryPage=0,_llmHistoryPageSize=20;
function _renderLlmHistory(page){
  if(page===undefined)page=_llmHistoryPage;else _llmHistoryPage=page;
  var total=S.llmHistory.length;
  var totalPages=Math.max(1,Math.ceil(total/_llmHistoryPageSize));
  if(_llmHistoryPage>=totalPages)_llmHistoryPage=totalPages-1;
  if(_llmHistoryPage<0)_llmHistoryPage=0;
  page=_llmHistoryPage;
  var start=page*_llmHistoryPageSize;
  var end=Math.min(start+_llmHistoryPageSize,total);
  el('llm-history-count').textContent='共 '+total+' 条';
  function _renderPager(pid){
    var pager=el(pid);
    var h='';
    h+='<button class=llm-page-btn data-page=0'+(page===0?' disabled':'')+' title=首页>«</button>';
    h+='<button class=llm-page-btn data-page='+(page-1)+(page===0?' disabled':'')+' title=上一页>‹</button>';
    h+='<span style=color:var(--text-secondary);min-width:80px;text-align:center>'+(page+1)+' / '+totalPages+'</span>';
    h+='<button class=llm-page-btn data-page='+(page+1)+(page>=totalPages-1?' disabled':'')+' title=下一页>›</button>';
    h+='<button class=llm-page-btn data-page='+(totalPages-1)+(page>=totalPages-1?' disabled':'')+' title=末页>»</button>';
    h+='<select class=llm-page-size style=margin-left:12px;padding:2px 4px;border:1px solid var(--border);border-radius:3px;background:var(--bg-tertiary);color:var(--text-primary);font-size:11px;outline:none>';
    [10,20,50,100].forEach(function(s){h+='<option value='+s+(s===_llmHistoryPageSize?' selected':'')+'>每页'+s+'条</option>';});
    h+='</select>';
    pager.innerHTML=h;
    qsa('.llm-page-btn',pager).forEach(function(b){
      b.addEventListener('click',function(){if(this.disabled)return;_renderLlmHistory(parseInt(this.dataset.page));});
    });
    qs('.llm-page-size',pager).addEventListener('change',function(){
      _llmHistoryPageSize=parseInt(this.value);_llmHistoryPage=0;_renderLlmHistory(0);
    });
  }
  _renderPager('llm-history-pager-top');
  _renderPager('llm-history-pager-bottom');
  var list=el('llm-history-list');
  if(total===0){
    list.innerHTML='<div style=padding:20px;text-align:center;font-size:11px;color:var(--text-muted)>暂无润色记录</div>';
    return;
  }
  var html='';
  for(var i=start;i<end;i++){
    var t=S.llmHistory[i];
    var disp=t.length>120?t.substring(0,120)+'...':t;
    html+='<div class=llm-hist-item style=display:flex;align-items:flex-start;gap:6px;padding:6px 8px;border-bottom:1px solid var(--border);font-size:11px;color:var(--text-secondary);word-break:break-all;line-height:1.4>';
    html+='<span class=llm-hist-text style=flex:1;cursor:pointer title=点击复制全部>'+esc(disp)+'</span>';
    html+='<button class=llm-hist-copy data-idx='+i+' style=flex-shrink:0;padding:2px 6px;border:1px solid var(--border);border-radius:3px;background:var(--bg-tertiary);color:var(--text-muted);cursor:pointer;font-size:10px;white-space:nowrap title=复制本条>📋</button>';
    html+='<button class=llm-hist-send data-idx='+i+' style=flex-shrink:0;padding:2px 8px;border:1px solid var(--accent);border-radius:3px;background:var(--bg-tertiary);color:var(--accent);cursor:pointer;font-size:10px;white-space:nowrap title=发送到ComfyUI生图>🚀</button>';
    html+='</div>';
  }
  list.innerHTML=html;
  qsa('.llm-hist-text',list).forEach(function(sp){sp.addEventListener('click',function(){
    var idx=parseInt(this.parentElement.querySelector('.llm-hist-send').dataset.idx);
    copyText(S.llmHistory[idx]);toast('已复制');
  });});
  qsa('.llm-hist-copy',list).forEach(function(b){b.addEventListener('click',function(e){
    e.stopPropagation();copyText(S.llmHistory[parseInt(this.dataset.idx)]);toast('已复制');
  });});
  qsa('.llm-hist-send',list).forEach(function(it){it.addEventListener('click',function(e){
    e.stopPropagation();try{var idx=parseInt(this.dataset.idx);var prompt=S.llmHistory[idx];if(!prompt){toast('记录无效');return;}var wf=el('comfyui-workflow').value;if(!wf){toast('请先选择工作流');return;}var w=parseInt(el('comfyui-width').value)||null;var h=parseInt(el('comfyui-height').value)||null;var over=getModelOverrides();var rs=el('comfyui-rand-seed').checked;S.comfyuiStopped=false;S.comfyuiQueue.push({idx:S.comfyuiQueue.length,body:{prompt:prompt,workflow:wf,width:w,height:h,overrides:over,rand_seed:rs,neg_template:(S.negTemplateAuto?S.negTemplate:''),load_image:S.loadImage||null},done:false});_saveGenHistory(prompt);var _u=function(){var q=S.comfyuiQueue;var elq=el('comfyui-queue');var elt=el('comfyui-queue-text');var els=el('btn-comfyui-stop');var elc=el('btn-comfyui-clear-queue');if(q.length===0&&!S.comfyuiRunning){elq.style.display='none';}else{elq.style.display='block';var done=q.filter(function(x){return x.done;}).length;var total=q.length;elt.textContent='队列: '+done+'/'+total+(S.comfyuiRunning?'生成中':'完成');els.style.display=S.comfyuiRunning?'inline':'none';elc.style.display=q.length>0?'inline':'none';}};if(!S.comfyuiRunning){S.comfyuiRunning=true;_u();var qi=S.comfyuiQueue[S.comfyuiQueue.length-1];el('comfyui-progress').style.display='block';el('comfyui-bar').style.width='0%';el('comfyui-result').innerHTML='';var _cuiStart=Date.now();api('/api/comfyui/generate',{method:'POST',body:qi.body}).then(function(r){if(r.ok){el('comfyui-result').innerHTML='已提交，等待出图...';el('comfyui-result').style.color='var(--success)';_pollComfyUI(r.prompt_id,_cuiStart,qi);}else{qi.done=true;qi.error=r.error;el('comfyui-result').innerHTML='发送失败';el('comfyui-result').style.color='var(--danger)';setTimeout(function(){_execNextQueue();},1000);}});}else{_u();}el('modal-llm-history').style.display='none';toast('已发送润色记录到队列');}catch(err){toast('发送失败: '+err.message);}});});
}
el('btn-llm-history').addEventListener('click',function(){_renderLlmHistory(0);el('modal-llm-history').style.display='';});
el('btn-llm-history-close').addEventListener('click',function(){el('modal-llm-history').style.display='none';});
el('btn-llm-history-clear').addEventListener('click',function(){S.llmHistory=[];saveLlmHistory();_renderLlmHistory();toast('已清空');});
// ===== 润色预设 =====
function _getLlmPresets(){try{return JSON.parse(localStorage.getItem('grimoire2_llm_presets')||'[]');}catch(e){return[];}}
function _saveLlmPresets(list){localStorage.setItem('grimoire2_llm_presets',JSON.stringify(list));api('/api/llm/presets/save',{method:'POST',body:list});}
// 首次加载注入默认预设，并从服务端同步
(function(){
  var seedVer=localStorage.getItem('grimoire2_llm_presets_seeded');
  if(seedVer!=='1'){
  _saveLlmPresets([
    {name:'通用润色',sys:'你是一个AI绘画提示词转换器。将用户输入的标签式提示词转换成一段通顺的自然语言描述，保留所有关键元素。'},
    {name:'诗意描写',sys:'你是一个富有诗意的绘画描述者。将标签提示词转化为优美、富有画面感的文学性描述，使用生动的比喻和细腻的形容词，营造独特的氛围感。'},
    {name:'简洁直白',sys:'你是一个精炼的提示词优化器。用最简洁的自然语言重写标签提示词，去除冗余，保留核心信息，控制在50词以内。'},
    {name:'场景叙事',sys:'你是一个场景构建师。将标签转化为一段沉浸式的场景描述，像电影镜头一样描述画面中的光线、构图、氛围、人物位置和互动关系。'},
    {name:'角色刻画',sys:'你是一个角色设计师。重点描述人物的外貌特征、表情神态、服装细节、姿态动作和气质风格，将标签转化为生动的角色肖像描述。'}
  ]);
  localStorage.setItem('grimoire2_llm_presets_seeded','1');
  }
})();
// 从服务端同步预设（手机/桌面共享）
(function(){
  api('/api/llm/presets').then(function(srv){
    if(!srv||!srv.length)return;
    var local=_getLlmPresets();
    var merged={};
    for(var i=0;i<srv.length;i++)merged[srv[i].name]=srv[i];
    for(var i=0;i<local.length;i++)merged[local[i].name]=local[i];
    var result=Object.values(merged);
    _saveLlmPresets(result);
  });
})();
el('btn-llm-save-preset').addEventListener('click',function(){
  var nm=prompt('预设名称:');
  if(!nm)return;
  var cfg={sys:el('llm-sysprompt').value};
  var list=_getLlmPresets();
  list=list.filter(function(x){return x.name!==nm;});
  cfg.name=nm;list.push(cfg);
  _saveLlmPresets(list);toast('已保存: '+nm);
});
function _renderLlmPresets(){
  var list=_getLlmPresets();
  var div=el('llm-presets-list');
  if(list.length===0){div.innerHTML='<div style=padding:20px;text-align:center;font-size:11px;color:var(--text-muted)>暂无保存的预设</div>';return;}
  var html='';
  for(var i=0;i<list.length;i++){
    var p=list[i];var si=p.sys?p.sys.substring(0,60)+(p.sys.length>60?'...':''):'(空系统指令)';
    html+='<div class=llm-preset-item style=display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--border);font-size:11px>';
    html+='<button class=llm-preset-load data-idx='+i+' style=flex-shrink:0;padding:2px 10px;border:1px solid var(--accent);border-radius:3px;background:none;color:var(--accent);cursor:pointer;font-size:10px;white-space:nowrap>加载</button>';
    html+='<div style=flex:1;min-width:0><div style=font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap>'+esc(p.name)+'</div><div style=font-size:10px;color:var(--text-muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap>'+esc(si)+'</div></div>';
    html+='<button class="llm-preset-del" data-idx="'+i+'" data-name="'+esc(p.name)+'" style="flex-shrink:0;border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:12px" title="连点3次删除">🗑</button>';
    html+='</div>';
  }
  div.innerHTML=html;
  qsa('.llm-preset-load',div).forEach(function(b){b.addEventListener('click',function(e){
    e.stopPropagation();
    var p=list[parseInt(this.dataset.idx)];
    el('llm-sysprompt').value=p.sys||'';
    localStorage.setItem('grimoire2_llm',JSON.stringify({prov:el('llm-provider').value,url:el('llm-url').value,model:el('llm-model').value,key:el('llm-key').value,sys:el('llm-sysprompt').value,auto:el('llm-auto-refine').checked,lang:el('llm-lang').value,allowCon:el('llm-concurrent').checked}));
    api('/api/llm/config/save',{method:'POST',body:{prov:el('llm-provider').value,url:el('llm-url').value,model:el('llm-model').value,key:el('llm-key').value,sys:el('llm-sysprompt').value,auto:el('llm-auto-refine').checked,lang:el('llm-lang').value,allowCon:el('llm-concurrent').checked}});
    el('modal-llm-presets').style.display='none';
    toast('已加载: '+p.name);
  });});
  qsa('.llm-preset-del',div).forEach(function(b){b.addEventListener('click',function(e){
    e.stopPropagation();
    var s=parseInt(this.dataset.strike||'0');s++;this.dataset.strike=s;
    if(s<3){
      var r=3-s;this.textContent=s;this.style.color='var(--danger)';this.style.fontSize='11px';
      if(this._t)clearTimeout(this._t);
      this._t=setTimeout(function(){b.dataset.strike='0';b.textContent='🗑';b.style.color='';b.style.fontSize='12px';},3000);
    }else{
      this.style.color='';
      var list=_getLlmPresets();
      list=list.filter(function(x,i){return i!==parseInt(b.dataset.idx);});
      _saveLlmPresets(list);_renderLlmPresets();toast('已删除');
    }
  });});
}
el('btn-llm-load-preset').addEventListener('click',function(){_renderLlmPresets();el('modal-llm-presets').style.display='';});
el('btn-llm-presets-close').addEventListener('click',function(){el('modal-llm-presets').style.display='none';});
function getModelOverrides(){var o={};qsa('.cui-model-sel').forEach(function(s){var v=s.value;if(!v)return;var t=s.dataset.type;if(!o[t])o[t]={};o[t][s.dataset.key]=v;});qsa('.cui-lora-w').forEach(function(inp){var t=inp.dataset.type;if(!o[t])o[t]={};o[t][inp.dataset.key]=parseFloat(inp.value)||1.0;});return o;}

// ===== 大图预览 =====
var _galleryImages=[];  // [{url,filename}]
function _saveGallery(){localStorage.setItem('grimoire2_gallery',JSON.stringify(_galleryImages));_syncSave({gallery:1});}
function _loadGallery(){
  try{var d=JSON.parse(localStorage.getItem('grimoire2_gallery')||'[]');_galleryImages=d||[];
    if(_galleryImages.length){
      el('comfyui-gallery').style.display='block';
      var imgArea=el('comfyui-gallery-imgs');imgArea.innerHTML='';
      for(var i=0;i<_galleryImages.length;i++){
        var gi=_galleryImages[i];
        var wrap=document.createElement('div');wrap.className='gallery-img-wrap';
        var elm=document.createElement('img');elm.src=gi.url;elm.loading='lazy';
        elm.onerror=function(){this.parentElement.style.display='none';};
        elm.addEventListener('click',function(){_openImgPreview(this.src,gi.filename||'');});
        var info=document.createElement('div');info.className='gallery-img-info';
        var lbl=document.createElement('span');lbl.className='gallery-img-label';lbl.textContent=gi.filename||'';
        info.appendChild(lbl);wrap.appendChild(elm);wrap.appendChild(info);
        imgArea.appendChild(wrap);
      }
      el('gallery-count').textContent=_galleryImages.length+' 张';
    }
  }catch(e){_galleryImages=[];}
}
var _previewState={index:0,scale:1,url:'',panX:0,panY:0,dragging:false,startX:0,startY:0,startPanX:0,startPanY:0,natW:600,natH:600};
function _openImgPreview(url,label){
  var idx=0;for(var i=0;i<_galleryImages.length;i++){if(_galleryImages[i].url===url){idx=i;break;}}
  _previewState.index=idx;_previewState.scale=1;_previewState.panX=0;_previewState.panY=0;
  _loadPreviewImage(url);
  el('img-preview-modal').classList.add('active');_updatePreviewNav();
  // 显示提示词和参数
  var gi=_galleryImages[idx];
  var raw=gi.prompt||'';
  var negIdx=raw.indexOf('\n--neg ');
  if(negIdx<0)negIdx=raw.indexOf('--neg ');
  var prompt=negIdx>=0?raw.substring(0,negIdx).trim():raw.trim();
  el('img-preview-meta-text').textContent=prompt||'（无）';
  el('img-preview-prompt-popup').style.display='none';
}
function _loadPreviewImage(url){
  var img=el('img-preview-img');img.src=url;img.style.transform='scale(1)';img.style.cursor='grab';
  img.onload=function(){_previewState.natW=img.naturalWidth;_previewState.natH=img.naturalHeight;el('img-preview-res').textContent=_previewState.natW+'×'+_previewState.natH;el('img-preview-zoom').textContent='100%';_fitToWindow();};
}
function _previewNext(){if(_galleryImages.length<2)return;_previewState.index=(_previewState.index+1)%_galleryImages.length;_resetAndLoad(_galleryImages[_previewState.index].url);}
function _previewPrev(){if(_galleryImages.length<2)return;_previewState.index=(_previewState.index-1+_galleryImages.length)%_galleryImages.length;_resetAndLoad(_galleryImages[_previewState.index].url);}
function _resetAndLoad(url){_previewState.scale=1;_previewState.panX=0;_previewState.panY=0;_loadPreviewImage(url);_updatePreviewNav();el('img-preview-prompt-popup').style.display='none';}
function _updatePreviewNav(){el('img-preview-prev').style.display=_galleryImages.length>1?'flex':'none';el('img-preview-next').style.display=_galleryImages.length>1?'flex':'none';}
function _closeImgPreview(){el('img-preview-modal').classList.remove('active');el('img-preview-prompt-popup').style.display='none';}
function _updatePreviewTransform(){var img=el('img-preview-img');img.style.transform='translate('+_previewState.panX+'px,'+_previewState.panY+'px) scale('+_previewState.scale+')';el('img-preview-zoom').textContent=Math.round(_previewState.scale*100)+'%';}
function _fitToWindow(){var cw=el('img-preview-container').clientWidth-140,ch=el('img-preview-container').clientHeight;var nw=_previewState.natW||600,nh=_previewState.natH||600;var s=Math.min(cw/nw,ch/nh,1)*0.9;_previewState.scale=s;_previewState.panX=0;_previewState.panY=0;_updatePreviewTransform();}
function _zoomIn(){_previewState.scale=Math.min(10,_previewState.scale*1.3);_updatePreviewTransform();}
function _zoomOut(){_previewState.scale=Math.max(0.05,_previewState.scale/1.3);_updatePreviewTransform();}
function _zoomReset(){_previewState.scale=1;_previewState.panX=0;_previewState.panY=0;_updatePreviewTransform();}
el('btn-img-preview-close').addEventListener('click',_closeImgPreview);
el('img-preview-modal').addEventListener('click',function(e){if(e.target===this)_closeImgPreview();});
el('img-preview-prev').addEventListener('click',_previewPrev);
el('img-preview-next').addEventListener('click',_previewNext);
el('btn-zoom-in').addEventListener('click',_zoomIn);
el('btn-zoom-out').addEventListener('click',_zoomOut);
el('btn-zoom-reset').addEventListener('click',_zoomReset);
el('btn-zoom-fit').addEventListener('click',_fitToWindow);
el('btn-img-show-prompt').addEventListener('click',function(e){
  e.stopPropagation();
  var pop=el('img-preview-prompt-popup');
  pop.style.display=pop.style.display==='none'?'block':'none';
});
// 弹出气泡中的复制/发送按钮（防抖，click 移动端也生效因为 touch-action:manipulation）
var _popupCopyEl=el('btn-img-popup-copy');
var _popupSendEl=el('btn-img-popup-send');
var _popupActionLock=0;
if(_popupCopyEl){
  _popupCopyEl.addEventListener('click',function(e){
    e.stopPropagation();
    var now=Date.now();
    if(now-_popupActionLock<500)return;
    _popupActionLock=now;
    _popupCopyMeta();
  });
}
if(_popupSendEl){
  _popupSendEl.addEventListener('click',function(e){
    e.stopPropagation();
    var now=Date.now();
    if(now-_popupActionLock<500)return;
    _popupActionLock=now;
    _popupSendMeta();
  });
}
el('btn-img-download').addEventListener('click',function(){
  var url=el('img-preview-img').src;
  if(!url)return;
  var a=document.createElement('a');
  a.href=url;
  a.download=_galleryImages[_previewState.index]?(_galleryImages[_previewState.index].filename||'image.png'):'image.png';
  a.target='_blank';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
});
function _popupCopyMeta(){
  var gi=_galleryImages[_previewState.index];if(!gi)return;
  var raw=gi.prompt||'';var negIdx=raw.indexOf('\n--neg ');if(negIdx<0)negIdx=raw.indexOf('--neg ');
  var text=negIdx>=0?raw.substring(0,negIdx).trim():raw.trim();
  copyText(text);toast('已复制');
  el('img-preview-prompt-popup').style.display='none';
}
function _popupSendMeta(){
  var gi=_galleryImages[_previewState.index];if(!gi)return;
  var wf=el('comfyui-workflow').value;if(!wf){toast('请先选择工作流');return;}
  var raw=gi.prompt||'';var negIdx=raw.indexOf('\n--neg ');if(negIdx<0)negIdx=raw.indexOf('--neg ');
  var pr=negIdx>=0?raw.substring(0,negIdx).trim():raw.trim();
  if(!pr.trim()){toast('该图片无提示词记录');return;}
  var w=parseInt(el('comfyui-width').value)||null,h=parseInt(el('comfyui-height').value)||null;
  function _popSend(finalPrompt){
    var over=getModelOverrides(),rs=el('comfyui-rand-seed').checked;
    var wfs=S.wfSettings[wf]||{},clipmap=_getClipMapping(),negTpl=S.negTemplateAuto?S.negTemplate:'';
    S.comfyuiQueue.push({idx:S.comfyuiQueue.length,body:{prompt:finalPrompt,workflow:wf,width:w,height:h,overrides:over,rand_seed:rs,wf_settings:wfs,clip_mapping:clipmap,neg_template:negTpl,load_image:S.loadImage||null},done:false});
    if(!S.comfyuiRunning)_execNextQueue();updateQueueUI();_saveGenHistory(finalPrompt);
  }
  if(el('llm-auto-refine').checked){
    var negPart=raw.indexOf('--neg ')>=0?'\n--neg '+raw.split('--neg ')[1]:'';
    toast('⏳ AI润色中...');
    api('/api/llm/translate',{method:'POST',body:{prompt:pr,sysprompt:el('llm-sysprompt').value.trim()||'',url:el('llm-url').value,model:el('llm-model').value,key:el('llm-key').value}}).then(function(r){_popSend(r.ok&&r.text?r.text:pr+(negPart||''));el('img-preview-modal').classList.remove('active');el('img-preview-prompt-popup').style.display='none';toast(r.ok?'已发送(已润色)到队列':'润色失败，已发送原文');});
  }else{
    _popSend(raw);el('img-preview-modal').classList.remove('active');el('img-preview-prompt-popup').style.display='none';toast('已发送到队列');
  }
}
el('img-preview-img').addEventListener('wheel',function(e){e.preventDefault();if(e.deltaY<0){_previewState.scale=Math.min(10,_previewState.scale*1.1);}else{_previewState.scale=Math.max(0.05,_previewState.scale/1.1);}_updatePreviewTransform();});
// 触摸支持：单指拖动，双指缩放
var _touchState={touches:0,startDist:0,startScale:1,startPanX:0,startPanY:0,singleX:0,singleY:0};
el('img-preview-img').addEventListener('touchstart',function(e){
  if(e.touches.length===1){
    _touchState.touches=1;
    _touchState.singleX=e.touches[0].clientX;
    _touchState.singleY=e.touches[0].clientY;
    _touchState.startPanX=_previewState.panX;
    _touchState.startPanY=_previewState.panY;
  }else if(e.touches.length===2){
    _touchState.touches=2;
    var dx=e.touches[0].clientX-e.touches[1].clientX;
    var dy=e.touches[0].clientY-e.touches[1].clientY;
    _touchState.startDist=Math.sqrt(dx*dx+dy*dy);
    _touchState.startScale=_previewState.scale;
  }
  e.preventDefault();
},{passive:false});
el('img-preview-img').addEventListener('touchmove',function(e){
  if(_touchState.touches===1&&e.touches.length===1){
    _previewState.panX=_touchState.startPanX+(e.touches[0].clientX-_touchState.singleX);
    _previewState.panY=_touchState.startPanY+(e.touches[0].clientY-_touchState.singleY);
    _updatePreviewTransform();
  }else if(_touchState.touches===2&&e.touches.length===2){
    var dx=e.touches[0].clientX-e.touches[1].clientX;
    var dy=e.touches[0].clientY-e.touches[1].clientY;
    var dist=Math.sqrt(dx*dx+dy*dy);
    if(_touchState.startDist>0){
      _previewState.scale=Math.max(0.05,Math.min(10,_touchState.startScale*(dist/_touchState.startDist)));
      _updatePreviewTransform();
    }
  }
  e.preventDefault();
},{passive:false});
el('img-preview-img').addEventListener('touchend',function(){_touchState.touches=0;});
el('img-preview-img').addEventListener('mousedown',function(e){if(e.button!==0)return;_previewState.dragging=true;_previewState.startX=e.clientX;_previewState.startY=e.clientY;_previewState.startPanX=_previewState.panX;_previewState.startPanY=_previewState.panY;this.style.cursor='grabbing';e.preventDefault();});
window.addEventListener('mousemove',function(e){if(!_previewState.dragging)return;_previewState.panX=_previewState.startPanX+(e.clientX-_previewState.startX);_previewState.panY=_previewState.startPanY+(e.clientY-_previewState.startY);_updatePreviewTransform();});
window.addEventListener('mouseup',function(){if(_previewState.dragging){_previewState.dragging=false;el('img-preview-img').style.cursor='grab';}});
document.addEventListener('keydown',function(e){if(!el('img-preview-modal').classList.contains('active'))return;if(e.key==='Escape')_closeImgPreview();if(e.key==='ArrowLeft'){e.preventDefault();_previewPrev();}if(e.key==='ArrowRight'){e.preventDefault();_previewNext();}if(e.key==='+'||e.key==='='){e.preventDefault();_zoomIn();}if(e.key==='-'){e.preventDefault();_zoomOut();}if(e.key==='0'){e.preventDefault();_zoomReset();}});
/* ===== 手机端适配 ===== */
var _isMobile=window.innerWidth<=768;
function _initMobile(){
  if(!_isMobile){console.log('Not mobile');return;}
  try{
  // 显示移动端元素
  var mb=el('m-tabbar');if(mb)mb.style.display='flex';else console.error('m-tabbar missing');
  var sm=el('search-input-m');if(sm&&sm.parentElement)sm.parentElement.style.display='flex';
  // 底部Tab切换
  qsa('#m-tabbar .m-tab').forEach(function(t){
    t.addEventListener('click',function(){try{
      qsa('#m-tabbar .m-tab').forEach(function(x){x.classList.remove('active');});
      this.classList.add('active');
      var v=this.dataset.view;
      el('tag-browser').classList.toggle('m-show',v==='browser');
      el('prompt-panel').classList.toggle('m-show',v==='prompt'||v==='comfy');
      // 恢复tag-browser
      var tb=el('tag-browser');
      var elm;elm=tb.querySelector('#browser-header');if(elm)elm.style.display='';
      elm=tb.querySelector('#browser-actions');if(elm)elm.style.display='';
      elm=tb.querySelector('#tag-grid');if(elm)elm.style.display='';
      var sr=tb.querySelector('.search-on-mobile');if(sr)sr.style.display='flex';
      var sri=tb.querySelector('#search-results-info');if(sri)sri.style.display='';
      elm=tb.querySelector('#m-selected-bar');if(elm)elm.style.display='';
      // 画廊移回原位
      var gal=document.getElementById('comfyui-gallery');
      if(gal&&gal.parentElement!==tb){tb.appendChild(gal);}
      if(v==='comfy'){
        var pp=el('prompt-panel');
        var elm;elm=pp.querySelector('.panel-tabs');if(elm)elm.style.display='none';
        elm=pp.querySelector('#panel-positive');if(elm)elm.style.display='none';
        elm=pp.querySelector('#panel-negative');if(elm)elm.style.display='none';
        elm=pp.querySelector('.preview-section');if(elm)elm.style.display='none';
        elm=pp.querySelector('.llm-section');if(elm)elm.style.display='none';
        elm=pp.querySelector('.comfyui-panel');if(elm)elm.style.display='block';
        // 画廊移到prompt-panel底部
        if(gal){gal.style.display='block';pp.appendChild(gal);}
      }else if(v==='prompt'){
        var pp=el('prompt-panel');
        var tabs=pp.querySelector('.panel-tabs');if(tabs)tabs.style.display='';
        var pc=pp.querySelector('#panel-positive');if(pc)pc.style.display='';
        var ps=pp.querySelector('.preview-section');if(ps)ps.style.display='';
        var ls=pp.querySelector('.llm-section');if(ls)ls.style.display='';
        var cp=pp.querySelector('.comfyui-panel');if(cp)cp.style.display='none';
      }
      _updateMobileSelected();
    }catch(e){toast('错误:'+e.message);}});
  });
  // 抽屉
  el('m-overlay').addEventListener('click',function(){_closeDrawer();});
  el('m-drawer-close').addEventListener('click',_closeDrawer);
  // 手机搜索
  el('search-input-m').addEventListener('input',function(){
    var q=this.value.trim();
    el('search-input').value=q;
    var b=el('btn-search-clear-m');
    if(q){b.style.display='inline-block';doSearch(q);}
    else{b.style.display='none';clearSearch();}
  });
  el('btn-search-clear-m').addEventListener('click',function(){
    el('search-input-m').value='';el('search-input').value='';
    this.style.display='none';clearSearch();
  });
  // 免责声明
  el('btn-disclaimer-m').addEventListener('click',function(){el('disclaimer-modal').classList.add('show');});
  el('btn-disclaimer-close').addEventListener('click',function(){el('disclaimer-modal').classList.remove('show');});
  el('disclaimer-modal').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
  // 抽屉内分类点击
  el('m-action-favs').addEventListener('click',function(){
    var favs=Object.keys(S.favs);
    var html='<div style="padding:4px 12px 8px">';
    if(favs.length===0)html+='<div style="font-size:11px;color:var(--text-muted);padding:8px 0">暂无收藏</div>';
    else for(var i=0;i<favs.length;i++){var en=favs[i];var zh=findZh(en)||en;html+='<div style="display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;cursor:pointer" class=m-fav-item data-en="'+esc(en)+'" data-zh="'+esc(zh||'')+'"><span style=flex:1>⭐ '+esc(zh||en)+'</span><span style="font-size:10px;color:var(--text-muted)">'+esc(en)+'</span><button class=m-fav-del data-en="'+esc(en)+'" style="border:none;background:none;color:var(--text-muted);font-size:14px;cursor:pointer;padding:4px">✕</button></div>';}
    html+='</div>';
    var div=el('m-favs-content');div.innerHTML=html;
    div.style.display=div.style.display==='none'?'block':'none';
    qsa('.m-fav-item',div).forEach(function(it){it.addEventListener('click',function(e){if(e.target.classList.contains('m-fav-del'))return;var en=this.dataset.en,zh=this.dataset.zh;if(S.activeTab==='negative'){if(isSelected(en,'negative'))removeTag(en,'negative');else addTag(en,zh,'negative');}else{if(isSelected(en,'positive'))removeTag(en,'positive');else addTag(en,zh,'positive');}});});
    qsa('.m-fav-del',div).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();toggleFav(this.dataset.en);setTimeout(function(){el('m-action-favs').click();el('m-action-favs').click();},50);});});
  });
  el('m-action-presets').addEventListener('click',function(){
    var div=el('m-presets-content');
    var html='<div style="padding:4px 12px 8px;font-size:11px;color:var(--text-muted)">加载中...</div>';
    div.innerHTML=html;div.style.display=div.style.display==='none'?'block':'none';
    if(div.style.display==='none')return;
    api('/api/presets').then(function(d){
      var list=(d.builtin||[]).concat(d.user||[]);
      var html='<div style="padding:4px 12px 8px">';
      if(list.length===0)html+='<div style="font-size:11px;color:var(--text-muted);padding:8px 0">暂无预设</div>';
      else for(var i=0;i<list.length;i++){var p=list[i];html+='<div style="display:flex;align-items:center;gap:4px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;cursor:pointer" class=m-preset-item data-name="'+esc(p.name)+'" data-type="'+(p._filename?'user':'builtin')+'"><span style=flex:1>'+esc(p.name)+' <span style="font-size:10px;color:var(--text-muted)">('+p.tags.length+'个)</span></span></div>';}
      html+='</div>';div.innerHTML=html;
      qsa('.m-preset-item',div).forEach(function(it){it.addEventListener('click',function(){
        var name=this.dataset.name;var tp=this.dataset.type;
        if(tp==='builtin'){for(var i=0;i<d.builtin.length;i++)if(d.builtin[i].name===name){applyPreset(d.builtin[i]);break;}}
        else{for(var i=0;i<d.user.length;i++)if(d.user[i]._filename===name||d.user[i].name===name){applyPreset(d.user[i]);break;}}
        _closeDrawer();toast('已加载预设: '+name);
      });});
    });
  });
  el('m-action-history').addEventListener('click',function(){
    var m=el('m-history-content');
    m.style.display=m.style.display==='none'?'block':'none';
  });
  el('m-action-randprof').addEventListener('click',function(){_closeDrawer();setTimeout(function(){el('btn-rand-profile').click();},200);});
  el('m-drawer-randprof').addEventListener('click',function(){_closeDrawer();setTimeout(function(){el('btn-rand-profile').click();},200);});
  // 标签模式切换放搜索栏旁
  var tagModeBtn=el('btn-tag-mode');tagModeBtn.style.display='none';
  el('search-input-m').parentElement.appendChild(tagModeBtn);
  tagModeBtn.style.display='';
  tagModeBtn.style.cssText='font-size:10px;padding:4px 8px;border:1px solid var(--border);border-radius:4px;background:var(--bg-primary);color:var(--text-muted);cursor:pointer;white-space:nowrap';
  // 分类按钮放到搜索栏旁
  var menuBtn=document.createElement('button');
  menuBtn.id='m-menu-btn';
  menuBtn.style.cssText='flex-shrink:0;font-size:12px;padding:8px 14px;border:1px solid var(--border);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);cursor:pointer;white-space:nowrap';
  menuBtn.innerHTML='📁 选择分类';
  menuBtn.addEventListener('click',function(){el('m-overlay').classList.add('show');el('m-drawer').classList.add('show');_buildMobileDrawer();});
  el('search-input-m').parentElement.insertBefore(menuBtn,el('search-input-m'));
  // 全屏按钮
  var fullBtn=document.createElement('button');
  fullBtn.className='tool-btn';
  fullBtn.style.cssText='font-size:11px;padding:4px 8px';
  fullBtn.innerHTML='全屏';
  fullBtn.title='全屏模式';
  fullBtn.addEventListener('click',function(){
    if(document.fullscreenElement){document.exitFullscreen();}else{document.documentElement.requestFullscreen().catch(function(){});}
  });
  var tbRight=document.querySelector('#toolbar .toolbar-right');
  tbRight.appendChild(fullBtn);
  // 初始更新
  _buildMobileDrawer();
  _updateMobileSelected();
  // 恢复保存的Tab状态
  if(S._restoreTab){var tb=document.querySelector('#m-tabbar .m-tab[data-view="'+S._restoreTab+'"]');if(tb)tb.click();}
  }catch(e){console.error('InitMobile:',e);}
}

function _closeDrawer(){
  el('m-overlay').classList.remove('show');
  el('m-drawer').classList.remove('show');
}

function _buildMobileDrawer(){
  var list=el('m-cat-list');
  if(!S.allData){list.innerHTML='';return;}
  var html='';
  for(var i=0;i<S.allData.categories.length;i++){
    var c=S.allData.categories[i];
    var cl=(S.catLimits[c.name]!==undefined&&S.catLimits[c.name]!==null)?S.catLimits[c.name]:3;
    html+='<div class=m-cat-header data-cat="'+esc(c.name)+'" style="display:flex;align-items:center;gap:6px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;color:var(--text-primary);cursor:pointer">';
    var cm=S.catModes[c.name]==='cat'?'cat':'sc';
    html+='<span class=m-arrow>▶</span><span style=flex:1>'+esc(c.name)+' ('+c.subcategories.length+')</span>';
    html+='<button class=m-cat-mode-btn data-cat="'+esc(c.name)+'" style="padding:2px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg-primary);color:var(--text-muted);font-size:13px;cursor:pointer;margin-right:4px" title='+(cm==='cat'?'按分类随机':'按子类随机')+'>'+(cm==='cat'?'📁':'📂')+'</button>';
    html+='<div class=m-stepper><button class=ms-btn data-cat="'+esc(c.name)+'" data-dir=-1>-</button><span class=ms-val>'+cl+'</span><button class=ms-btn data-cat="'+esc(c.name)+'" data-dir=1>+</button></div>';
    html+='</div>';
    html+='<div class=m-sub-list>';
    for(var j=0;j<c.subcategories.length;j++){
      var sc=c.subcategories[j];
      var sk=c.name+'|'+sc.name;
      var sl=(S.scLimits[sk]!==undefined&&S.scLimits[sk]!==null)?S.scLimits[sk]:1;
      var ac=S.activeSc===sc.name&&S.activeCat===c.name?' active':'';
      html+='<div class="m-sub-item'+ac+'" data-cat="'+esc(c.name)+'" data-sc="'+esc(sc.name)+'">';
      html+='<span class=sub-label>'+esc(sc.name)+' ('+sc.tags.length+')</span>';
      html+='<div class=m-stepper><button class=ms-btn data-sckey="'+esc(sk)+'" data-dir=-1>-</button><span class=ms-val>'+sl+'</span><button class=ms-btn data-sckey="'+esc(sk)+'" data-dir=1>+</button></div>';
      html+='</div>';
    }
    html+='</div>';
  }
  list.innerHTML=html;
  // 折叠
  qsa('.m-cat-header',list).forEach(function(h){
    h.addEventListener('click',function(e){
      if(e.target.classList.contains('ms-btn')||e.target.classList.contains('m-cat-mode-btn'))return;
      var sub=this.nextElementSibling;
      var arrow=this.querySelector('.m-arrow');
      sub.classList.toggle('open');arrow.classList.toggle('open');
    });
  });
  // 步进器
  qsa('.ms-btn',list).forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var d=parseInt(this.dataset.dir);
      var valEl=this.parentElement.querySelector('.ms-val');
      var v=parseInt(valEl.textContent)||0;
      v=Math.max(0,Math.min(99,v+d));
      valEl.textContent=v;
      if(this.dataset.cat){S.catLimits[this.dataset.cat]=v;saveCatLimits();}
      if(this.dataset.sckey){S.scLimits[this.dataset.sckey]=v;saveScLimits();}
    });
  });
  // 随机模式切换
  qsa('.m-cat-mode-btn',list).forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var cat=this.dataset.cat;
      S.catModes[cat]=S.catModes[cat]==='cat'?'sc':'cat';
      saveCatModes();
      this.textContent=S.catModes[cat]==='cat'?'📁':'📂';
      this.title=S.catModes[cat]==='cat'?'按分类随机':'按子类随机';
    });
  });
  // 子类点击
  qsa('.m-sub-item',list).forEach(function(it){
    it.addEventListener('click',function(e){
      if(e.target.classList.contains('ms-btn'))return;
      S.isSearching=false;S.activeCat=this.dataset.cat;S.activeSc=this.dataset.sc;
      el('search-input').value='';el('search-input-m').value='';
      el('btn-search-clear').style.display='none';el('btn-search-clear-m').style.display='none';
      el('search-results-info').style.display='none';
      qsa('.m-sub-item',list).forEach(function(s){s.classList.remove('active');});
      this.classList.add('active');
      _closeDrawer();
      renderGrid();
      _updateMobileSelected();
    });
  });
}

function _updateMobileSelected(){
  if(!_isMobile)return;
  var pos=S.posTags.length,neg=S.negTags.length;
  el('m-sel-pos-count').textContent='('+pos+')';
  el('m-sel-neg-count').textContent='('+neg+')';
  var bar=el('m-selected-bar');
  var tagsEl=el('m-sel-tags');
  if(pos===0&&neg===0){bar.classList.remove('show');return;}
  bar.classList.add('show');
  var all=S.posTags.slice();
  var html='';
  for(var i=0;i<all.length;i++){
    var t=all[i];
    var locked=t.locked;
    html+='<div class=selected-chip style="display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:12px;background:#2d2850;border:1px solid '+(locked?'#e6a848':'var(--accent)')+';font-size:11px" data-en="'+esc(t.en)+'" data-panel=positive>';
    html+='<span class=chip-lock data-en="'+esc(t.en)+'" data-panel=positive style="font-size:14px;cursor:pointer;'+(locked?'color:#e6a848;':'color:#5e6078;')+'" title="'+(locked?'已锁定-点击解锁':'点击锁定')+'">'+(locked?'🔒':'🔓')+'</span>';
    html+='<span style=flex:1>'+esc(t.zh||t.en)+'</span>';
    html+='<span class=chip-remove data-en="'+esc(t.en)+'" data-panel=positive style=color:var(--danger);font-weight:bold;cursor:pointer;font-size:14px title=移除>✕</span>';
    html+='</div>';
  }
  for(var i=0;i<S.negTags.length;i++){
    var t=S.negTags[i];
    var locked=t.locked;
    html+='<div class=selected-chip style="display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:12px;background:#3d2020;border:1px solid '+(locked?'#e6a848':'var(--danger)')+';font-size:11px" data-en="'+esc(t.en)+'" data-panel=negative>';
    html+='<span class=chip-lock data-en="'+esc(t.en)+'" data-panel=negative style="font-size:14px;cursor:pointer;'+(locked?'color:#e6a848;':'color:#5e6078;')+'" title="'+(locked?'已锁定-点击解锁':'点击锁定')+'">'+(locked?'🔒':'🔓')+'</span>';
    html+='<span style=flex:1>'+esc(t.zh||t.en)+'</span>';
    html+='<span class=chip-remove data-en="'+esc(t.en)+'" data-panel=negative style=color:var(--danger);font-weight:bold;cursor:pointer;font-size:14px title=移除>✕</span>';
    html+='</div>';
  }
  tagsEl.innerHTML=html;
  // 点击标签文字=移除
  qsa('.selected-chip',tagsEl).forEach(function(ch){
    ch.addEventListener('click',function(e){
      if(e.target.classList.contains('chip-lock')||e.target.classList.contains('chip-remove'))return;
      removeTag(this.dataset.en,this.dataset.panel);
      _updateMobileSelected();
      if(!S.isSearching)renderGrid();
    });
  });
  // 锁定按钮
  qsa('.chip-lock',tagsEl).forEach(function(lk){
    lk.addEventListener('click',function(e){
      e.stopPropagation();
      var en=this.dataset.en;
      var p=this.dataset.panel;
      var a=p==='negative'?S.negTags:S.posTags;
      for(var i=0;i<a.length;i++)if(a[i].en===en){a[i].locked=!a[i].locked;break;}
      var panel=p==='negative'?'negative':'positive';
      refreshPanel(panel);saveLocked();
      _updateMobileSelected();
    });
  });
  // 移除按钮
  qsa('.chip-remove',tagsEl).forEach(function(rm){
    rm.addEventListener('click',function(e){
      e.stopPropagation();
      removeTag(this.dataset.en,this.dataset.panel);
      _updateMobileSelected();
      if(!S.isSearching)renderGrid();
    });
  });
}

// 监听窗口变化
window.addEventListener('resize',function(){
  var was=_isMobile;
  _isMobile=window.innerWidth<=768;
  if(_isMobile&&!was)_initMobile();
  if(!_isMobile&&was)location.reload();
});

// 初始检测
if(_isMobile)_initMobile();
// 桌面端免责声明
el('btn-disclaimer-desktop').addEventListener('click',function(){el('disclaimer-modal-desktop').style.display='';});
el('btn-disclaimer-desktop-close').addEventListener('click',function(){el('disclaimer-modal-desktop').style.display='none';});

document.addEventListener('DOMContentLoaded',init);


