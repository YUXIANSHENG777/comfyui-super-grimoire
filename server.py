# -*- coding: utf-8 -*-
"""超级无敌魔导书 - AI提示词组合器"""

import json, os, random, shutil, time, urllib.request, urllib.error, urllib.parse
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory

BASE = Path(__file__).parent
DATA_DIR = BASE / "data"
USER_DIR = BASE / "user_data"
PRESETS_DIR = USER_DIR / "presets"
HISTORY_DIR = USER_DIR / "history"
CUSTOM_DIR = USER_DIR
import re
WORKFLOWS_DIR = BASE / "workflows"
# ComfyUI URL: 优先从配置文件读取，支持运行时修改
_cui_config_file = BASE / "user_data" / "comfyui_config.json"
def _load_comfyui_url():
    try:
        if _cui_config_file.exists():
            return json.loads(open(_cui_config_file, "r", encoding="utf-8").read()).get("url", "http://127.0.0.1:8188")
    except:
        pass
    return "http://127.0.0.1:8188"
def _save_comfyui_url(url):
    _cui_config_file.parent.mkdir(parents=True, exist_ok=True)
    with open(_cui_config_file, "w", encoding="utf-8") as f:
        json.dump({"url": url}, f)
COMFYUI_URL = _load_comfyui_url()

