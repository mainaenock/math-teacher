@echo off
echo Starting Math Teacher AI Assistant...
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Development Server...
start "Frontend Dev Server" cmd /k "cd frontend\math-teacher && npm run dev"
echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
pause