#!/bin/bash

# KSU Backend Complete Backup Test Script
echo "🧪 Test Lengkap Sistem Backup KSU Backend..."
echo "=============================================="

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
    echo -e "${BLUE}[TEST]${NC} $1"
}

# JWT Token (you need to replace this with a valid token)
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

if [ "$JWT_TOKEN" = "YOUR_JWT_TOKEN_HERE" ]; then
    print_warning "⚠️  JWT_TOKEN belum diset!"
    echo "Untuk mendapatkan JWT token, Anda bisa:"
    echo "1. Login ke aplikasi dan copy token dari response"
    echo "2. Atau gunakan token dari development/testing"
    echo ""
    echo "Edit file ini dan ganti YOUR_JWT_TOKEN_HERE dengan token yang valid"
    echo ""
    print_header "Melanjutkan test tanpa JWT token..."
    JWT_TOKEN=""
fi

echo ""
print_header "1. Test Backup Info API"
if [ -n "$JWT_TOKEN" ]; then
    curl -s -X GET http://localhost:3000/api/backup/info \
        -H "Authorization: Bearer $JWT_TOKEN" | jq . 2>/dev/null || \
    curl -s -X GET http://localhost:3000/api/backup/info \
        -H "Authorization: Bearer $JWT_TOKEN"
else
    print_warning "Skipping (No JWT token)"
fi
echo ""
echo ""

print_header "2. Test Backup List API"
if [ -n "$JWT_TOKEN" ]; then
    curl -s -X GET http://localhost:3000/api/backup/list \
        -H "Authorization: Bearer $JWT_TOKEN" | jq . 2>/dev/null || \
    curl -s -X GET http://localhost:3000/api/backup/list \
        -H "Authorization: Bearer $JWT_TOKEN"
else
    print_warning "Skipping (No JWT token)"
fi
echo ""
echo ""

print_header "3. Test Manual Backup Creation"
if [ -n "$JWT_TOKEN" ]; then
    echo "Creating backup..."
    BACKUP_BEFORE=$(ls -1 ./backups/*.sql 2>/dev/null | wc -l)
    
    curl -s -X POST http://localhost:3000/api/backup/create \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT_TOKEN" | jq . 2>/dev/null || \
    curl -s -X POST http://localhost:3000/api/backup/create \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT_TOKEN"
    
    echo ""
    echo "Waiting for backup to complete..."
    sleep 10
    
    BACKUP_AFTER=$(ls -1 ./backups/*.sql 2>/dev/null | wc -l)
    
    if [ "$BACKUP_AFTER" -gt "$BACKUP_BEFORE" ]; then
        print_status "Backup file baru berhasil dibuat!"
        echo "File backup terbaru:"
        ls -lt ./backups/*.sql | head -1
    else
        print_warning "Tidak ada file backup baru yang terdeteksi"
    fi
else
    print_warning "Skipping (No JWT token)"
fi
echo ""

print_header "4. Test Direct Database Connection dari Container"
echo "Testing mysqldump directly from container:"
docker compose exec app mysqldump \
    -h 192.168.99.2 \
    -P 3306 \
    -u root \
    -pKsu123321@ \
    --single-transaction \
    --routines \
    --triggers \
    ksu \
    --where="1=0" \
    2>/dev/null && print_status "Database connection successful!" || print_error "Database connection failed!"
echo ""

print_header "5. Cek Isi Direktori Backup"
echo "Host backup directory (./backups/):"
if [ -d "./backups" ]; then
    ls -la ./backups/
    echo ""
    echo "Total backup files: $(ls -1 ./backups/*.sql 2>/dev/null | wc -l)"
    echo ""
    if [ -n "$(ls -1 ./backups/*.sql 2>/dev/null)" ]; then
        echo "File backup terbaru:"
        ls -lt ./backups/*.sql | head -3
        echo ""
        echo "Ukuran file backup terbaru:"
        ls -lh ./backups/*.sql | head -1 | awk '{print $5, $9}'
    fi
else
    print_error "Direktori backup tidak ditemukan"
fi
echo ""

print_header "6. Cek Container Backup Directory"
echo "Container backup directory (/app/backups/):"
docker compose exec app ls -la /app/backups/
echo ""

print_header "7. Test Scheduler Status"
if [ -n "$JWT_TOKEN" ]; then
    curl -s -X GET http://localhost:3000/api/backup/scheduler/status \
        -H "Authorization: Bearer $JWT_TOKEN" | jq . 2>/dev/null || \
    curl -s -X GET http://localhost:3000/api/backup/scheduler/status \
        -H "Authorization: Bearer $JWT_TOKEN"
else
    print_warning "Skipping (No JWT token)"
fi
echo ""
echo ""

print_header "8. Sync Test (Host vs Container)"
echo "Comparing backup files between host and container:"
HOST_COUNT=$(ls -1 ./backups/*.sql 2>/dev/null | wc -l)
CONTAINER_COUNT=$(docker compose exec app ls -1 /app/backups/*.sql 2>/dev/null | wc -l)

echo "Host backup files: $HOST_COUNT"
echo "Container backup files: $CONTAINER_COUNT"

if [ "$HOST_COUNT" -eq "$CONTAINER_COUNT" ]; then
    print_status "File count match! Volume mount working correctly."
else
    print_warning "File count mismatch! Volume mount might have issues."
fi
echo ""

print_header "Ringkasan Test:"
echo ""

# Summary
if docker compose ps | grep -q "Up"; then
    print_status "✓ Container running"
else
    print_error "✗ Container not running"
fi

if [ -d "./backups" ]; then
    print_status "✓ Host backup directory exists"
else
    print_error "✗ Host backup directory missing"
fi

if docker compose exec app ls /app/backups/ >/dev/null 2>&1; then
    print_status "✓ Container backup directory exists"
else
    print_error "✗ Container backup directory missing"
fi

if docker compose exec app which mysqldump >/dev/null 2>&1; then
    print_status "✓ MySQL tools available in container"
else
    print_error "✗ MySQL tools missing in container"
fi

if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    print_status "✓ Application responding"
else
    print_error "✗ Application not responding"
fi

BACKUP_FILES=$(ls -1 ./backups/*.sql 2>/dev/null | wc -l)
if [ "$BACKUP_FILES" -gt 0 ]; then
    print_status "✓ Backup files found ($BACKUP_FILES files)"
else
    print_warning "⚠ No backup files found yet"
fi

echo ""
print_header "🎯 Rekomendasi:"
echo ""
if [ "$JWT_TOKEN" = "" ]; then
    echo "1. Dapatkan JWT token untuk test API backup"
    echo "2. Edit script ini dan masukkan JWT token yang valid"
fi
echo "3. Untuk backup otomatis, pastikan scheduler running"
echo "4. Monitor direktori ./backups/ untuk file backup baru"
echo "5. Test backup berkala untuk memastikan sistem jalan"
echo ""
print_header "Test selesai! 🧪"
