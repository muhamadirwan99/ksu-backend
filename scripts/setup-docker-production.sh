#!/bin/bash

# KSU Backend Docker Production Setup Script for Windows 10
# This script sets up the complete Docker environment for production

echo "🚀 Setting up KSU Backend Docker Production Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Docker is installed and running
print_header "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker Desktop for Windows first."
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

print_status "Docker is installed and running ✓"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_warning "docker-compose not found. Using 'docker compose' instead."
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Create required directories on Windows host
print_header "Creating required directories..."

# Windows paths
DOCKER_DATA_DIR="C:/docker-data/ksu"
BACKUP_DIR="$DOCKER_DATA_DIR/backups"
LOGS_DIR="$DOCKER_DATA_DIR/logs"
MYSQL_DIR="$DOCKER_DATA_DIR/mysql"

# Create directories (Windows compatible)
mkdir -p "$BACKUP_DIR" 2>/dev/null || {
    # Fallback for Windows
    cmd //c "mkdir C:\\docker-data\\ksu\\backups" 2>/dev/null || true
    cmd //c "mkdir C:\\docker-data\\ksu\\logs" 2>/dev/null || true
    cmd //c "mkdir C:\\docker-data\\ksu\\mysql" 2>/dev/null || true
}

# Create local backup directory
mkdir -p "./backups"
mkdir -p "./logs"
mkdir -p "./docker/mysql/conf.d"

print_status "Directories created ✓"

# Create MySQL configuration for optimized backups
print_header "Creating MySQL configuration..."
cat > "./docker/mysql/conf.d/mysql-backup.cnf" << 'EOF'
[mysqld]
# Backup optimization settings
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_flush_log_at_trx_commit = 2
sync_binlog = 0

# Backup compatibility
sql_mode = "STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[mysql]
default-character-set = utf8mb4

[client]
default-character-set = utf8mb4
EOF

print_status "MySQL configuration created ✓"

# Create production environment file template
print_header "Creating production environment file template..."
cat > ".env.production.example" << 'EOF'
# MySQL Container Configuration
MYSQL_ROOT_PASSWORD=your_secure_root_password_here
MYSQL_DATABASE=ksu
MYSQL_USER=ksu_user
MYSQL_PASSWORD=your_secure_user_password_here

# Application Configuration
DATABASE_URL=mysql://ksu_user:your_secure_user_password_here@mysql-db:3306/ksu?allowPublicKeyRetrieval=true
DATABASE_URL_NEW=mysql://ksu_user:your_secure_user_password_here@mysql-db:3306/ksu?allowPublicKeyRetrieval=true

# JWT Configuration
JWT_SECRET_KEY=your_strong_jwt_secret_key_here

# Backup Configuration for Docker
BACKUP_MYSQL_HOST=mysql-db
BACKUP_MYSQL_PORT=3306
BACKUP_MYSQL_USER=root
BACKUP_MYSQL_PASSWORD=your_secure_root_password_here
BACKUP_MYSQL_DATABASE=ksu
BACKUP_DIRECTORY=/app/backups
BACKUP_RETENTION_DAYS=30

# Application Settings
NODE_ENV=production
PORT=3000

# Logging
LOG_LEVEL=info
LOG_FILE=/app/logs/application.log
EOF

print_status "Production environment template created ✓"
print_warning "IMPORTANT: Copy .env.production.example to .env.production and fill in your actual passwords!"

# Create backup test script
print_header "Creating backup test script..."
cat > "./scripts/test-docker-backup.sh" << 'EOF'
#!/bin/bash

echo "🧪 Testing Docker Backup System..."

# Test backup creation
echo "Testing backup creation..."
curl -X POST http://localhost:3000/api/backup/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

echo ""
echo "Testing backup list..."
curl -X GET http://localhost:3000/api/backup/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

echo ""
echo "Testing backup info..."
curl -X GET http://localhost:3000/api/backup/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

echo ""
echo "✅ Backup tests completed!"
EOF

chmod +x "./scripts/test-docker-backup.sh"
print_status "Backup test script created ✓"

# Build and start services
print_header "Building and starting Docker services..."

# Stop any existing services
print_status "Stopping existing services..."
$COMPOSE_CMD -f docker-compose.production.yml down 2>/dev/null || true

# Build services
print_status "Building services..."
$COMPOSE_CMD -f docker-compose.production.yml build

# Start services
print_status "Starting services..."
$COMPOSE_CMD -f docker-compose.production.yml up -d

# Wait for services to be ready
print_header "Waiting for services to be ready..."
sleep 30

# Check service status
print_status "Checking service status..."
$COMPOSE_CMD -f docker-compose.production.yml ps

# Test database connection
print_header "Testing database connection..."
sleep 10

# Try to access the application
if curl -f http://localhost:3000/api/health &> /dev/null; then
    print_status "Application is running and accessible ✓"
else
    print_warning "Application might still be starting up. Please check logs if needed."
fi

# Show useful commands
print_header "Setup completed! Useful commands:"
echo ""
echo -e "${GREEN}View logs:${NC}"
echo "  $COMPOSE_CMD -f docker-compose.production.yml logs -f backend"
echo ""
echo -e "${GREEN}Access database:${NC}"
echo "  $COMPOSE_CMD -f docker-compose.production.yml exec mysql-db mysql -u root -p ksu"
echo ""
echo -e "${GREEN}View backups:${NC}"
echo "  ls -la ./backups/"
echo ""
echo -e "${GREEN}Test backup system:${NC}"
echo "  ./scripts/test-docker-backup.sh"
echo ""
echo -e "${GREEN}Stop services:${NC}"
echo "  $COMPOSE_CMD -f docker-compose.production.yml down"
echo ""
echo -e "${GREEN}Start services:${NC}"
echo "  $COMPOSE_CMD -f docker-compose.production.yml up -d"
echo ""

print_status "🎉 Docker production environment setup completed!"
print_status "Your application should be available at: http://localhost:3000"
print_status "Backups will be stored in: ./backups/ and C:/docker-data/ksu/backups/"

# Show next steps
echo ""
print_header "Next Steps:"
echo "1. Update JWT token in ./scripts/test-docker-backup.sh"
echo "2. Test the backup system with: ./scripts/test-docker-backup.sh"
echo "3. Configure your frontend to connect to: http://localhost:3000"
echo "4. Set up nginx reverse proxy if needed"
echo "5. Configure SSL certificates for production"
echo ""
print_status "Happy coding! 🚀"