for d in [PRESETS_DIR, HISTORY_DIR, CUSTOM_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# 迁移旧数据到 user_data/
_OLD_PRESETS = BASE / "presets"
_OLD_HISTORY = BASE / "history"
_OLD_CUSTOM = BASE / "data" / "custom_tags.json"
if _OLD_PRESETS.exists() and not any(PRESETS_DIR.iterdir()):
    for f in _OLD_PRESETS.glob("*.json"):
        shutil.copy2(f, PRESETS_DIR / f.name)
if _OLD_HISTORY.exists() and not any(HISTORY_DIR.iterdir()):
    for f in _OLD_HISTORY.glob("*.json"):
        shutil.copy2(f, HISTORY_DIR / f.name)
if _OLD_CUSTOM.exists() and not (CUSTOM_DIR / "custom_tags.json").exists():
    shutil.copy2(_OLD_CUSTOM, CUSTOM_DIR / "custom_tags.json")

app = Flask(__name__, static_folder="static", static_url_path="")
app.config['JSON_AS_ASCII'] = False
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def read_json(path, default=None):
    if Path(path).exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default if default is not None else {}

def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def merge_tags():
    tags = read_json(DATA_DIR / "tags.json", {"categories": [], "presets": []})
    custom = read_json(CUSTOM_DIR / "custom_tags.json", {"categories": []})
    for cc in custom.get("categories", []):
        found = False
        for cat in tags["categories"]:
            if cat["name"] == cc["name"]:
                for csc in cc.get("subcategories", []):
                    sf = False
                    for sc in cat.setdefault("subcategories", []):
                        if sc["name"] == csc["name"]:
                            sc["tags"].extend(csc["tags"]); sf = True; break
                    if not sf:
                        cat["subcategories"].append(csc)
                found = True; break
        if not found:
            tags["categories"].append(cc)
    return tags

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

def _load_tags(mode="phrase"):
    """根据模式加载标签库"""
    filename = "tags_single.json" if mode == "single" else "tags.json"
    tags = read_json(DATA_DIR / filename, {"categories": [], "presets": []})
    if mode == "single":
        return tags
    return merge_tags()

@app.route("/api/tags")
def api_tags():
    mode = request.args.get("mode", "phrase")
    return jsonify(_load_tags(mode))

@app.route("/api/search")
def api_search():
    q = request.args.get("q", "").strip().lower()
    if not q: return jsonify([])
    mode = request.args.get("mode", "phrase")
    data = _load_tags(mode)
    results = []
    for cat in data["categories"]:
        for sc in cat.get("subcategories", []):
            matches = [t for t in sc["tags"] if q in t["en"].lower() or q in t["zh"].lower()]
            if matches:
                results.append({"category": cat["name"], "subcategory": sc["name"], "tags": matches})
    return jsonify(results)

@app.route("/api/presets")
def api_presets():
    data = merge_tags()
    builtin = data.get("presets", [])
    user = []
    if PRESETS_DIR.exists():
        for f in PRESETS_DIR.glob("*.json"):
            p = read_json(f); p["_filename"] = f.stem; user.append(p)
    return jsonify({"builtin": builtin, "user": user})

@app.route("/api/presets/save", methods=["POST"])
def api_presets_save():
    data = request.get_json()
    name = (data.get("name", "")).strip()
    if not name: return jsonify({"error": "名称不能为空"}), 400
    preset = {"name": name, "tags": data.get("tags", []), "weights": data.get("weights", {}),
              "negative_tags": data.get("negative_tags", []), "negative_weights": data.get("negative_weights", {}),
              "created": time.strftime("%Y-%m-%d %H:%M:%S")}
    safe = "".join(c for c in name if c.isalnum() or c in "._- ")
    write_json(PRESETS_DIR / f"{safe}.json", preset)
    return jsonify({"ok": True})

@app.route("/api/presets/delete/<name>", methods=["DELETE"])
def api_presets_delete(name):
    fp = PRESETS_DIR / f"{name}.json"
    if fp.exists(): fp.unlink(); return jsonify({"ok": True})
    return jsonify({"error": "not found"}), 404

@app.route("/api/presets/delete-builtin/<name>", methods=["DELETE"])
def api_presets_delete_builtin(name):
    tags = read_json(DATA_DIR / "tags.json", {"categories": [], "presets": []})
    orig_len = len(tags.get("presets", []))
    tags["presets"] = [p for p in tags.get("presets", []) if p.get("name","") != name]
    if len(tags.get("presets", [])) < orig_len:
        write_json(DATA_DIR / "tags.json", tags)
        return jsonify({"ok": True})
    return jsonify({"error": "not found"}), 404

@app.route("/api/presets/export/<name>")
def api_presets_export(name):
    fp = PRESETS_DIR / f"{name}.json"
    if fp.exists(): return jsonify(read_json(fp))
    # 尝试从内置预设查找
    tags = read_json(DATA_DIR / "tags.json", {"categories": [], "presets": []})
    for p in tags.get("presets", []):
        if p.get("name", "") == name:
            return jsonify(p)
    return jsonify({"error": "not found"}), 404

@app.route("/api/presets/import", methods=["POST"])
def api_presets_import():
    data = request.get_json()
    name = (data.get("name", "")).strip()
    if not name: return jsonify({"error": "invalid"}), 400
    safe = "".join(c for c in name if c.isalnum() or c in "._- ")
    write_json(PRESETS_DIR / f"{safe}.json", data)
    return jsonify({"ok": True})

@app.route("/api/history")
def api_history():
    items = []
    if HISTORY_DIR.exists():
        for f in sorted(HISTORY_DIR.glob("*.json"), reverse=True):
            item = read_json(f); item["_filename"] = f.stem; items.append(item)
    return jsonify(items[:50])

@app.route("/api/history", methods=["POST"])
def api_history_add():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt: return jsonify({"error": "empty"}), 400
    ts = time.strftime("%Y%m%d_%H%M%S")
    item = {"prompt": prompt, "tags": data.get("tags", []),
            "negative_tags": data.get("negative_tags", []),
            "created": time.strftime("%Y-%m-%d %H:%M:%S")}
    write_json(HISTORY_DIR / f"{ts}.json", item)
    return jsonify({"ok": True})

@app.route("/api/history/<name>", methods=["DELETE"])
def api_history_delete(name):
    fp = HISTORY_DIR / f"{name}.json"
    if fp.exists(): fp.unlink(); return jsonify({"ok": True})
    return jsonify({"error": "not found"}), 404

@app.route("/api/history/clear", methods=["DELETE"])
def api_history_clear():
    if HISTORY_DIR.exists():
        for f in HISTORY_DIR.glob("*.json"): f.unlink()
    return jsonify({"ok": True})

@app.route("/api/custom-tags", methods=["GET"])
def api_custom_tags_get():
    return jsonify(read_json(CUSTOM_DIR / "custom_tags.json", {"categories": []}))

@app.route("/api/custom-tags/save", methods=["POST"])
def api_custom_tags_save():
    write_json(CUSTOM_DIR / "custom_tags.json", request.get_json())
    return jsonify({"ok": True})

@app.route("/api/custom-tags/add", methods=["POST"])
def api_custom_tags_add():
    data = request.get_json()
    cn, sn, en, zh = data.get("category",""), data.get("subcategory",""), data.get("en","").strip(), data.get("zh","").strip()
    if not cn or not sn or not en: return jsonify({"error": "参数不完整"}), 400
    custom = read_json(CUSTOM_DIR / "custom_tags.json", {"categories": []})
    cat = next((c for c in custom["categories"] if c["name"] == cn), None)
    if not cat:
        cat = {"id": "c_"+cn, "name": cn, "subcategories": []}; custom["categories"].append(cat)
    sc = next((s for s in cat["subcategories"] if s["name"] == sn), None)
    if not sc:
        sc = {"name": sn, "tags": []}; cat["subcategories"].append(sc)
    if any(t["en"] == en for t in sc["tags"]):
        return jsonify({"error": "标签已存在"}), 400
    sc["tags"].append({"en": en, "zh": zh})
    write_json(CUSTOM_DIR / "custom_tags.json", custom)
    return jsonify({"ok": True})

@app.route("/api/custom-tags/delete", methods=["POST"])
def api_custom_tags_delete():
    data = request.get_json()
    cn, sn, en = data.get("category",""), data.get("subcategory",""), data.get("en","")
    deleted = False
    # 1. 先尝试从 custom_tags.json 中删除
    custom = read_json(CUSTOM_DIR / "custom_tags.json", {"categories": []})
    for cat in custom["categories"]:
        if cat["name"] == cn:
            for sc in cat["subcategories"]:
                if sc["name"] == sn:
                    sc["tags"] = [t for t in sc["tags"] if t["en"] != en]
                    deleted = True
    write_json(CUSTOM_DIR / "custom_tags.json", custom)
    # 2. 再从 tags.json 中删除
    tags = read_json(DATA_DIR / "tags.json", {"categories": [], "presets": []})
    for cat in tags.get("categories", []):
        if cat["name"] == cn:
            for sc in cat.get("subcategories", []):
                if sc["name"] == sn:
                    sc["tags"] = [t for t in sc["tags"] if t["en"] != en]
                    deleted = True
            # 清理空的子类别
            cat["subcategories"] = [sc for sc in cat["subcategories"] if sc["tags"]]
    # 清理空的分类
    tags["categories"] = [c for c in tags["categories"] if c.get("subcategories")]
    if deleted:
        write_json(DATA_DIR / "tags.json", tags)
        return jsonify({"ok": True})
    return jsonify({"error": "not found"}), 404

@app.route("/api/custom-tags/edit", methods=["POST"])
def api_custom_tags_edit():
    data = request.get_json()
    cn, sn, old_en = data.get("category",""), data.get("subcategory",""), data.get("old_en","")
    new_en, new_zh = data.get("new_en","").strip(), data.get("new_zh","").strip()
    custom = read_json(CUSTOM_DIR / "custom_tags.json", {"categories": []})
    for cat in custom["categories"]:
        if cat["name"] == cn:
            for sc in cat["subcategories"]:
                if sc["name"] == sn:
                    for t in sc["tags"]:
                        if t["en"] == old_en:
                            t["en"] = new_en; t["zh"] = new_zh
                            write_json(CUSTOM_DIR / "custom_tags.json", custom)
                            return jsonify({"ok": True})
    return jsonify({"error": "not found"}), 404

@app.route("/api/custom-tags/add-category", methods=["POST"])
def api_custom_tags_add_category():
    data = request.get_json()
    name = data.get("name","").strip()
    if not name: return jsonify({"error": "名称不能为空"}), 400
    custom = read_json(CUSTOM_DIR / "custom_tags.json", {"categories": []})
    if any(c["name"] == name for c in custom["categories"]):
        return jsonify({"error": "自定义中已存在该分类，如需重建请先删除旧分类"}), 400
    custom["categories"].append({"id": "c_"+name, "name": name, "subcategories": []})
    write_json(CUSTOM_DIR / "custom_tags.json", custom)
    return jsonify({"ok": True})

@app.route("/api/comfyui/status")
def api_comfyui_status():
    try:
        req = urllib.request.Request(f"{COMFYUI_URL}/system_stats")
        urllib.request.urlopen(req, timeout=2)
        return jsonify({"online": True, "url": COMFYUI_URL})
    except:
        return jsonify({"online": False, "url": COMFYUI_URL})

@app.route("/api/comfyui/test-conn", methods=["POST"])
def api_comfyui_test_conn():
    data = request.get_json()
    url = (data.get("url") or "").strip().rstrip("/")
    if not url: return jsonify({"error": "URL不能为空"}), 400
    try:
        req = urllib.request.Request(f"{url}/system_stats")
        urllib.request.urlopen(req, timeout=3)
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)[:200]})

@app.route("/api/comfyui/set-url", methods=["POST"])
def api_comfyui_set_url():
    global COMFYUI_URL
    data = request.get_json()
    url = (data.get("url") or "").strip().rstrip("/")
    if not url: return jsonify({"error": "URL不能为空"}), 400
    COMFYUI_URL = url
    _save_comfyui_url(url)
    print(f"[ComfyUI] URL已更新: {url}")
    return jsonify({"ok": True, "url": url})

# LLM配置服务端存储（手机/桌面共享）
_llm_config_file = BASE / "user_data" / "llm_config.json"
def _load_llm_config():
    try:
        if _llm_config_file.exists():
            return json.loads(open(_llm_config_file, "r", encoding="utf-8").read())
    except Exception as e: print(f"[警告] LLM配置读取失败: {e}")
    return {}
