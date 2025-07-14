#!/bin/bash

# Test Timezone in Container
echo "🕒 Testing Timezone Configuration..."
echo "=================================="

echo ""
echo "1. System Timezone Check:"
echo "Host timezone:"
date
echo ""

echo "Container timezone:"
docker compose exec app date
echo ""

echo "2. Environment Variables:"
echo "Host TZ:"
echo $TZ
echo ""

echo "Container TZ:"
docker compose exec app printenv TZ
echo ""

echo "3. Node.js Timezone Test:"
docker compose exec app node -e "
console.log('Current time UTC:', new Date().toISOString());
console.log('Current time WIB:', new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}));
console.log('System timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
process.env.TZ && console.log('TZ env var:', process.env.TZ);
"

echo ""
echo "4. Check /etc/timezone:"
echo "Container /etc/timezone:"
docker compose exec app cat /etc/timezone 2>/dev/null || echo "File not found"

echo ""
echo "5. Check /etc/localtime:"
echo "Container timezone link:"
docker compose exec app ls -la /etc/localtime

echo ""
echo "6. Test Backup File Timestamp:"
echo "Creating test backup to check timestamp..."
docker compose exec app node -e "
const now = new Date();
const wibTime = new Date(now.toLocaleString('en-US', {timeZone: 'Asia/Jakarta'}));
console.log('Current UTC:', now.toISOString());
console.log('Current WIB:', wibTime.toLocaleString('id-ID'));
console.log('WIB formatted:', wibTime.getFullYear() + '-' + String(wibTime.getMonth() + 1).padStart(2, '0') + '-' + String(wibTime.getDate()).padStart(2, '0') + '_' + String(wibTime.getHours()).padStart(2, '0') + '-' + String(wibTime.getMinutes()).padStart(2, '0') + '-' + String(wibTime.getSeconds()).padStart(2, '0'));
"

echo ""
echo "✅ Timezone test completed!"
