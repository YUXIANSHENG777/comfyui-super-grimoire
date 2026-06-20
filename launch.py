import os, sys, time, webbrowser
os.chdir(os.path.dirname(os.path.abspath(__file__)))

try:
    import flask
except ImportError:
    print("正在安装依赖...")
    os.system(f'"{sys.executable}" -m pip install -q flask openpyxl')

print("=" * 50)
print("  超级无敌魔导书 - AI绘画提示词组合器")
print("  正在启动...")
print("=" * 50)

import subprocess, threading
def open_browser():
    time.sleep(1.5)
    webbrowser.open("http://127.0.0.1:5802")
threading.Thread(target=open_browser, daemon=True).start()

subprocess.run([sys.executable, "server.py"])