def _save_llm_config(cfg):
    _llm_config_file.parent.mkdir(parents=True, exist_ok=True)
    with open(_llm_config_file, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)

@app.route("/api/llm/config", methods=["GET"])
def api_llm_config_get():
    return jsonify(_load_llm_config())

@app.route("/api/llm/config/save", methods=["POST"])
def api_llm_config_save():
    data = request.get_json()
    _save_llm_config(data)
    return jsonify({"ok": True})

# 润色预设服务端存储
_llm_presets_file = BASE / "user_data" / "llm_presets.json"
def _load_llm_presets():
    try:
        if _llm_presets_file.exists():
            return json.loads(open(_llm_presets_file, "r", encoding="utf-8").read())
    except Exception as e: print(f"[警告] 润色预设读取失败: {e}")
    return []
def _save_llm_presets(data):
    _llm_presets_file.parent.mkdir(parents=True, exist_ok=True)
    with open(_llm_presets_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route("/api/llm/presets", methods=["GET"])
def api_llm_presets_get():
    return jsonify(_load_llm_presets())

@app.route("/api/llm/presets/save", methods=["POST"])
def api_llm_presets_save():
    data = request.get_json()
    _save_llm_presets(data)
    return jsonify({"ok": True})

# 统一用户同步数据（手机/桌面共享）
_sync_file = BASE / "user_data" / "sync_data.json"
def _load_sync():
    try:
        if _sync_file.exists():
            raw = open(_sync_file, "r", encoding="utf-8").read().strip()
            if raw: return json.loads(raw)
    except Exception as e: print(f"[警告] 同步数据读取失败: {e}")
    return {}
def _save_sync(data):
    _sync_file.parent.mkdir(parents=True, exist_ok=True)
    with open(_sync_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route("/api/user/sync", methods=["GET"])
def api_user_sync_get():
    return jsonify(_load_sync())

@app.route("/api/user/sync", methods=["POST"])
def api_user_sync_save():
    data = request.get_json()
    current = _load_sync()
    # 深度合并：对象类型的数据合并而不是覆盖
    for key, val in data.items():
        if isinstance(val, dict) and isinstance(current.get(key), dict):
            current[key].update(val)
        else:
            current[key] = val
    _save_sync(current)
    return jsonify({"ok": True})



@app.route("/api/comfyui/workflows")
def api_comfyui_workflows():
    """返回工作流列表：仅本地"""
    WORKFLOWS_DIR.mkdir(parents=True, exist_ok=True)
    files = []
    for f in sorted(WORKFLOWS_DIR.glob("*.json")):
        files.append({"name": f"\U0001f4c1 {f.stem}", "filename": f.name, "source": "local"})
    return jsonify(files)

def _load_workflow_raw(fname):
    """加载工作流 JSON（仅本地文件）"""
    wf_path = WORKFLOWS_DIR / fname
    if wf_path.exists():
        with open(wf_path, "r", encoding="utf-8-sig") as f:
            return json.loads(f.read())
    return None

@app.route("/api/comfyui/workflow-size")
def api_comfyui_workflow_size():
    fname = request.args.get("file", "")
    if not fname: return jsonify({"width": 512, "height": 512}), 200
    raw = _load_workflow_raw(fname)
    if not raw: return jsonify({"width": 512, "height": 512}), 200
    size_info = {"width": 512, "height": 512, "node_id": ""}
    if isinstance(raw, dict):
        for nid, node in raw.items():
            if isinstance(node, dict) and "class_type" in node and "inputs" in node:
                inp = node["inputs"]
                if "width" in inp and "height" in inp:
                    size_info = {"width": inp["width"], "height": inp["height"], "node_id": nid}
                    break
    return jsonify(size_info)

@app.route("/api/comfyui/clip-nodes")
def api_comfyui_clip_nodes():
    fname = request.args.get("file", "")
    raw = _load_workflow_raw(fname) if fname else None
    nodes = []
    if not raw: return jsonify({"nodes": nodes})
    items = raw.get("nodes", raw) if isinstance(raw, dict) else {}
    if isinstance(items, list):
        for n in items:
            if isinstance(n, dict) and n.get("type", n.get("class_type", "")) == "CLIPTextEncode":
                nid = str(n.get("id", ""))
                txt = ""; title = ""
                for inp in n.get("inputs", []):
                    if isinstance(inp, dict) and inp.get("name") == "text":
                        txt = str(inp.get("widget", {}).get("value", ""))[:50]
                    elif isinstance(inp, list) and len(inp) >= 2 and inp[0] == "text":
                        v = inp[1]; txt = str(v)[:50] if isinstance(v, str) else "(连接)"
                _m = n.get("_meta") or {}
                title = str((_m.get("title", n.get("title", ""))) if isinstance(_m, dict) else (n.get("title", "")))
                nodes.append({"id": nid, "title": title, "text_preview": txt})
    elif isinstance(items, dict):
        for nid, nd in items.items():
            if isinstance(nd, dict) and nd.get("class_type", "") == "CLIPTextEncode":
                txt = nd.get("inputs", {}).get("text", "")
                txt = txt[:50] if isinstance(txt, str) else "(连接)"
                nodes.append({"id": str(nid), "title": nd.get("title", ""), "text_preview": txt})
    return jsonify({"nodes": nodes})

@app.route("/api/comfyui/workflow-info")
def api_comfyui_workflow_info():
    fname = request.args.get("file", "")
    if not fname: return jsonify({"error": "缺少参数"}), 400
    raw = _load_workflow_raw(fname)
    if not raw: return jsonify({"nodes": []})
    # 提取所有节点 (兼容 dict 和 list 格式)
    all_nodes = {}
    if isinstance(raw, dict):
        if "nodes" in raw and isinstance(raw["nodes"], list):
            for n in raw["nodes"]:
                nid = str(n.get("id", ""))
                ct = n.get("type", "")
                if nid and ct: all_nodes[nid] = {"class_type": ct, "inputs": {}}
                if "inputs" in n:
                    for inp in n.get("inputs", []):
                        if isinstance(inp, dict) and "name" in inp:
                            all_nodes[nid]["inputs"][inp["name"]] = inp.get("widget", {}).get("value", inp.get("default", ""))
                        elif isinstance(inp, list) and len(inp) >= 2:
                            all_nodes[nid]["inputs"][inp[0]] = inp[1]
                if "widgets_values" in n:
                    wv = n["widgets_values"]
                    wi = 0
                    for inp in n.get("inputs", []):
                        if isinstance(inp, dict) and "widget" in inp:
                            if wi < len(wv):
                                nm = inp.get("name", "")
                                if nm and nm not in all_nodes[nid]["inputs"]:
                                    all_nodes[nid]["inputs"][nm] = wv[wi]
                                wi += 1
        else:
            for nid, node in raw.items():
                if isinstance(node, dict) and "class_type" in node:
                    all_nodes[nid] = node
    # 节点类型映射
    LOADER_MAP = {
        "CheckpointLoaderSimple": ("checkpoint", "ckpt_name"),
        "UNETLoader": ("unet", "unet_name"),
        "CLIPLoader": ("clip", "clip_name"),
        "VAELoader": ("vae", "vae_name"),
        "DualCLIPLoader": ("dual_clip", "clip_name1"),
        "LoraLoader": ("lora", "lora_name"),
        "LoraLoaderModelOnly": ("lora", "lora_name"),
    }
    nodes_info = []
    for nid, node in all_nodes.items():
        ct = node.get("class_type", "")
        inp = node.get("inputs", {})
        for prefix, (kind, key) in LOADER_MAP.items():
            if ct.startswith(prefix):
                entry = {"id": nid, "type": ct, "kind": kind, "key": key, "default": inp.get(key, "")}
                if kind == "lora":
                    entry["strength"] = inp.get("strength_model", inp.get("strength", 1.0))
                    entry["clip_strength"] = inp.get("strength_clip", 1.0)
                nodes_info.append(entry)
                break
    return jsonify({"nodes": nodes_info})

@app.route("/api/comfyui/models")
def api_comfyui_models():
    result = {"checkpoint": [], "unet": [], "clip": [], "vae": [], "dual_clip": [], "lora": []}
    KIND_KEYS = {
        "CheckpointLoaderSimple": ("checkpoint", "ckpt_name"),
        "UNETLoader": ("unet", "unet_name"),
        "CLIPLoader": ("clip", "clip_name"),
        "VAELoader": ("vae", "vae_name"),
        "DualCLIPLoader": ("dual_clip", "clip_name1"),
    }
    try:
        req = urllib.request.Request(f"{COMFYUI_URL}/api/object_info")
        resp = urllib.request.urlopen(req, timeout=5)
        obj_info = json.loads(resp.read())
        for node_name, node_info in obj_info.items():
            for prefix, (kind, key) in KIND_KEYS.items():
                if node_name.startswith(prefix):
                    inp = node_info.get("input", {}).get("required", {})
                    if key in inp:
                        lst = inp[key][0] if isinstance(inp[key], list) and inp[key] else []
                        result[kind] = lst
                    break
        # LoRA
        for node_name, node_info in obj_info.items():
            if "LoraLoader" in node_name:
                if node_name == "LoraLoader" or node_name == "LoraLoaderModelOnly":
                    inp = node_info.get("input", {}).get("required", {})
                    if "lora_name" in inp:
                        lst = inp["lora_name"][0] if isinstance(inp["lora_name"], list) and inp["lora_name"] else []
                        result["lora"] = lst
                    break
    except Exception as e:
        result["error"] = str(e)
    return jsonify(result)

@app.route("/api/comfyui/workflow-params")
def api_comfyui_workflow_params():
    """读取工作流中可编辑的参数（采样器/步数/CFG/种子/尺寸等）"""
    fname = request.args.get("file", "")
    if not fname:
        return jsonify({"error": "缺少参数"}), 400
    raw = _load_workflow_raw(fname)
    if not raw:
        return jsonify({"error": "工作流加载失败"}), 400
    # 解析节点
    params = {
        "sampler": {},       # KSampler / SamplerCustom 等参数
        "resolution": {},    # EmptyLatentImage 尺寸
        "checkpoint": "",    # 模型名称
        "seed": 0,
        "nodes": {}          # 所有识别到的可编辑节点
    }
    if not isinstance(raw, dict):
        return jsonify(params)
    # 兼容 "nodes" 列表格式 和 节点 dict 格式
    nodes = {}
    if "nodes" in raw and isinstance(raw["nodes"], list):
        for n in raw["nodes"]:
            nid = str(n.get("id", ""))
            ct = n.get("type", n.get("class_type", ""))
            if nid and ct:
                nodes[nid] = {"class_type": ct, "inputs": {}}
                # 解析 inputs
                for inp in n.get("inputs", []):
                    if isinstance(inp, dict) and "name" in inp:
                        nodes[nid]["inputs"][inp["name"]] = inp.get("widget", {}).get("value", inp.get("default", ""))
                    elif isinstance(inp, list) and len(inp) >= 2:
                        nodes[nid]["inputs"][inp[0]] = inp[1]
    else:
        for nid, node in raw.items():
            if isinstance(node, dict) and "class_type" in node:
                nodes[nid] = node
    # 识别关键节点
    for nid, node in nodes.items():
        ct = node.get("class_type", "")
        inp = node.get("inputs", {})
        # KSampler 系列
        if ct in ("KSampler", "KSamplerAdvanced", "SamplerCustom", "BasicScheduler"):
            for key in ("seed", "steps", "cfg", "sampler_name", "scheduler", "denoise"):
                if key in inp:
                    params["sampler"][key] = inp[key]
            params["nodes"][nid] = {"class_type": ct, "params": params["sampler"]}
        # EmptyLatentImage
        elif ct in ("EmptyLatentImage", "EmptySD3LatentImage"):
            for key in ("width", "height", "batch_size"):
                if key in inp:
                    params["resolution"][key] = inp[key]
            params["nodes"][nid] = {"class_type": ct, "params": params["resolution"]}
        # Checkpoint
        elif ct == "CheckpointLoaderSimple":
            params["checkpoint"] = inp.get("ckpt_name", "")
            params["nodes"][nid] = {"class_type": ct, "checkpoint": params["checkpoint"]}
        # CLIPTextEncode
        elif ct == "CLIPTextEncode":
            txt = inp.get("text", "")
            if isinstance(txt, str):
                params["nodes"][nid] = {"class_type": ct, "text_preview": txt[:100]}
    # 种子取第一个 sampler 的
    if params["sampler"].get("seed") is not None:
        params["seed"] = params["sampler"]["seed"]
    return jsonify(params)

@app.route("/api/comfyui/generate", methods=["POST"])
def api_comfyui_generate():
    import traceback, uuid
    try:
        data = request.get_json()
        prompt_text = data.get("prompt", "")
        workflow_file = data.get("workflow", "")
        override_w = data.get("width")
        override_h = data.get("height")
        model_overrides = data.get("overrides", {})
        wf_settings = data.get("wf_settings", {})  # 工作流参数设置
        clip_mapping = data.get("clip_mapping", {})  # {"pos": "2", "neg": "11"}
        neg_template = data.get("neg_template", "")  # 负面提示词预设
        if neg_template:
            print(f"[负面预设] 收到负面提示词预设: {neg_template[:80]}...")
        load_image = data.get("load_image")  # {"node_id": "5", "filename": "xxx.png"}
        rand_seed = data.get("rand_seed", True)
        if not prompt_text or not workflow_file:
            return jsonify({"error": "参数不完整"}), 400
        
        # 加载节点定义（从 ComfyUI object_info）
        node_defs = {}
        try:
            req = urllib.request.Request(f"{COMFYUI_URL}/api/object_info")
            resp = urllib.request.urlopen(req, timeout=5)
            node_defs = json.loads(resp.read())
        except:
            print("无法获取 ComfyUI 节点定义，使用备用映射")
        
        # 加载工作流（本地文件）
        raw = _load_workflow_raw(workflow_file)
        if not raw:
            return jsonify({"error": f"工作流文件不存在: {workflow_file}"}), 404
        
        # 转换
        prompt = None
        if isinstance(raw, dict):
            if "nodes" in raw and isinstance(raw["nodes"], list):
                # 构建连接映射
                link_map = {}
                for link in raw.get("links", []):
                    if isinstance(link, list) and len(link) >= 3:
                        link_map[link[0]] = (link[1], link[2])
                prompt = {}
                for n in raw["nodes"]:
                    nid = str(n.get("id", ""))
                    if not nid: continue
                    ctype = n.get("type", "")
                    if ctype in ("Note", "Reroute", "NodeNote", "Comment", "StickyNote", "group", "PrimitiveNode"):
                        continue
                    inputs = {}
                    # 解析连接（inputs 中 link 不为 null 的）
                    for inp in n.get("inputs", []):
                        if isinstance(inp, dict):
                            name = inp.get("name", "")
                            link_id = inp.get("link")
                            if link_id is not None and link_id in link_map:
                                src = link_map[link_id]
                                inputs[name] = [str(src[0]), src[1]]
                        elif isinstance(inp, list) and len(inp) >= 2:
                            name, val = inp[0], inp[1]
                            if isinstance(val, list) and len(val) >= 2:
                                inputs[name] = [str(val[0]), val[1]]
                            elif isinstance(val, int) and val in link_map:
                                src = link_map[val]
                                inputs[name] = [str(src[0]), src[1]]
                            elif isinstance(val, (str, int, float, bool)):
                                inputs[name] = val
                    # 用 inputs 数组顺序映射 widgets_values（最可靠）
                    widgets = n.get("widgets_values", [])
                    wi = 0
                    for inp in n.get("inputs", []):
                        if isinstance(inp, dict) and "widget" in inp:
                            if wi < len(widgets):
                                inp_name = inp.get("name", "")
                                if inp.get("link") is None and inp_name and inp_name not in inputs:
                                    inputs[inp_name] = widgets[wi]
                                wi += 1
                    # 补充：用 object_info 映射剩余 widget 值（不在 inputs 里的）
                    CONNECT_TYPES = {"MODEL","CLIP","VAE","CONDITIONING","LATENT","IMAGE","MASK"}
                    nd = node_defs.get(ctype, {})
                    required = nd.get("input", {}).get("required", {})
                    for rname, rconf in required.items():
                        if rname in inputs: continue
                        input_type = rconf[0] if isinstance(rconf, list) and rconf else ""
                        if isinstance(input_type, list): input_type = "COMBO"
                        if input_type not in CONNECT_TYPES and wi < len(widgets):
                            inputs[rname] = widgets[wi]
                            wi += 1
                    # 备用：如果没从 object_info 拿到，按 inputs 中的 widget 标记匹配
                    if not required:
                        # 通过 inputs 中 widget 标记映射
                        wi = 0
                        for inp in n.get("inputs", []):
                            if isinstance(inp, dict) and "widget" in inp:
                                if wi < len(widgets):
                                    inp_name = inp.get("name", "")
                                    if inp.get("link") is None and inp_name and inp_name not in inputs:
                                        inputs[inp_name] = widgets[wi]
                                    wi += 1
                    prompt[nid] = {"class_type": ctype, "inputs": inputs}
            elif "prompt" in raw and isinstance(raw["prompt"], dict):
                prompt = raw["prompt"]
            else:
                prompt = raw
        
        if not prompt:
            return jsonify({"error": "无法识别工作流格式"}), 400
        
        # 清理 _meta 字段，分离正/负面提示词
        # 先拆分提示词的正负部分
        if "\n--neg " in prompt_text:
            pos_part, neg_part = prompt_text.split("\n--neg ", 1)
        elif "--neg " in prompt_text:
            pos_part, neg_part = prompt_text.split("--neg ", 1)
        else:
            pos_part, neg_part = prompt_text, ""
        # 收集所有 CLIPTextEncode 节点
        clip_nodes = []
        for node_id, node in list(prompt.items()):
            if isinstance(node, dict):
                _meta = node.pop("_meta", {})
                _saved_title = (_meta or {}).get("title", "") if isinstance(_meta, dict) else ""
                _saved_title = _saved_title or node.pop("title", "") or ""
                if node.get("class_type") == "CLIPTextEncode" and "inputs" in node:
                    cur_text = node.get("inputs", {}).get("text", "")
                    title_low = (_saved_title or "").lower()
                    is_str = isinstance(cur_text, str)
                    # 标记：标题含neg 或 原始文本含neg标记
                    likely_neg = "neg" in title_low or ("neg" in (cur_text.lower()[:60] if is_str else ""))
                    clip_nodes.append((node_id, node, is_str, likely_neg))
        # 给所有 CLIP 节点注入文本（有 clip_mapping 时用映射，否则自动分配）
        if clip_mapping and clip_mapping.get("pos") and clip_mapping.get("neg"):
            # 用户指定了正负节点
            for nid, node, _is_str, _lik_neg in clip_nodes:
                if str(nid) == str(clip_mapping["pos"]):
                    node["inputs"]["text"] = pos_part
                    print(f"注入正向提示词到节点 {nid} (用户指定)")
                elif str(nid) == str(clip_mapping["neg"]):
                    full_neg = neg_part or "worst quality, low quality, blurry"
                    if neg_template: full_neg = full_neg + ", " + neg_template if full_neg else neg_template
                    node["inputs"]["text"] = full_neg
                    print(f"注入负面提示词到节点 {nid} (用户指定)")
        elif len(clip_nodes) >= 2:
            # 多CLIP：第一个=正向，最后一个=负面，中间跳过
            for idx, (nid, node, is_str, likely_neg) in enumerate(clip_nodes):
                if idx == 0:
                    node["inputs"]["text"] = pos_part
                    print(f"注入正向提示词到节点 {nid} (第1个CLIP)")
                elif idx == len(clip_nodes) - 1:
                    full_neg = neg_part or "worst quality, low quality, blurry"
                    if neg_template: full_neg = full_neg + ", " + neg_template if full_neg else neg_template
                    node["inputs"]["text"] = full_neg
                    print(f"注入负面提示词到节点 {nid} (最后1个CLIP) {'(默认负面)' if not neg_part else ''}")
                else:
                    # 中间的 CLIP 节点，保持不动
                    pass
        elif len(clip_nodes) == 1:
            # 只有1个CLIP = 正向
            nid, node, is_str, _ = clip_nodes[0]
            node["inputs"]["text"] = pos_part
            print(f"注入正向提示词到节点 {nid} (唯一CLIP)")
        # 第二轮：处理非CLIP节点的参数覆盖
        for node_id, node in list(prompt.items()):
            if not isinstance(node, dict):
                continue
            ct = node.get("class_type", "")
            # 跳过 CLIPTextEncode（已在上面处理）
            if ct == "CLIPTextEncode":
                continue
            # 覆盖宽高（用户输入优先于工作流预设）
            if override_w is not None and override_h is not None:
                inp = node.get("inputs", {})
                if "width" in inp and "height" in inp:
                    inp["width"] = override_w
                    inp["height"] = override_h
                    # 防止wf_settings再覆盖
                    wf_settings.pop("width", None)
                    wf_settings.pop("height", None)
                    print(f"覆盖宽高: {override_w}x{override_h}")
            # 覆盖模型/LoRA
            if model_overrides and ct in model_overrides:
                for k, v in model_overrides[ct].items():
                    if k in node.get("inputs", {}):
                        node["inputs"][k] = v
                        print(f"覆盖 {ct}.{k} = {v}")
            # 注入加载的图片
            if load_image and load_image.get("node_id") and load_image.get("filename"):
                if str(load_image["node_id"]) == str(node_id):
                    if ct in ("LoadImage", "Load Image"):
                        node["inputs"]["image"] = load_image["filename"]
                        print(f"注入加载图片: {load_image['filename']} -> 节点 {node_id}")
            # 应用工作流参数设置
            if wf_settings:
                if ct == "CheckpointLoaderSimple" and "ckpt_name" in wf_settings:
                    node["inputs"]["ckpt_name"] = wf_settings["ckpt_name"]
                    print(f"工作流设置: ckpt={wf_settings['ckpt_name']}")
                if ct in ("EmptyLatentImage", "EmptySD3LatentImage"):
                    if "width" in wf_settings and "width" in node.get("inputs", {}):
                        node["inputs"]["width"] = wf_settings["width"]
                    if "height" in wf_settings and "height" in node.get("inputs", {}):
                        node["inputs"]["height"] = wf_settings["height"]
                if ct in ("KSampler", "KSamplerAdvanced", "SamplerCustom", "BasicScheduler"):
                    for key in ("steps", "cfg", "sampler_name", "scheduler", "denoise"):
                        if key in wf_settings and key in node.get("inputs", {}):
                            node["inputs"][key] = wf_settings[key]
                            print(f"工作流设置: {ct}.{key}={wf_settings[key]}")
            # 随机化种子
            if rand_seed and "seed" in node.get("inputs", {}) and node["inputs"]["seed"] is not None:
                node["inputs"]["seed"] = random.randint(0, 2**63 - 1)
                print(f"随机化种子节点 {node_id}")
        
        # 发送
        client_id = str(uuid.uuid4())
        payload = json.dumps({"prompt": prompt, "client_id": client_id}).encode("utf-8")
        req = urllib.request.Request(f"{COMFYUI_URL}/prompt", data=payload, headers={"Content-Type": "application/json"})
        resp = urllib.request.urlopen(req, timeout=60)
        result = json.loads(resp.read())
        prompt_id = result.get("prompt_id", "")
        return jsonify({"ok": True, "prompt_id": prompt_id, "comfyui_url": COMFYUI_URL})
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors='replace') if hasattr(e, 'read') else str(e)
        print("ComfyUI请求失败:", e.code, body[:500])
        return jsonify({"error": f"ComfyUI({e.code}): {body[:200]}"}), 500
    except IndexError as e:
        tb = traceback.format_exc()
        print("IndexError (可能是工作流格式问题):", tb)
        return jsonify({"error": f"工作流解析失败: {str(e)[:200]}"}), 500
    except Exception as e:
        tb = traceback.format_exc()
        print("生成出错:", tb)
        return jsonify({"error": f"{type(e).__name__}: {str(e)[:200]}"}), 500

@app.route("/api/comfyui/result/<prompt_id>")
def api_comfyui_result(prompt_id):
    """轮询 ComfyUI 历史记录，获取生成结果"""
    try:
        req = urllib.request.Request(f"{COMFYUI_URL}/api/history/{prompt_id}")
        resp = urllib.request.urlopen(req, timeout=10)
        history = json.loads(resp.read())
        if not history or prompt_id not in history:
            return jsonify({"status": "pending"})
        entry = history[prompt_id]
        outputs = entry.get("outputs", {})
        images = []
        for node_id, node_output in outputs.items():
            for key, value in node_output.items():
                if isinstance(value, list):
                    for item in value:
                        try:
                            if isinstance(item, dict) and "filename" in item:
                                fn = item.get("filename") or ""
                                sf = item.get("subfolder", "") or ""
                                tp = item.get("type", "output") or "output"
                                images.append({
                                    "filename": fn,
                                    "subfolder": sf,
                                    "type": tp,
                                    "url": f"/api/comfyui/proxy-image?filename={urllib.parse.quote(fn)}&subfolder={urllib.parse.quote(sf)}&type={urllib.parse.quote(tp)}"
                                })
                        except Exception as img_err:
                            print(f"解析图片出错: {img_err}, item={item}")
        return jsonify({"status": "completed", "images": images, "prompt": entry.get("prompt", {})})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)})

