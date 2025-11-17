@echo off
echo ========================================
echo Starting QuizMobileApp Backend Server
echo ========================================
echo.

cd /d "C:\Users\vidoj\.vscode\QuizBanner\QuizMobileApp\backend"
echo Current directory: %CD%
echo.
echo Installing dependencies...
npm install
echo.
echo Starting server on port 5001...
node server.js
pause