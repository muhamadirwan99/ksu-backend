#!/bin/bash

# KSU Backend Production Deployment Script
# Usage: ./deploy.sh

echo "🚀 Deploying KSU Backend to Production..."

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

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Create required directories if they don't exist
print_header "Creating required directories..."
mkdir -p backups logs
print_status "Directories created ✓"

# Backup current database before deployment (optional but recommended)
print_header "Creating pre-deployment backup..."
if [ -f "scripts/create-backup.sh" ]; then
    bash scripts/create-backup.sh
    print_status "Pre-deployment backup created ✓"
else
    print_warning "Backup script not found, skipping pre-deployment backup"
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

# Build and start containers
print_header "Building and starting containers..."
docker compose up --build -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check if application is running
print_header "Checking application status..."
if curl -f http://localhost:3000/api/health &> /dev/null; then
    print_status "✅ Application is running successfully!"
    print_status "🌐 Application URL: http://localhost:3000"
else
    print_warning "⚠️  Application might still be starting up or there's an issue."
    print_status "📋 Checking container logs..."
    docker compose logs --tail=20 app
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

# Optional: Run a quick health check
print_header "Running final health check..."
sleep 5
if curl -f http://localhost:3000/api/health &> /dev/null; then
    print_status "✅ Final health check passed!"
else
    print_warning "⚠️  Health check failed. Please check logs:"
    echo "    docker compose logs app"
fi
