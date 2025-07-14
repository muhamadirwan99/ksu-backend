#!/bin/bash
# Monitoring script untuk melihat logs

echo "===================================="
echo "     KSU Backend Log Monitoring"
echo "===================================="
echo

show_menu() {
    echo "Pilih opsi monitoring:"
    echo "[1] Lihat log aplikasi terbaru (real-time)"
    echo "[2] Lihat error logs"
    echo "[3] Lihat Docker container logs"
    echo "[4] Lihat statistik log files"
    echo "[5] Cleanup old logs"
    echo "[6] Search logs"
    echo "[7] Exit"
    echo
}

app_logs() {
    echo
    echo "=== Application Logs (Real-time) ==="
    if ls logs/application-*.log 1> /dev/null 2>&1; then
        tail -f logs/application-$(date +%Y-%m-%d).log 2>/dev/null || tail -f logs/application-*.log | head -50
    else
        echo "Tidak ada log files ditemukan."
    fi
}

error_logs() {
    echo
    echo "=== Error Logs ==="
    if ls logs/error-*.log 1> /dev/null 2>&1; then
        tail -50 logs/error-*.log
    else
        echo "Tidak ada error logs ditemukan."
    fi
    read -p "Press Enter to continue..."
}

docker_logs() {
    echo
    echo "=== Docker Container Logs ==="
    if docker ps | grep -q ksu-backend; then
        docker logs ksu-backend --tail 50 -f
    else
        echo "Container ksu-backend tidak berjalan."
        read -p "Press Enter to continue..."
    fi
}

log_stats() {
    echo
    echo "=== Log Files Statistics ==="
    echo "Total log files: $(ls logs/*.log 2>/dev/null | wc -l)"
    echo "Disk usage: $(du -sh logs/ 2>/dev/null | cut -f1 || echo "0B")"
    echo
    echo "Recent files:"
    ls -lt logs/*.log 2>/dev/null | head -5 || echo "No log files found"
    echo
    read -p "Press Enter to continue..."
}

search_logs() {
    echo
    read -p "Masukkan kata kunci untuk dicari: " keyword
    if [ -n "$keyword" ]; then
        echo "=== Search Results for '$keyword' ==="
        grep -n "$keyword" logs/*.log 2>/dev/null | tail -20 || echo "Tidak ditemukan."
    fi
    read -p "Press Enter to continue..."
}

cleanup_logs() {
    echo
    echo "=== Cleanup Old Logs ==="
    read -p "Hapus log files lebih dari berapa hari? (default: 30): " days
    days=${days:-30}
    
    echo "Menghapus log files lebih dari $days hari..."
    find logs/ -name "*.log" -type f -mtime +$days -delete 2>/dev/null
    echo "Cleanup selesai."
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    read -p "Masukkan pilihan (1-7): " choice
    
    case $choice in
        1) app_logs ;;
        2) error_logs ;;
        3) docker_logs ;;
        4) log_stats ;;
        5) cleanup_logs ;;
        6) search_logs ;;
        7) echo "Monitoring selesai."; exit 0 ;;
        *) echo "Pilihan tidak valid!" ;;
    esac
    
    if [ "$choice" != "1" ] && [ "$choice" != "3" ]; then
        echo
    fi
done
