#!/bin/bash

# Script untuk validasi dan perbaikan data hutang dagang

echo "=== Hutang Dagang Maintenance Script ==="
echo "Timestamp: $(date)"
echo

# 1. Validasi konsistensi data
echo "1. Checking data consistency..."
curl -s -X POST http://localhost:3000/api/hutang-dagang/check-consistency \
  -H "Content-Type: application/json" \
  -d "{}" | jq '.'

echo
echo "----------------------------------------"
echo

# 2. Perbaiki data yang tidak konsisten
echo "2. Fixing inconsistent data..."
curl -s -X POST http://localhost:3000/api/hutang-dagang/fix-all \
  -H "Content-Type: application/json" \
  -d "{}" | jq '.'

echo
echo "----------------------------------------"
echo

# 3. Validasi ulang setelah perbaikan
echo "3. Re-checking consistency after fix..."
curl -s -X POST http://localhost:3000/api/hutang-dagang/check-consistency \
  -H "Content-Type: application/json" \
  -d "{}" | jq '.'

echo
echo "----------------------------------------"
echo

# 4. Summary data hutang dagang
echo "4. Getting summary..."
curl -s -X POST http://localhost:3000/api/hutang-dagang/summary \
  -H "Content-Type: application/json" \
  -d "{}" | jq '.data.hutang_dagang_summary | length as $total | "Total suppliers with hutang: \($total)"'

echo
echo "=== Maintenance completed ==="
echo "Timestamp: $(date)"
