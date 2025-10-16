@echo off
echo.
echo ========================================
echo   SmartRide+ Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm is installed
npm --version
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo [WARN] .env.local not found
    echo Creating from template...
    copy .env.local.example .env.local >nul
    echo.
    echo [ACTION REQUIRED] Please edit .env.local with your API keys:
    echo   1. Get Mapbox token from: https://account.mapbox.com/
    echo   2. Get Firebase config from: https://console.firebase.google.com/
    echo   3. Get Google Places key from: https://console.cloud.google.com/
    echo.
    echo Press any key to open .env.local in notepad...
    pause >nul
    notepad .env.local
    echo.
)

echo [STEP 1/3] Installing dependencies...
echo This may take a few minutes...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo [STEP 2/3] Checking environment variables...
findstr /C:"pk.ey" .env.local >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Mapbox token not configured in .env.local
    echo The app will work with mock data, but map features will be limited.
    echo.
)

echo [STEP 3/3] Starting development server...
echo.
echo ========================================
echo   SmartRide+ is starting...
echo   Open your browser to: http://localhost:3000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
