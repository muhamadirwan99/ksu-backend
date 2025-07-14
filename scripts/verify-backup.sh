#!/bin/bash

# KSU Backend Backup Verification Script
echo "🔍 Verifikasi Sistem Backup KSU Backend..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo ""
print_header "1. Cek Status Container"
echo "Container yang sedang running:"
docker compose ps
echo ""

print_header "2. Cek Volume Mount (Path Backup)"
echo "Memeriksa volume mount antara container dan host..."
docker inspect ksu-backend | grep -A 10 "Mounts"
echo ""

print_header "3. Cek Direktori Backup di Host (Windows)"
echo "Direktori backup di host Windows:"
if [ -d "./backups" ]; then
    print_status "Direktori ./backups ditemukan"
    echo "Isi direktori backup:"
    ls -la ./backups/
    echo ""
    echo "Total file backup:"
    ls -1 ./backups/*.sql 2>/dev/null | wc -l
else
    print_warning "Direktori ./backups tidak ditemukan di host"
fi
echo ""

print_header "4. Cek Direktori Backup di Container"
echo "Memeriksa direktori backup di dalam container:"
docker compose exec app ls -la /app/backups/
echo ""

print_header "5. Cek Environment Variables Backup"
echo "Environment variables untuk backup di container:"
docker compose exec app printenv | grep BACKUP
echo ""

print_header "6. Test Koneksi Database dari Container"
echo "Testing koneksi ke database dari container:"
docker compose exec app nc -zv 192.168.99.2 3306
echo ""

print_header "7. Cek Apakah MySQL Client Tools Tersedia"
echo "Mengecek apakah mysqldump tersedia di container:"
docker compose exec app which mysqldump
docker compose exec app mysqldump --version
echo ""

print_header "8. Test Health Check Application"
echo "Testing application health endpoint:"
curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health
echo ""
echo ""

print_header "9. Test Backup API (Manual)"
echo "⚠️  Untuk test backup API, Anda perlu JWT token."
echo "Contoh command untuk test backup manual:"
echo ""
echo "curl -X POST http://localhost:3000/api/backup/create \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN_HERE'"
echo ""

print_header "10. Ringkasan Verifikasi"
echo ""

# Check container status
if docker compose ps | grep -q "Up"; then
    print_status "Container sedang running"
else
    print_error "Container tidak running"
fi

# Check backup directory
if [ -d "./backups" ]; then
    BACKUP_COUNT=$(ls -1 ./backups/*.sql 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        print_status "Direktori backup ditemukan dengan $BACKUP_COUNT file backup"
    else
        print_warning "Direktori backup ada tapi belum ada file backup"
    fi
else
    print_error "Direktori backup tidak ditemukan"
fi

# Check if mysqldump is available
if docker compose exec app which mysqldump >/dev/null 2>&1; then
    print_status "MySQL client tools tersedia di container"
else
    print_error "MySQL client tools tidak tersedia di container"
fi

# Check application health
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    print_status "Application health check berhasil"
else
    print_error "Application health check gagal"
fi

echo ""
print_header "Untuk test backup lengkap, jalankan:"
echo "bash scripts/test-backup-complete.sh"
echo ""
print_header "Verifikasi selesai! 🎉"
