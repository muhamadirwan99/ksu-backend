#!/bin/bash

# KSU Backend Production Deployment Script
# Usage: ./deploy.sh [--skip-backup] [--force]

set -e  # Exit on error

echo "🚀 Deploying KSU Backend to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_BACKUP=false
FORCE_DEPLOY=false
for arg in "$@"; do
    case $arg in
        --skip-backup)
            SKIP_BACKUP=true
            ;;
        --force)
            FORCE_DEPLOY=true
            ;;
    esac
done

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

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Check required environment files
print_header "Checking environment configuration..."
if [ ! -f ".env" ] && [ ! -f "docker/production.env" ]; then
    print_error "Environment file not found. Please create .env or docker/production.env"
    print_warning "Required variables: DATABASE_URL_NEW, NODE_ENV, JWT_SECRET_KEY"
    exit 1
fi

# Verify DATABASE_URL_NEW is set
if [ -f ".env" ]; then
    source .env
elif [ -f "docker/production.env" ]; then
    source docker/production.env
fi

if [ -z "$DATABASE_URL_NEW" ]; then
    print_error "DATABASE_URL_NEW is not set in environment file"
    exit 1
fi
print_status "Environment configuration verified ✓"

# Confirmation prompt for production deployment
if [ "$FORCE_DEPLOY" = false ]; then
    print_warning "⚠️  You are about to deploy to PRODUCTION environment"
    print_warning "⚠️  Database: ${DATABASE_URL_NEW%%@*}@***"
    echo -n "Continue with deployment? (yes/no): "
    read -r CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        print_error "Deployment cancelled by user"
        exit 0
    fi
fi

# Create required directories if they don't exist
print_header "Creating required directories..."
mkdir -p backups logs
print_status "Directories created ✓"