@app.route("/api/comfyui/proxy-image")
def api_comfyui_proxy_image():
    """代理ComfyUI图片，手机端可通过Flask服务器访问"""
    from flask import Response
    fn = request.args.get("filename", "")
    sf = request.args.get("subfolder", "")
    tp = request.args.get("type", "output")
    url = f"{COMFYUI_URL}/api/view?filename={urllib.parse.quote(fn)}&subfolder={urllib.parse.quote(sf)}&type={urllib.parse.quote(tp)}"
    try:
        req = urllib.request.Request(url)
        resp = urllib.request.urlopen(req, timeout=30)
        content_type = resp.headers.get("Content-Type", "image/png")
        return Response(resp.read(), content_type=content_type)
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route("/api/comfyui/image-meta")
def api_comfyui_image_meta():
    """读取 ComfyUI 生成图片的 PNG 元数据（生成参数）"""
    fn = request.args.get("filename", "")
    sf = request.args.get("subfolder", "")
    tp = request.args.get("type", "output")
    url = f"{COMFYUI_URL}/api/view?filename={urllib.parse.quote(fn)}&subfolder={urllib.parse.quote(sf)}&type={urllib.parse.quote(tp)}"
    try:
        req = urllib.request.Request(url)
        resp = urllib.request.urlopen(req, timeout=15)
        data = resp.read()
        meta = ""
        # 尝试读取 PNG tEXt chunk
        import struct
        if data[:8] == b'\x89PNG\r\n\x1a\n':
            pos = 8
            while pos < len(data):
                length = struct.unpack('>I', data[pos:pos+4])[0]
                pos += 4
                chunk_type = data[pos:pos+4].decode('ascii', errors='ignore')
                pos += 4
                if chunk_type == 'tEXt':
                    raw = data[pos:pos+length]
                    null = raw.find(b'\x00')
                    if null > 0:
                        key = raw[:null].decode('ascii', errors='ignore')
                        val = raw[null+1:].decode('utf-8', errors='ignore')
                        if key in ('parameters', 'prompt', 'workflow'):
                            meta = val
                            break
                pos += length + 4  # skip crc
        return jsonify({"ok": True, "meta": meta})
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route("/api/comfyui/loadimage-nodes")
def api_comfyui_loadimage_nodes():
    """获取工作流中所有 LoadImage 节点"""
    fname = request.args.get("file", "")
    if not fname: return jsonify({"nodes": []})
    raw = _load_workflow_raw(fname)
    if not raw: return jsonify({"nodes": []})
    nodes = []
    items = raw.get("nodes", []) if isinstance(raw, dict) else raw
    if not items and isinstance(raw, dict):
        # API格式的工作流用 class_type 和 id
        for nid, n in raw.items():
            if isinstance(n, dict):
                ct = n.get("class_type", n.get("type", ""))
                if ct in ("LoadImage", "Load Image"):
                    title = n.get("_meta", {}).get("title", "") if isinstance(n.get("_meta"), dict) else ""
                    nodes.append({"id": nid, "title": title, "type": ct})
    else:
        for n in items:
            if isinstance(n, dict):
                ct = n.get("class_type", n.get("type", ""))
                if ct in ("LoadImage", "Load Image"):
                    title = n.get("title", "") or (n.get("_meta", {}).get("title", "") if isinstance(n.get("_meta"), dict) else "")
                    nodes.append({"id": n.get("id"), "title": title, "type": ct})
    return jsonify({"nodes": nodes})

