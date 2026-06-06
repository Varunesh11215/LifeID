@echo off
REM LifeID Quick Start Script for Windows

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           LifeID - Healthcare Identity System             ║
echo ║                   Integration Complete                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 16+ first.
    exit /b 1
)

echo ✓ Node.js: ^%:~0^%
npm --version >nul 2>&1
echo ✓ npm installed
echo.

echo Starting LifeID Services...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 📦 Installing backend dependencies...
cd backend
call npm install --silent 2>nul
if errorlevel 1 npm install

echo.
echo 🚀 Starting Backend Server on port 3001...
start cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak >nul

cd ..\frontend
echo 📦 Installing frontend dependencies...
call npm install --silent 2>nul
if errorlevel 1 npm install

echo.
echo 🚀 Starting Frontend Server on port 5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ Both servers are starting!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📱 Access Application:
echo    🌐 http://localhost:5173
echo.
echo 🔐 Test Credentials:
echo    • Admin:   admin@lifeid.gov.in / admin123
echo    • Doctor:  doctor@lifeid.gov.in / doctor123
echo    • Records: records@lifeid.gov.in / records123
echo    • Patient: patient@lifeid.gov.in / patient123
echo.
echo 📊 API Health Check:
echo    → http://localhost:3001/health
echo.
echo ℹ️  Windows terminal(s) will open for each server.
echo    Close all terminals to stop the servers.
echo.
