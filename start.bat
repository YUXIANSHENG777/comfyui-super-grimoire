@echo off
cd /d "%~dp0"
echo ============================================
echo    Super Grimoire - AI Prompt Composer
echo ============================================
echo.

rem ---- Find Python ----
set PY_CMD=
where python >nul 2>&1
if %errorlevel% equ 0 (
    python -c "import sys; sys.exit(0 if sys.version_info >= (3,8) else 1)" >nul 2>&1
    if %errorlevel% equ 0 (
        set PY_CMD=python
        echo [OK] System Python found
    ) else (
        echo [SKIP] System Python too old
    )
)

if "%PY_CMD%"=="" (
    if exist "python_portable\python.exe" (
        set PY_CMD=python_portable\python.exe
        echo [OK] Portable Python found
    ) else (
        echo [ERROR] Python not found!
        echo Download: https://www.python.org/downloads/
        pause
        exit /b 1
    )
)

rem ---- Check Dependencies ----
echo [CHECK] Dependencies...
%PY_CMD% -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo [INSTALL] Installing Flask...
    %PY_CMD% -m pip install flask --quiet --disable-pip-version-check
    if errorlevel 1 (
        echo [ERROR] Flask install failed
        pause
        exit /b 1
    )
    echo [OK] Flask installed
) else (
    echo [OK] Ready
)

rem ---- Start Server ----
echo.
echo Starting server...
echo Mobile: http://YOUR_IP:5802
echo.
%PY_CMD% launch.py
echo.
pause
