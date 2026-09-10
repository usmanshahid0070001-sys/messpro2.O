@echo off
cd /d "%~dp0\scripts\backup"
echo ========================================================
echo   MessPro 2.0 - Local to Cloud Database Synchronizer
echo ========================================================
echo.
echo Choose Synchronization Mode:
echo   [1] Safe Upsert Sync (Recommended - updates/adds records by _id)
echo   [2] Mirror Sync (Wipes cloud collection and replaces with local DB)
echo.
set /p choice="Enter choice (1 or 2, default: 1): "

if "%choice%"=="2" (
    echo.
    echo 🚀 Starting Exact Mirror Sync (--drop)...
    node syncLocalToCloud.js --drop
) else (
    echo.
    echo 🚀 Starting Safe Upsert Sync...
    node syncLocalToCloud.js
)

echo.
echo ========================================================
echo   Synchronization process finished.
echo ========================================================
pause
