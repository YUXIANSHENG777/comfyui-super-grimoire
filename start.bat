@echo off
cd /d "%~dp0"
echo ============================================
echo    Super Magic Book - Smart Launcher
echo ============================================
echo.

:: ---- Find Python ----
set PY_CMD=
where python >nul 2>&1
if %errorlevel% equ 0 (
    python -c "import sys; sys.exit(0 if sys.version_info >= (3,8) else 1)" >nul 2>&1
    if %errorlevel% equ 0 (
        set PY_CMD=python
        echo [OK] Using system Python
    ) else (
        echo [Skip] System Python too old
    )
)

if "%PY_CMD%"=="" (
    if exist "python_portable\python.exe" (
        set PY_CMD=python_portable\python.exe
        echo [OK] Using portable Python
    ) else (
        echo [Error] No Python found!
        echo Please install Python 3.8+ from https://www.python.org/downloads/
        pause
        exit /b 1
    )
)

:: ---- Check flask ----
echo [Check] Dependencies...
%PY_CMD% -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo [Install] Installing Flask...
    %PY_CMD% -m pip install flask --quiet --disable-pip-version-check
    if errorlevel 1 (
        echo [Error] Flask install failed
        pause
        exit /b 1
    )
    echo [OK] Flask installed
) else (
    echo [OK] Dependencies ready
)

:: ---- Start server ----
echo.
echo Starting server...
echo Mobile access: http://YOUR_IP:5802
echo.
%PY_CMD% launch.py
echo.
pause
