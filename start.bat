@echo off
cd /d "%~dp0"
echo ============================================
echo    Super Grimoire - AI Prompt Composer
echo ============================================
echo.

rem ==== 1. Find Python (5 levels) ====
set PY_CMD=

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
if "%PY_CMD%"=="" if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" set PY_CMD=%LOCALAPPDATA%\Programs\Python\Python311\python.exe
if "%PY_CMD%"=="" if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set PY_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe
if "%PY_CMD%"=="" if exist "%PROGRAMFILES%\Python311\python.exe" set PY_CMD=%PROGRAMFILES%\Python311\python.exe
if "%PY_CMD%"=="" if exist "%PROGRAMFILES%\Python312\python.exe" set PY_CMD=%PROGRAMFILES%\Python312\python.exe
if "%PY_CMD%"=="" if exist "python_portable\python.exe" set PY_CMD=python_portable\python.exe

rem If still not found, download portable Python
if "%PY_CMD%"=="" goto :download_python
goto :check_version

:download_python
echo [INFO] Python not found. Attempting to download portable Python...
echo.
set PY_DIR=python_portable
set PY_VER=3.12.9
set PY_ZIP=python-%PY_VER%-embed-amd64.zip

echo   [MIRROR 1] pypi.org (official)...
powershell -Command "try{Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/%PY_VER%/%PY_ZIP%' -OutFile '%TEMP%\%PY_ZIP%' -UseBasicParsing -TimeoutSec 40;exit 0}catch{exit 1}" >nul 2>&1
if errorlevel 1 (
    echo   [MIRROR 2] huaweicloud...
    powershell -Command "try{Invoke-WebRequest -Uri 'https://mirrors.huaweicloud.com/python/%PY_VER%/%PY_ZIP%' -OutFile '%TEMP%\%PY_ZIP%' -UseBasicParsing -TimeoutSec 40;exit 0}catch{exit 1}" >nul 2>&1
)
if errorlevel 1 (
    echo   [MIRROR 3] tsinghua...
    powershell -Command "try{Invoke-WebRequest -Uri 'https://mirrors.tuna.tsinghua.edu.cn/python-release/%PY_VER%/%PY_ZIP%' -OutFile '%TEMP%\%PY_ZIP%' -UseBasicParsing -TimeoutSec 40;exit 0}catch{exit 1}" >nul 2>&1
)
if errorlevel 1 (
    echo [ERROR] All download mirrors failed!
    echo Please manually download Python from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo   [OK] Downloaded.

echo [EXTRACT] Extracting...
if not exist "%PY_DIR%" mkdir "%PY_DIR%"
powershell -Command "Expand-Archive -Path '%TEMP%\%PY_ZIP%' -DestinationPath '%CD%\%PY_DIR%' -Force" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Extraction failed.
    pause
    exit /b 1
)
rem Enable site-packages (find any ._pth file)
for %%f in (%PY_DIR%\python*._pth) do (
    type "%%f" | findstr /v "^#" > "%%f.tmp"
    echo import site >> "%%f.tmp"
    move /y "%%f.tmp" "%%f" >nul
)
set PY_CMD=python_portable\python.exe

echo [PIP] Installing pip...
powershell -Command "try{Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile '%TEMP%\get-pip.py' -UseBasicParsing -TimeoutSec 60;exit 0}catch{exit 1}" >nul 2>&1
if not errorlevel 1 (
    "%PY_CMD%" "%TEMP%\get-pip.py" --quiet >nul 2>&1
    if not errorlevel 1 echo [OK] pip installed.
)
goto :init_pip

:check_version
for /f "tokens=*" %%v in ('%PY_CMD% "-V" 2^>^&1') do set PY_VER=%%v
echo [FOUND] %PY_VER%
"%PY_CMD%" -c "import sys; sys.exit(0 if sys.version_info >= (3,8) else 1)" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python version too old! Need 3.8+, found: %PY_VER%
    pause
    exit /b 1
)

:init_pip
rem Show Python version (skip if already shown)
if "%PY_VER%"=="" for /f "tokens=*" %%v in ('%PY_CMD% "-V" 2^>^&1') do set PY_VER=%%v
if not "%PY_VER%"=="" echo [OK] %PY_VER%

rem ==== 2. Install Flask ====
echo [CHECK] Dependencies...
%PY_CMD% -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo [INSTALL] Installing Flask...
    rem Try official mirror first
    %PY_CMD% -m pip install flask --quiet --disable-pip-version-check --default-timeout=60 --retries=3 --trusted-host pypi.org --trusted-host files.pythonhosted.org >nul 2>&1
    if errorlevel 1 (
        echo   [FALLBACK] Trying tsinghua mirror...
        %PY_CMD% -m pip install flask --quiet --disable-pip-version-check --default-timeout=60 --retries=3 --index-url https://pypi.tuna.tsinghua.edu.cn/simple/ --trusted-host pypi.tuna.tsinghua.edu.cn >nul 2>&1
    )
    if errorlevel 1 (
        echo   [FALLBACK] Trying aliyun mirror...
        %PY_CMD% -m pip install flask --quiet --disable-pip-version-check --default-timeout=60 --retries=3 --index-url https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com >nul 2>&1
    )
    if errorlevel 1 (
        echo   [FALLBACK] Trying huaweicloud mirror...
        %PY_CMD% -m pip install flask --quiet --disable-pip-version-check --default-timeout=60 --retries=3 --index-url https://repo.huaweicloud.com/repository/pypi/simple/ --trusted-host repo.huaweicloud.com >nul 2>&1
    )
    if errorlevel 1 (
        echo.
        echo [ERROR] All mirrors failed due to network issues.
        echo You can install Flask manually:
        echo   %PY_CMD% -m pip install flask --index-url https://pypi.tuna.tsinghua.edu.cn/simple/
        echo.
        pause
        exit /b 1
    )
    echo [OK] Flask installed
) else (
    echo [OK] Ready
)

rem ==== 3. Get LAN IP ====
set LAN_IP=
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do set LAN_IP=%%i
if not "%LAN_IP%"=="" set LAN_IP=%LAN_IP: =%

rem ==== 4. Start Server ====
echo.
echo Starting server...
if not "%LAN_IP%"=="" ( echo Mobile: http://%LAN_IP%:5802
) else ( echo Mobile: http://YOUR_IP:5802 )
echo.
%PY_CMD% launch.py
echo.
pause
