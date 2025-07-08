#!/bin/bash

# Script untuk testing dan monitoring hutang dagang
# Usage: ./test-hutang-dagang.sh [test_type]

BASE_URL="http://localhost:3000"
AUTH_TOKEN=""  # Add your auth token here

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo_error() {
    echo -e "${RED}✗ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Test race condition dengan concurrent requests
test_race_condition() {
    echo "Testing race condition dengan 5 concurrent requests..."
    
    # Data pembayaran yang sama
    PAYMENT_DATA='{
        "id_hutang_dagang": "HD001",
        "nominal_bayar": 100000,
        "tg_bayar": "08-07-2025",
        "keterangan": "Test pembayaran"
    }'
    
    # Buat 5 request bersamaan
    for i in {1..5}; do
        curl -s -X POST "$BASE_URL/api/hutang-dagang/bayar-hutang-dagang" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -d "$PAYMENT_DATA" \
            > "response_$i.json" &
    done
    
    wait  # Tunggu semua request selesai
    
    # Analyze responses
    success_count=0
    duplicate_count=0
    
    for i in {1..5}; do
        if grep -q "successfully registered" "response_$i.json"; then
            ((success_count++))
        elif grep -q "sedang diproses" "response_$i.json"; then
            ((duplicate_count++))
        fi
    done
    
    # Cleanup
    rm -f response_*.json
    
    if [ $success_count -eq 1 ] && [ $duplicate_count -eq 4 ]; then
        echo_success "Race condition test PASSED: 1 success, 4 duplicates detected"
    else
        echo_error "Race condition test FAILED: $success_count success, $duplicate_count duplicates"
    fi
}

# Test consistency check
test_consistency() {
    echo "Testing data consistency..."
    
    response=$(curl -s -X POST "$BASE_URL/api/hutang-dagang/check-consistency" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{}')
    
    if echo "$response" | grep -q "Consistency check completed"; then
        inconsistent_count=$(echo "$response" | jq -r '.data.inconsistent_count // 0')
        if [ "$inconsistent_count" -eq 0 ]; then
            echo_success "Consistency check PASSED: No inconsistencies found"
        else
            echo_warning "Consistency check WARNING: $inconsistent_count inconsistencies found"
            echo "$response" | jq '.data.inconsistent_suppliers'
        fi
    else
        echo_error "Consistency check FAILED: API error"
    fi
}

# Monitor logs untuk error patterns
monitor_logs() {
    echo "Monitoring logs for error patterns (Press Ctrl+C to stop)..."
    
    LOG_FILE="logs/application-$(date +%Y-%m-%d).log"
    
    if [ ! -f "$LOG_FILE" ]; then
        echo_error "Log file not found: $LOG_FILE"
        return 1
    fi
    
    tail -f "$LOG_FILE" | while read line; do
        if echo "$line" | grep -q "Duplicate request detected"; then
            echo_warning "DUPLICATE REQUEST: $line"
        elif echo "$line" | grep -q "Inconsistent.*data detected"; then
            echo_error "DATA INCONSISTENCY: $line"
        elif echo "$line" | grep -q "hutang dagang gagal"; then
            echo_error "PAYMENT FAILED: $line"
        elif echo "$line" | grep -q "hutang dagang berhasil"; then
            echo_success "PAYMENT SUCCESS: $line"
        fi
    done
}

# Test endpoint availability
test_endpoints() {
    echo "Testing endpoint availability..."
    
    endpoints=(
        "/api/hutang-dagang/list-hutang-dagang"
        "/api/hutang-dagang/list-history-bayar-hutang-dagang"
        "/api/hutang-dagang/check-consistency"
        "/api/hutang-dagang/summary"
    )
    
    for endpoint in "${endpoints[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -d '{}')
        
        if [ "$response" -eq 200 ]; then
            echo_success "Endpoint $endpoint is accessible"
        else
            echo_error "Endpoint $endpoint returned HTTP $response"
        fi
    done
}

# Performance test
test_performance() {
    echo "Testing performance with sequential requests..."
    
    start_time=$(date +%s%N)
    
    for i in {1..10}; do
        curl -s -X POST "$BASE_URL/api/hutang-dagang/list-hutang-dagang" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -d '{}' > /dev/null
    done
    
    end_time=$(date +%s%N)
    duration=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
    avg_time=$(( duration / 10 ))
    
    if [ $avg_time -lt 1000 ]; then
        echo_success "Performance test PASSED: Average response time ${avg_time}ms"
    else
        echo_warning "Performance test WARNING: Average response time ${avg_time}ms (>1s)"
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [test_type]"
    echo ""
    echo "Available test types:"
    echo "  race        - Test race condition protection"
    echo "  consistency - Test data consistency"
    echo "  endpoints   - Test endpoint availability"
    echo "  performance - Test API performance"
    echo "  monitor     - Monitor logs in real-time"
    echo "  all         - Run all tests (except monitor)"
    echo ""
    echo "Examples:"
    echo "  $0 race"
    echo "  $0 all"
    echo "  $0 monitor"
}

# Main execution
case "${1:-all}" in
    "race")
        test_race_condition
        ;;
    "consistency")
        test_consistency
        ;;
    "endpoints")
        test_endpoints
        ;;
    "performance")
        test_performance
        ;;
    "monitor")
        monitor_logs
        ;;
    "all")
        echo "Running all tests..."
        echo ""
        test_endpoints
        echo ""
        test_consistency
        echo ""
        test_performance
        echo ""
        echo_success "All tests completed!"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
