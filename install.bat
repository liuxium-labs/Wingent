@echo off
title Wingent Installer

echo Checking for Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed.
    echo Download it from https://nodejs.org and re-run this script.
    pause
    exit /b 1
)

echo Checking for Python...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed.
    echo Download it from https://python.org and re-run this script.
    pause
    exit /b 1
)

echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo npm install failed.
    pause
    exit /b 1
)

echo Building...
npm run build
if %errorlevel% neq 0 (
    echo Build failed.
    pause
    exit /b 1
)

echo.
echo Done. Run Launch.py to start Wingent.
pause
