@echo off
cd /d "%~dp0"
echo ============================================
echo    Super Grimoire - AI Prompt Composer
echo ============================================
echo.

rem ---- Find Python (with multiple fallbacks) ----
set PY_CMD=

rem 1) Try: python / python3 / py launcher
where python >nul 2>&1
if not errorlevel 1 set PY_CMD=python
if "%PY_CMD%"=="" (
    where python3 >nul 2>&1
    if not errorlevel 1 set PY_CMD=python3
)
if "%PY_CMD%"=="" (
    where py >nul 2>&1
    if not errorlevel 1 set PY_CMD=py -3
)

rem 2) Try: common install paths (compact with for loop)
if "%PY_CMD%"=="" (
    setlocal enabledelayedexpansion
    set PYPATHS=%LOCALAPPDATA%\Programs\Python\Python311\python.exe
    set PYPATHS=!PYPATHS! %LOCALAPPDATA%\Programs\Python\Python312\python.exe
    set PYPATHS=!PYPATHS! %LOCALAPPDATA%\Programs\Python\Python313\python.exe
    set PYPATHS=!PYPATHS! %LOCALAPPDATA%\Programs\Python\Python310\python.exe
    set PYPATHS=!PYPATHS! %PROGRAMFILES%\Python311\python.exe
    set PYPATHS=!PYPATHS! %PROGRAMFILES%\Python312\python.exe
    for %%p in (!PYPATHS!) do (
        if exist "%%p" (
            "%%p" -c "import sys; sys.exit(0 if sys.version_info >= (3,8) else 1)" >nul 2>&1
            if not errorlevel 1 (
                endlocal & set PY_CMD=%%p
                goto :py_found
            )
        )
    )
    endlocal
)

rem 3) Try: portable Python
if "%PY_CMD%"=="" (
    if exist "python_portable\python.exe" (
        python_portable\python.exe -c "import sys; sys.exit(0 if sys.version_info >= (3,8) else 1)" >nul 2>&1
        if not errorlevel 1 set PY_CMD=python_portable\python.exe
    )
)

:py_found
if "%PY_CMD%"=="" (
    echo [ERROR] Python not found!
    echo Python 3.8+ required.
    echo Quick fix: setx PATH "%%PATH%%;%%LOCALAPPDATA%%\Programs\Python\Python311"
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

rem Show Python version
for /f "tokens=*" %%v in ('%PY_CMD% "-V" 2^>^&1') do set PY_VER=%%v
echo [OK] %PY_VER%
set PY_VER=

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

rem ---- Get LAN IP for mobile access ----
set LAN_IP=
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do set LAN_IP=%%i
if not "%LAN_IP%"=="" set LAN_IP=%LAN_IP: =%

rem ---- Start Server ----
echo.
echo Starting server...
if not "%LAN_IP%"=="" (
    echo Mobile: http://%LAN_IP%:5802
) else (
    echo Mobile: http://YOUR_IP:5802
)
echo.
%PY_CMD% launch.py
echo.
pause
