@echo off
REM KSU Backend Production Deployment Script for Windows
REM Usage: deploy.bat

echo 🚀 Deploying KSU Backend to Production...
echo.

REM Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo ❌ ERROR: docker-compose.yml not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Create required directories
echo 📁 Creating required directories...
if not exist "backups" mkdir backups
if not exist "logs" mkdir logs
echo ✅ Directories created

REM Pull latest code
echo 📥 Pulling latest code from repository...
git pull origin main
if errorlevel 1 (
    git pull origin master
    if errorlevel 1 (
        echo ❌ ERROR: Failed to pull latest code
        pause
        exit /b 1
    )
)
echo ✅ Code updated successfully

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker compose down
echo ✅ Containers stopped

REM Build and start containers
echo 🔨 Building and starting containers...
docker compose up --build -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak > nul

REM Check application status
echo 🔍 Checking application status...
curl -f http://localhost:3000/api/health > nul 2>&1
if errorlevel 1 (
    echo ⚠️ Application might still be starting up or there's an issue.
    echo 📋 Checking container logs...
    docker compose logs --tail=20 app
) else (
    echo ✅ Application is running successfully!
    echo 🌐 Application URL: http://localhost:3000
)

REM Show container status
echo.
echo 📊 Container Status:
docker compose ps

REM Show useful commands
echo.
echo 📋 Useful Commands:
echo   View logs:           docker compose logs -f app
echo   Check health:        curl http://localhost:3000/api/health
echo   Container shell:     docker compose exec app bash
echo   Stop services:       docker compose down
echo.

echo 🎉 Deployment completed!
echo Your KSU Backend is now running with backup system enabled.
echo.

REM Final health check
echo 🔍 Running final health check...
timeout /t 5 /nobreak > nul
curl -f http://localhost:3000/api/health > nul 2>&1
if errorlevel 1 (
    echo ⚠️ Health check failed. Please check logs: docker compose logs app
) else (
    echo ✅ Final health check passed!
)

echo.
echo Press any key to exit...
pause > nul
