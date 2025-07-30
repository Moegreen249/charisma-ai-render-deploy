@echo off
echo 🚀 CharismaAI Setup - Windows
echo.
echo Starting setup script...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Run the setup script
node setup.js

pause 