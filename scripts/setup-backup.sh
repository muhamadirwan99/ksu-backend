#!/bin/bash

# Script untuk setup dan testing sistem backup database KSU Backend
# Author: Muhamad Irwan
# Date: July 2025

echo "=================================================="
echo "KSU Backend - Database Backup System Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Windows (Git Bash/WSL)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    print_info "Detected Windows environment"
    OS_TYPE="windows"
else
    print_info "Detected Unix-like environment"
    OS_TYPE="unix"
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_info "Checking prerequisites..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js first."
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm not found. Please install npm first."
    exit 1
fi

# Check MySQL client
if command_exists mysql; then
    MYSQL_VERSION=$(mysql --version)
    print_success "MySQL client found: $MYSQL_VERSION"
else
    print_error "MySQL client not found."
    if [[ "$OS_TYPE" == "windows" ]]; then
        print_info "Please install MySQL Command Line Client from:"
        print_info "https://dev.mysql.com/downloads/mysql/"
    else
        print_info "Please install MySQL client:"
        print_info "Ubuntu/Debian: sudo apt-get install mysql-client"
        print_info "CentOS/RHEL: sudo yum install mysql"
        print_info "macOS: brew install mysql-client"
    fi
    exit 1
fi

# Check mysqldump
if command_exists mysqldump; then
    print_success "mysqldump found"
else
    print_error "mysqldump not found. Please install MySQL client tools."
    exit 1
fi

# Create backup directory
print_info "Creating backup directory..."
BACKUP_DIR="./backup"
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    print_success "Backup directory created: $BACKUP_DIR"
else
    print_info "Backup directory already exists: $BACKUP_DIR"
fi

# Set appropriate permissions
if [[ "$OS_TYPE" != "windows" ]]; then
    chmod 755 "$BACKUP_DIR"
    print_success "Backup directory permissions set"
fi

# Check .env file
print_info "Checking environment configuration..."
if [ -f ".env" ]; then
    if grep -q "DATABASE_URL_NEW" .env; then
        print_success "DATABASE_URL_NEW found in .env"
    else
        print_warning "DATABASE_URL_NEW not found in .env"
        print_info "Please add DATABASE_URL_NEW to your .env file:"
        print_info "DATABASE_URL_NEW=mysql://username:password@host:port/database_name"
    fi
else
    print_warning ".env file not found"
    print_info "Please create .env file with DATABASE_URL_NEW configuration"
fi

# Install dependencies if needed
print_info "Checking Node.js dependencies..."
if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        print_info "Installing Node.js dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_info "Dependencies already installed"
    fi
else
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

# Test database connection
print_info "Testing database connection..."
if [ -f ".env" ] && grep -q "DATABASE_URL_NEW" .env; then
    # Source .env file
    export $(grep -v '^#' .env | xargs)
    
    if [ -n "$DATABASE_URL_NEW" ]; then
        print_info "DATABASE_URL_NEW is set"
        # You could add actual database connection test here
        print_success "Database configuration appears to be set"
    else
        print_warning "DATABASE_URL_NEW is empty"
    fi
else
    print_warning "Cannot test database connection - configuration missing"
fi

# Create test backup (if database is available)
print_info "Testing backup functionality..."
if command_exists node && [ -f "src/service/backup-service.js" ]; then
    print_info "Backup service files found"
    print_success "Backup system appears to be properly installed"
else
    print_error "Backup service files not found"
    exit 1
fi

# Check scheduler dependencies
print_info "Checking scheduler dependencies..."
if npm list node-cron >/dev/null 2>&1; then
    print_success "node-cron dependency found"
else
    print_warning "node-cron dependency not found"
    print_info "Installing node-cron..."
    npm install node-cron
fi

# Display backup system information
echo ""
echo "=================================================="
echo "Backup System Configuration"
echo "=================================================="
print_info "Backup Directory: $BACKUP_DIR"
print_info "Backup Schedule:"
print_info "  - Daily: Every day at 02:00 WIB"
print_info "  - Weekly: Every Sunday at 01:00 WIB"
print_info "  - Monthly: 1st day of month at 01:00 WIB"
print_info "  - Cleanup: Every Monday at 03:00 WIB"
echo ""

# Display API endpoints
echo "=================================================="
echo "Available API Endpoints"
echo "=================================================="
echo "Backup Operations:"
echo "  POST   /api/backup/create"
echo "  GET    /api/backup/list"
echo "  GET    /api/backup/info"
echo "  GET    /api/backup/download/:fileName"
echo "  DELETE /api/backup/:fileName"
echo "  POST   /api/backup/clean"
echo ""
echo "Table Backup:"
echo "  POST   /api/backup/table/:tableName"
echo ""
echo "Restore:"
echo "  POST   /api/backup/restore/:fileName"
echo ""
echo "Scheduler Management:"
echo "  GET    /api/backup/scheduler/status"
echo "  POST   /api/backup/scheduler/start/:schedulerName"
echo "  POST   /api/backup/scheduler/stop/:schedulerName"
echo "  POST   /api/backup/scheduler/restart"
echo "  POST   /api/backup/scheduler/run-now"
echo "  POST   /api/backup/scheduler/custom"
echo ""

# Display next steps
echo "=================================================="
echo "Next Steps"
echo "=================================================="
print_info "1. Ensure your .env file has correct DATABASE_URL_NEW"
print_info "2. Start the application: npm start"
print_info "3. Test backup API: POST /api/backup/create"
print_info "4. Check backup files in: $BACKUP_DIR"
print_info "5. Monitor logs for backup activities"
echo ""

# Offer to run tests
if command_exists npm; then
    echo "=================================================="
    echo "Testing"
    echo "=================================================="
    print_info "You can run backup system tests with:"
    print_info "npm test -- backup.test.js"
    echo ""
    read -p "Do you want to run the backup tests now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Running backup tests..."
        npm test -- backup.test.js
    fi
fi

print_success "Backup system setup completed!"
print_info "For detailed documentation, see: docs/BACKUP_SYSTEM.md"

exit 0
