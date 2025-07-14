@echo off
REM Monitoring script untuk melihat logs di Windows

echo ====================================
echo     KSU Backend Log Monitoring
echo ====================================
echo.

:menu
echo Pilih opsi monitoring:
echo [1] Lihat log aplikasi terbaru (real-time)
echo [2] Lihat error logs
echo [3] Lihat Docker container logs
echo [4] Lihat statistik log files
echo [5] Cleanup old logs
echo [6] Exit
echo.
set /p choice="Masukkan pilihan (1-6): "

if "%choice%"=="1" goto app_logs
if "%choice%"=="2" goto error_logs  
if "%choice%"=="3" goto docker_logs
if "%choice%"=="4" goto log_stats
if "%choice%"=="5" goto cleanup
if "%choice%"=="6" goto exit

echo Pilihan tidak valid!
goto menu

:app_logs
echo.
echo === Application Logs (Real-time) ===
powershell -Command "Get-Content logs\application-*.log -Wait -Tail 20"
goto menu

:error_logs
echo.
echo === Error Logs ===
if exist logs\error-*.log (
    powershell -Command "Get-Content logs\error-*.log | Select-Object -Last 20"
) else (
    echo Tidak ada error logs ditemukan.
)
pause
goto menu

:docker_logs
echo.
echo === Docker Container Logs ===
docker logs ksu-backend --tail 50 -f
goto menu

:log_stats
echo.
echo === Log Files Statistics ===
echo Total log files:
dir logs\*.log /b | find /c ".log"
echo.
echo Disk usage:
powershell -Command "Get-ChildItem logs\*.log | Measure-Object -Property Length -Sum | Select-Object @{Name='TotalSizeMB';Expression={[math]::Round($_.Sum/1MB,2)}}"
echo.
echo Recent files:
dir logs\*.log /od | tail -5
pause
goto menu

:cleanup
echo.
echo === Cleanup Old Logs ===
echo Menghapus log files lebih dari 30 hari...
forfiles /p logs /s /m *.log /d -30 /c "cmd /c del @path" 2>nul
echo Cleanup selesai.
pause
goto menu

:exit
echo.
echo Monitoring selesai.
pause
