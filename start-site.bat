@echo off
REM Double H Consulting - one double-click to run the site
title Double H Consulting - Site Launcher
cd /d "%~dp0server"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is NOT installed.
  echo Download the LTS version from https://nodejs.org then run this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing server files (first run only)...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed. Check your internet connection.
    pause
    exit /b 1
  )
)

if not exist "..\frontend\dist\index.html" (
  echo Building the site (first run only)...
  cd /d "%~dp0frontend"
  if not exist node_modules (
    call npm install
    if errorlevel 1 (
      echo [ERROR] npm install failed. Check your internet connection.
      pause
      exit /b 1
    )
  )
  call npm run build
  if errorlevel 1 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
  )
  cd /d "%~dp0server"
)

echo.
echo Starting Double H Consulting on http://localhost:3001 ...
echo Keep this window open. Press CTRL+C to stop the site.
echo.
start "" "http://localhost:3001/#/"
call npm start
pause
