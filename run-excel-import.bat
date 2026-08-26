@echo off
cd /d "%~dp0\backend"
echo ========================================================
echo Running Student Allocation & Room Import for Hostel A
echo ========================================================
node scripts/import-excel-allocations.mjs "E:\hostel\Student Allocation Template.xlsx"
pause