@app.route("/api/comfyui/upload-image", methods=["POST"])
def api_comfyui_upload_image():
    """上传图片到 ComfyUI input 文件夹"""
    if 'file' not in request.files:
        return jsonify({"error": "未选择文件"}), 400
    file = request.files['file']
    if not file.filename:
        return jsonify({"error": "文件名为空"}), 400
    filename = file.filename
    # 通过 ComfyUI 的上传 API
    import io
    img_bytes = io.BytesIO()
    file.save(img_bytes)
    img_bytes.seek(0)
    boundary = '----ComfyUIUploadBoundary'
    body = f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="{filename}"\r\nContent-Type: image/png\r\n\r\n'.encode()
    body += img_bytes.read()
    body += f'\r\n--{boundary}--\r\n'.encode()
    try:
        req = urllib.request.Request(f"{COMFYUI_URL}/api/upload/image",
            data=body,
            headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read())
        return jsonify({"ok": True, "filename": filename, "comfyui_result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route("/api/custom-tags/delete-category", methods=["POST"])
def api_custom_tags_delete_category():
    data = request.get_json()
    name = data.get("name","").strip()
    if not name: return jsonify({"error": "名称不能为空"}), 400
    deleted = False
    # 1. 从 custom_tags.json 中删除
    custom = read_json(CUSTOM_DIR / "custom_tags.json", {"categories": []})
    for c in custom["categories"]:
        if c["name"] == name:
            deleted = True
            break
    custom["categories"] = [c for c in custom["categories"] if c["name"] != name]
    write_json(CUSTOM_DIR / "custom_tags.json", custom)
    # 2. 从 tags.json 中删除
    tags = read_json(DATA_DIR / "tags.json", {"categories": [], "presets": []})
    orig_len = len(tags.get("categories", []))
    tags["categories"] = [c for c in tags.get("categories", []) if c["name"] != name]
    if len(tags["categories"]) < orig_len:
        deleted = True
        write_json(DATA_DIR / "tags.json", tags)
    if deleted:
        return jsonify({"ok": True})
    return jsonify({"error": "not found"}), 404

@app.route("/api/custom-tags/delete-subcategory", methods=["POST"])
def api_custom_tags_delete_subcategory():
    data = request.get_json()
    cn, sn = data.get("category",""), data.get("subcategory","").strip()
    if not cn or not sn: return jsonify({"error": "参数不完整"}), 400
    deleted = False
    # 1. 从 custom_tags.json 中删除
    custom = read_json(CUSTOM_DIR / "custom_tags.json", {"categories": []})
    for cat in custom["categories"]:
        if cat["name"] == cn:
            cat["subcategories"] = [s for s in cat["subcategories"] if s["name"] != sn]
            deleted = True
    write_json(CUSTOM_DIR / "custom_tags.json", custom)
    # 2. 从 tags.json 中删除
    tags = read_json(DATA_DIR / "tags.json", {"categories": [], "presets": []})
    for cat in tags.get("categories", []):
        if cat["name"] == cn:
            orig_len = len(cat.get("subcategories", []))
            cat["subcategories"] = [s for s in cat.get("subcategories", []) if s["name"] != sn]
            if len(cat["subcategories"]) < orig_len:
                deleted = True
            break
    # 清理空的分类
    tags["categories"] = [c for c in tags["categories"] if c.get("subcategories")]
    if deleted:
        write_json(DATA_DIR / "tags.json", tags)
    return jsonify({"ok": deleted})

@app.route("/api/custom-tags/add-subcategory", methods=["POST"])
def api_custom_tags_add_subcategory():
    data = request.get_json()
    cn, sn = data.get("category",""), data.get("subcategory","").strip()
    if not cn or not sn: return jsonify({"error": "参数不完整"}), 400
    custom = read_json(CUSTOM_DIR / "custom_tags.json", {"categories": []})
    cat = next((c for c in custom["categories"] if c["name"] == cn), None)
    if not cat: return jsonify({"error": "大类不存在"}), 404
    if any(s["name"] == sn for s in cat["subcategories"]):
        return jsonify({"error": "子类别已存在"}), 400
    cat["subcategories"].append({"name": sn, "tags": []})
    write_json(CUSTOM_DIR / "custom_tags.json", custom)
    return jsonify({"ok": True})

# ===== 版本更新 =====
import io, zipfile, shutil, tempfile

@app.route("/api/update/install", methods=["POST"])
def api_update_install():
    data = request.get_json()
    url = data.get("url", "").strip()
    if not url: return jsonify({"error": "缺少下载地址"}), 400
    try:
        # 下载 ZIP
        req = urllib.request.Request(url, headers={"User-Agent": "ComfyUI-Grimoire"})
        resp = urllib.request.urlopen(req, timeout=120)
        zip_bytes = resp.read()
        # 解压到临时目录
        tmp = tempfile.mkdtemp()
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            zf.extractall(tmp)
        # GitHub zip 包含一层目录，找到实际内容目录
        dirs = [d for d in Path(tmp).iterdir() if d.is_dir()]
        src = dirs[0] if dirs else Path(tmp)
        project_root = Path(__file__).parent
        # 备份当前文件（跳过 user_data, data 标签库）
        backup_dir = project_root / "user_data" / "_backup"
        backup_dir.mkdir(parents=True, exist_ok=True)
        errors = []
        for item in src.iterdir():
            if item.name in ("user_data", "data"):
                continue
            dst = project_root / item.name
            try:
                if item.is_dir():
                    # 备份旧目录
                    if dst.exists():
                        bak = backup_dir / item.name
                        if bak.exists():
                            shutil.rmtree(bak, ignore_errors=True)
                        try:
                            shutil.copytree(dst, bak, symlinks=False, ignore_dangling_symlinks=True)
                        except:
                            pass
                    # 替换新目录
                    if dst.exists():
                        shutil.rmtree(dst, ignore_errors=True)
                    shutil.copytree(item, dst)
                else:
                    # 备份旧文件
                    if dst.exists():
                        try:
                            shutil.copy2(dst, backup_dir / item.name)
                        except:
                            pass
                    # 替换新文件（处理文件锁）
                    try:
                        shutil.copy2(item, dst)
                    except PermissionError:
                        # Windows 文件被占用，写入临时文件提示
                        tmp_name = str(dst) + ".new"
                        shutil.copy2(item, tmp_name)
                        errors.append(f"{item.name}（被占用，已存为 .new，重启后生效）")
            except Exception as ex:
                errors.append(f"{item.name}: {ex}")
        # 清理临时目录
        shutil.rmtree(tmp, ignore_errors=True)
        if errors:
            return jsonify({"ok": True, "message": "部分文件被占用，已备份旧版到 user_data/_backup，重启后新文件生效", "warnings": errors})
        shutil.rmtree(backup_dir, ignore_errors=True)
        return jsonify({"ok": True, "message": "更新完成，请重启服务器"})
    except Exception as e:
        return jsonify({"error": f"{type(e).__name__}: {str(e)[:200]}"}), 500

@app.route("/api/llm/translate", methods=["POST"])
def api_llm_translate():
    data = request.get_json()
    prompt = data.get("prompt", "").strip()
    api_url = data.get("url", "").strip()
    model = data.get("model", "").strip()
    api_key = data.get("key", "").strip()
    if not prompt: return jsonify({"error": "提示词为空"}), 400
    if not api_url: return jsonify({"error": "请配置API地址"}), 400
    if not model: return jsonify({"error": "请填写模型名"}), 400
    url = api_url.rstrip("/") + "/chat/completions"
    sysprompt = data.get("sysprompt", "").strip() or "你是一个AI绘画提示词转换器，将标签式提示词转换成自然语言描述。"
    image_b64 = data.get("image", "").strip()
    if image_b64:
        # 多模态消息：文本 + 图片
        user_content = [
            {"type": "text", "text": prompt if prompt != "[图片]" else "请根据系统指令分析这张图片并输出结果。"},
            {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + image_b64}}
        ]
    else:
        user_content = prompt
    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": sysprompt},
            {"role": "user", "content": user_content}
        ],
        "temperature": 0.7,
        "max_tokens": 4096,
        "reasoning": {"enabled": False}
    }).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if api_key: headers["Authorization"] = "Bearer " + api_key
    try:
        req = urllib.request.Request(url, data=payload, headers=headers)
        resp = urllib.request.urlopen(req, timeout=120)
        result = json.loads(resp.read())
        msg = result["choices"][0]["message"]
        text = (msg.get("content") or "").strip()
        if not text:
            rc = msg.get("reasoning_content", "")
            if rc:
                # 尝试从推理内容中提取最终答案
                blocks = rc.split("\n\n")
                # 取最后几段非思考过程的文本
                answer = []
                for b in reversed(blocks):
                    b = b.strip()
                    if not b: continue
                    # 跳过明显的思考标记
                    skip = False
                    for kw in ["Thinking Process", "Analyze", "**", "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "Wait", "Check", "Let'", "Okay", "Count", "Total"]:
                        if b.startswith(kw):
                            skip = True; break
                    if skip: continue
                    answer.insert(0, b)
                    if len("\n\n".join(answer)) > 500: break
                text = "\n\n".join(answer).strip()
        text = text.strip()
        if not text: return jsonify({"error": "模型返回空内容，请换用非推理模型"}), 500
        return jsonify({"ok": True, "text": text})
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace") if hasattr(e, "read") else str(e)
        return jsonify({"error": f"API错误({e.code}): {body[:200]}"}), 500
    except Exception as e:
        return jsonify({"error": f"{type(e).__name__}: {str(e)[:200]}"}), 500

# === 绑定路径 & 回收站 ===
import ctypes
from ctypes import wintypes

@app.route("/api/bind/scan", methods=["POST"])
def api_bind_scan():
    d = request.get_json(force=True) or {}
    paths = d.get("paths", [])
    images, seen = [], set()
    for folder in paths:
        if not folder: continue
        p = Path(folder)
        if not p.exists(): continue
        files = []
        for ext in ('*.png','*.jpg','*.jpeg','*.webp','*.bmp'):
            files.extend(p.rglob(ext))
        for f in files:
            rel = str(f.relative_to(p))
            if rel not in seen:
                seen.add(rel)
                images.append({
                    "filename": f.name,
                    "path": str(f),
                    "url": f"/api/bind/img?p={urllib.parse.quote(str(p))}&n={urllib.parse.quote(f.name)}"
                })
    images.sort(key=lambda x: os.path.getmtime(x["path"]), reverse=True)
    return jsonify({"ok": True, "images": images})

@app.route("/api/bind/img")
def api_bind_img():
    fp = request.args.get("p", "")
    fn = request.args.get("n", "")
    if os.path.isfile(os.path.join(fp, fn)):
        return send_from_directory(fp, fn, conditional=True)
    return "not found", 404

@app.route("/api/bind/delete", methods=["POST"])
def api_bind_delete():
    d = request.get_json(force=True) or {}
    fp = d.get("path", "")
    if fp and os.path.exists(fp):
        buf = ctypes.create_unicode_buffer(os.path.abspath(fp) + "\0\0")
        class SF(ctypes.Structure):
            _fields_ = [("hwnd", wintypes.HWND),("wFunc", wintypes.UINT),("pFrom", wintypes.LPCWSTR),("pTo", wintypes.LPCWSTR),("fFlags", wintypes.WORD)]
        op = SF(); op.hwnd = None; op.wFunc = 3; op.pFrom = ctypes.cast(buf, wintypes.LPCWSTR); op.pTo = None
        op.fFlags = 0x40 | 0x4 | 0x400
        ctypes.windll.shell32.SHFileOperationW(ctypes.byref(op))
        return jsonify({"ok": True})
    return jsonify({"ok": False, "error": "文件不存在"})

if __name__ == "__main__":
    print("=" * 50)
    print("  超级无敌魔导书 - AI绘画提示词组合器")
    print("  访问 http://127.0.0.1:5802")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5802, debug=False)
    app.run(host="0.0.0.0", port=5802, debug=False)