# Backup current database before deployment (optional but recommended)
print_header "Creating pre-deployment backup..."
if [ "$SKIP_BACKUP" = false ]; then
    BACKUP_FILE="backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
    print_status "Creating backup to $BACKUP_FILE..."
    
    # Extract database credentials from DATABASE_URL_NEW
    if command -v mysqldump &> /dev/null; then
        # Parse DATABASE_URL_NEW format: mysql://user:pass@host:port/dbname
        DB_USER=$(echo $DATABASE_URL_NEW | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
        DB_PASS=$(echo $DATABASE_URL_NEW | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
        DB_HOST=$(echo $DATABASE_URL_NEW | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_NAME=$(echo $DATABASE_URL_NEW | sed -n 's/.*\/\([^?]*\).*/\1/p')
        
        mkdir -p backups
        if mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
            print_status "Pre-deployment backup created ✓ ($BACKUP_FILE)"
        else
            print_warning "Failed to create backup, but continuing deployment..."
        fi
    else
        print_warning "mysqldump not found, skipping database backup"
    fi
else
    print_warning "Skipping pre-deployment backup (--skip-backup flag)"
fi

# Pull latest code
print_header "Pulling latest code from repository..."
git pull origin main || git pull origin master
if [ $? -eq 0 ]; then
    print_status "Code updated successfully ✓"
else
    print_error "Failed to pull latest code"
    exit 1
fi

# Stop existing containers
print_header "Stopping existing containers..."
docker compose down
print_status "Containers stopped ✓"

# Save current image as rollback point
print_header "Creating rollback point..."
CURRENT_IMAGE=$(docker images ksu_backend-app --format "{{.ID}}" | head -n 1)
if [ ! -z "$CURRENT_IMAGE" ]; then
    docker tag ksu_backend-app:latest ksu_backend-app:rollback 2>/dev/null || true
    print_status "Rollback point created ✓"
fi

# Build and start containers
print_header "Building and starting containers..."
if docker compose up --build -d; then
    print_status "Containers built and started ✓"
else
    print_error "Failed to build/start containers"
    print_warning "Attempting rollback..."
    docker compose down
    if [ ! -z "$CURRENT_IMAGE" ]; then
        docker tag ksu_backend-app:rollback ksu_backend-app:latest
        docker compose up -d
        print_status "Rolled back to previous version"
    fi
    exit 1
fi

# Wait for services to start with health checks
print_status "Waiting for services to start..."
MAX_WAIT=60
WAIT_COUNT=0
until curl -f http://localhost:3000/api/health &> /dev/null || [ $WAIT_COUNT -eq $MAX_WAIT ]; do
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    echo -n "."
done
echo ""

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    print_error "Application failed to start within ${MAX_WAIT} seconds"
    print_warning "Attempting rollback..."
    docker compose down
    if [ ! -z "$CURRENT_IMAGE" ]; then
        docker tag ksu_backend-app:rollback ksu_backend-app:latest
        docker compose up -d
        print_error "Deployment failed. Rolled back to previous version."
    fi
    print_status "Check logs: docker compose logs app"
    exit 1
fi

# Check if application is running
print_header "Checking application status..."
if curl -f http://localhost:3000/api/health &> /dev/null; then
    print_status "✅ Application is running successfully!"
    print_status "🌐 Application URL: http://localhost:3000"
    
    # Verify database migrations
    print_header "Verifying database migrations..."
    MIGRATION_STATUS=$(docker compose exec -T app npx prisma migrate status 2>&1)
    if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
        print_status "✅ Database migrations are up to date"
    elif echo "$MIGRATION_STATUS" | grep -q "Your database schema is not up to date"; then
        print_warning "⚠️  Database migrations might not be fully applied"
        print_status "Check migration status: docker compose exec app npx prisma migrate status"
    fi
    
    # Tag successful deployment with timestamp
    DEPLOY_TAG="deploy-$(date +%Y%m%d-%H%M%S)"
    docker tag ksu_backend-app:latest ksu_backend-app:$DEPLOY_TAG
    print_status "Tagged successful deployment as: $DEPLOY_TAG"
else
    print_warning "⚠️  Application health check failed"
    print_status "📋 Checking container logs..."
    docker compose logs --tail=50 app
    exit 1
fi

# Show container status
print_header "Container Status:"
docker compose ps

# Show useful post-deployment commands
print_header "Post-Deployment Commands:"
echo ""
echo -e "${GREEN}View logs:${NC}"
echo "  docker compose logs -f app"
echo ""
echo -e "${GREEN}Check application health:${NC}"
echo "  curl http://localhost:3000/api/health"
echo ""
echo -e "${GREEN}Check migration status:${NC}"
echo "  docker compose exec app npx prisma migrate status"
echo ""
echo -e "${GREEN}Rollback to previous version:${NC}"
echo "  docker compose down"
echo "  docker tag ksu_backend-app:rollback ksu_backend-app:latest"
echo "  docker compose up -d"
echo ""
echo -e "${GREEN}Test backup system:${NC}"
echo "  curl -X POST http://localhost:3000/api/backup/create -H 'Authorization: Bearer YOUR_JWT_TOKEN'"
echo ""
echo -e "${GREEN}Access container shell:${NC}"
echo "  docker compose exec app bash"
echo ""
echo -e "${GREEN}Stop services:${NC}"
echo "  docker compose down"
echo ""

print_status "🎉 Deployment completed!"
print_status "Your KSU Backend is now running with backup system enabled."
print_status "Deployment backup: $BACKUP_FILE"

# Optional: Run a quick health check
print_header "Running final health check..."
sleep 3
if curl -f http://localhost:3000/api/health &> /dev/null; then
    print_status "✅ Final health check passed!"
    
    # Cleanup old images (keep last 3)
    print_header "Cleaning up old Docker images..."
    docker images ksu_backend-app --format "{{.ID}} {{.Tag}}" | grep -v "latest\|rollback" | tail -n +4 | awk '{print $1}' | xargs -r docker rmi 2>/dev/null || true
    print_status "Old images cleaned up ✓"
else
    print_error "⚠️  Final health check failed. Please investigate:"
    echo "    docker compose logs app"
    exit 1
fi
