@echo off
title Double H Consulting - Server
cd /d "%~dp0server"

if not exist "node_modules" (
  echo Installing server dependencies, please wait...
  call npm.cmd install
)

if not exist "..\frontend\dist" (
  echo Building website for the first time, please wait...
  cd /d "%~dp0frontend"
  if not exist "node_modules" call npm.cmd install
  call npm.cmd run build
  cd /d "%~dp0server"
)

echo.
echo   Double H Consulting is starting...
echo.
echo   Website :  http://localhost:3001
echo   Admin    :  http://localhost:3001/admin
echo.
echo   Keep this window open while using the site.
echo   To STOP the site: close this window (or press Ctrl+C).
echo.

node --disable-warning=ExperimentalWarning index.js

echo.
echo Server stopped. Press any key to close.
pause >nul
