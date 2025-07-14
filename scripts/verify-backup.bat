@echo off
REM KSU Backend Backup Verification Script for Windows
echo 🔍 Verifikasi Sistem Backup KSU Backend...
echo ================================================
echo.

echo [INFO] 1. Cek Status Container
echo Container yang sedang running:
docker compose ps
echo.

echo [INFO] 2. Cek Direktori Backup di Host Windows
echo Direktori backup di host Windows:
if exist "backups" (
    echo ✓ Direktori backups ditemukan
    echo Isi direktori backup:
    dir backups
    echo.
    echo Total file backup:
    dir backups\*.sql /b 2>nul | find /c /v ""
) else (
    echo ⚠ Direktori backups tidak ditemukan di host
)
echo.

echo [INFO] 3. Cek Direktori Backup di Container
echo Memeriksa direktori backup di dalam container:
docker compose exec app ls -la /app/backups/
echo.

echo [INFO] 4. Cek Environment Variables Backup
echo Environment variables untuk backup di container:
docker compose exec app printenv | findstr BACKUP
echo.

echo [INFO] 5. Test Koneksi Database dari Container
echo Testing koneksi ke database dari container:
docker compose exec app nc -zv 192.168.99.2 3306
echo.

echo [INFO] 6. Cek MySQL Client Tools
echo Mengecek apakah mysqldump tersedia di container:
docker compose exec app which mysqldump
docker compose exec app mysqldump --version
echo.

echo [INFO] 7. Test Health Check Application
echo Testing application health endpoint:
curl -s http://localhost:3000/api/health
echo.
echo.

echo [INFO] 8. Test Manual Backup API
echo ⚠️ Untuk test backup API, Anda perlu JWT token.
echo Contoh command untuk test backup manual:
echo.
echo curl -X POST http://localhost:3000/api/backup/create ^
echo   -H "Content-Type: application/json" ^
echo   -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
echo.

echo [INFO] 9. Ringkasan Verifikasi
echo.

REM Check container status
docker compose ps | findstr "Up" >nul
if %errorlevel%==0 (
    echo ✓ Container sedang running
) else (
    echo ✗ Container tidak running
)

REM Check backup directory
if exist "backups" (
    for /f %%i in ('dir backups\*.sql /b 2^>nul ^| find /c /v ""') do set BACKUP_COUNT=%%i
    if !BACKUP_COUNT! GTR 0 (
        echo ✓ Direktori backup ditemukan dengan !BACKUP_COUNT! file backup
    ) else (
        echo ⚠ Direktori backup ada tapi belum ada file backup
    )
) else (
    echo ✗ Direktori backup tidak ditemukan
)

REM Check application health
curl -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Application health check berhasil
) else (
    echo ✗ Application health check gagal
)

echo.
echo [INFO] Untuk test backup lengkap, jalankan:
echo test-backup-complete.bat
echo.
echo [INFO] Verifikasi selesai! 🎉

pause
