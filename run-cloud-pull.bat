@echo off
cd /d "%~dp0\scripts\backup"
echo ======================================================================
echo   MessPro 2.0 - Cloud to Local Database Synchronizer (Atlas -^> Local)
echo ======================================================================
echo.
echo Choose Synchronization Mode:
echo   [1] Safe Upsert Sync (Recommended - updates/adds records into local DB by _id)
echo   [2] Mirror Sync (Wipes local collections and replaces with Atlas DB data)
echo.
set /p choice="Enter choice (1 or 2, default: 1): "

if "%choice%"=="2" (
    echo.
    echo 🚀 Starting Exact Mirror Sync (--drop)...
    node syncCloudToLocal.js --drop
) else (
    echo.
    echo 🚀 Starting Safe Upsert Sync...
    node syncCloudToLocal.js
)

echo.
echo ======================================================================
echo   Synchronization process finished.
echo ======================================================================
pause
