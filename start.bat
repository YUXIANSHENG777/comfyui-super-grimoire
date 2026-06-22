@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"
echo ============================================
echo    超级无敌魔导书 - 智能启动器
echo ============================================
echo.

:: ---- 查找 Python ----
set PY_CMD=
where python >nul 2>&1
if %errorlevel% equ 0 (
    python -c "import sys; sys.exit(0 if sys.version_info >= (3,8) else 1)" >nul 2>&1
    if %errorlevel% equ 0 (
        set PY_CMD=python
        echo [OK] 使用系统 Python
    ) else (
        echo [跳过] 系统 Python 版本过低
    )
)

if "%PY_CMD%"=="" (
    if exist "python_portable\python.exe" (
        set PY_CMD=python_portable\python.exe
        echo [OK] 使用便携版 Python
    ) else (
        echo [错误] 未找到 Python！
        echo 请手动安装 Python 3.8+：https://www.python.org/downloads/
        pause
        exit /b 1
    )
)

:: ---- 检查依赖 ----
echo [检查] 项目依赖...
%PY_CMD% -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo [安装] 正在安装 Flask...
    %PY_CMD% -m pip install flask --quiet --disable-pip-version-check
    if errorlevel 1 (
        echo [错误] Flask 安装失败
        pause
        exit /b 1
    )
    echo [OK] Flask 安装完成
) else (
    echo [OK] 依赖已就绪
)

:: ---- 启动服务器 ----
echo.
echo 正在启动服务器...
echo 手机访问：http://你的IP:5802
echo.
%PY_CMD% launch.py
echo.
pause
