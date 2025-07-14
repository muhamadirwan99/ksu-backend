#!/bin/bash

# Git History Cleanup Script for KSU Backend
echo "🧹 Cleaning Git History from Exposed Secrets..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository!"
    exit 1
fi

# Create backup branch
print_header "Creating backup branch..."
git branch backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
print_status "Backup branch created"

# Show current status
print_header "Current repository status:"
echo "Current branch: $(git branch --show-current)"
echo "Latest commits:"
git log --oneline -5

echo ""
print_warning "⚠️  WARNING: This will rewrite git history!"
print_warning "⚠️  All team members will need to re-clone the repository!"
echo ""

read -p "Do you want to continue? (type 'YES' to confirm): " confirm

if [ "$confirm" != "YES" ]; then
    print_error "Operation cancelled"
    exit 1
fi

# Method 1: Using git filter-branch
print_header "Method 1: Using git filter-branch"
echo "Removing sensitive files from git history..."

# Files to completely remove from history
SENSITIVE_FILES=(
    "docker-compose.yml"
    "docker-compose.production.yml" 
    "scripts/setup-docker-production.sh"
    "scripts/test-backup-complete.sh"
    "docs/DOCKER_PRODUCTION.md"
    "docker/production.env"
)

# Create filter command
FILTER_CMD="git rm --cached --ignore-unmatch"
for file in "${SENSITIVE_FILES[@]}"; do
    FILTER_CMD="$FILTER_CMD $file"
done

# Run filter-branch
git filter-branch --force --index-filter "$FILTER_CMD" --prune-empty --tag-name-filter cat -- --all

print_status "Filter-branch completed"

# Clean up
print_header "Cleaning up repository..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

print_status "Repository cleaned"

# Re-add files with clean versions
print_header "Re-adding clean versions of files..."
git add docker-compose.yml docker-compose.production.yml
git add scripts/ docs/ docker/
git commit -m "feat: re-add clean configuration files without exposed secrets"

print_status "Clean files re-added"

# Show final status
print_header "Final repository status:"
echo "Repository size before cleanup: $(du -sh .git)"
echo "Latest commits:"
git log --oneline -5

echo ""
print_header "Next steps:"
echo "1. Verify all sensitive data is removed:"
echo "   git log --grep='password\\|secret\\|Ksu123321' --oneline"
echo ""
echo "2. Force push to GitHub (⚠️  DESTRUCTIVE):"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. Notify team members to re-clone repository"
echo ""
echo "4. Change all exposed passwords immediately"
echo ""

print_warning "⚠️  Remember: Force push will affect all team members!"
print_status "🎉 Git history cleanup completed!"
