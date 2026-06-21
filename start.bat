@echo off
chcp 65001 >nul
cd /d "%~dp0"
setlocal enabledelayedexpansion
title 超级无敌魔导书

echo ============================================
echo    超级无敌魔导书 - 智能启动器
echo ============================================
echo.

set "PY_CMD="

:: ---- 第1步：检测系统 Python（需 > 3.8） ----
where python >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%v in ('python --version 2^>^&1') do set "SYS_VER=%%v"
    echo [检测] 系统 Python: !SYS_VER!

    python -c "import sys; sys.exit(0 if sys.version_info >= (3,8) else 1)" >nul 2>&1
    if !errorlevel! equ 0 (
        set "PY_CMD=python"
        echo [OK] 使用系统 Python
        goto :check_flask
    ) else (
        echo [跳过] 版本过低，需要 Python 3.8+
    )
) else (
    echo [检测] 未找到系统 Python
)

:: ---- 第2步：检测项目便携版 Python ----
if exist "python_portable\python.exe" (
    for /f "tokens=2" %%v in ('python_portable\python.exe --version 2^>^&1') do (
        echo [检测] 便携版 Python: %%v
    )
    set "PY_CMD=python_portable\python.exe"
    echo [OK] 使用便携版 Python
    goto :check_flask
)

:: ---- 第3步：自动下载便携版 Python ----
echo.
echo -------------------------------------------------
echo   首次运行，自动配置 Python 环境
echo   正在下载便携版（约 8MB，仅一次）
echo -------------------------------------------------
echo.

set "ZIP=python-3.12.9-embed-amd64.zip"
set "URL=https://www.python.org/ftp/python/3.12.9/%ZIP%"
set "PDIR=python_portable"

if not exist "%PDIR%" mkdir "%PDIR%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; ^
     Write-Host '[下载] %URL%' -ForegroundColor Cyan; ^
     try { ^
         Invoke-WebRequest -Uri '%URL%' -OutFile '%ZIP%' -ErrorAction Stop; ^
         Write-Host '[解压] 正在解压...' -ForegroundColor Cyan; ^
         Expand-Archive -Path '%ZIP%' -DestinationPath '%PDIR%' -Force; ^
         Remove-Item '%ZIP%'; ^
         Write-Host '[完成] 解压成功' -ForegroundColor Green; ^
     } catch { ^
         Write-Host '[错误] 下载失败，请检查网络连接' -ForegroundColor Red; ^
         Write-Host '手动安装: https://www.python.org/downloads/' -ForegroundColor Yellow; ^
         exit 1; ^
     }"

if not exist "%PDIR%\python.exe" (
    echo.
    echo [X] 自动配置失败，请手动安装 Python 3.8+
    echo     下载地址：https://www.python.org/downloads/
    echo     安装时务必勾选 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

:: ---- 配置便携版（启用 pip + 站点包） ----
cd /d "%PDIR%"

for %%f in (python3*._pth) do set "PTH=%%f"
echo import site>>"%PTH%"
echo Lib\site-packages>>"%PTH%"

if not exist "Lib\site-packages" mkdir "Lib\site-packages"

echo [配置] 正在安装 pip（仅首次）...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; ^
     Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile 'get-pip.py'" >nul 2>&1

if exist get-pip.py (
    python.exe get-pip.py --no-warn-script-location >nul 2>&1
    del get-pip.py
    echo [OK] pip 安装完成
)

cd /d "%~dp0"
set "PY_CMD=python_portable\python.exe"

:: ---- 第4步：安装项目依赖 ----
:check_flask
echo [检查] 项目依赖...
%PY_CMD% -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo [安装] 正在安装 Flask（仅首次）...
    %PY_CMD% -m pip install flask --quiet --disable-pip-version-check
    if errorlevel 1 (
        echo [X] 依赖安装失败，请检查网络连接
        echo.
        pause
        exit /b 1
    )
    echo [OK] Flask 安装完成
) else (
    echo [OK] 依赖已就绪
)

:: ---- 第5步：启动服务器 ----
echo.
echo -------------------------------------------------
echo   启动服务器...
echo   浏览器将自动打开
echo   手机访问 http://你的IP:5802
echo -------------------------------------------------
echo.
%PY_CMD% launch.py
echo.
echo 服务器已停止，按任意键关闭窗口...
pause >nul
exit /b
