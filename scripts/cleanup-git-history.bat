@echo off
REM Git History Cleanup Script for Windows
echo 🧹 Cleaning Git History from Exposed Secrets...
echo.

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ ERROR: Not in a git repository!
    pause
    exit /b 1
)

REM Create backup branch
echo 📦 Creating backup branch...
git branch backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2% 2>nul
echo ✅ Backup branch created

REM Show current status
echo.
echo 📊 Current repository status:
echo Current branch:
git branch --show-current
echo.
echo Latest commits:
git log --oneline -5

echo.
echo ⚠️ WARNING: This will rewrite git history!
echo ⚠️ All team members will need to re-clone the repository!
echo.

set /p confirm="Do you want to continue? (type YES to confirm): "

if not "%confirm%"=="YES" (
    echo ❌ Operation cancelled
    pause
    exit /b 1
)

REM Remove sensitive files from history
echo 🔧 Removing sensitive files from git history...

git filter-branch --force --index-filter "git rm --cached --ignore-unmatch docker-compose.yml docker-compose.production.yml scripts/setup-docker-production.sh scripts/test-backup-complete.sh docs/DOCKER_PRODUCTION.md docker/production.env" --prune-empty --tag-name-filter cat -- --all

echo ✅ Filter-branch completed

REM Clean up
echo 🧹 Cleaning up repository...
rmdir /s /q .git\refs\original\ 2>nul
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ✅ Repository cleaned

REM Re-add files with clean versions
echo 📁 Re-adding clean versions of files...
git add docker-compose.yml docker-compose.production.yml
git add scripts\ docs\ docker\
git commit -m "feat: re-add clean configuration files without exposed secrets"

echo ✅ Clean files re-added

REM Show final status
echo.
echo 📊 Final repository status:
echo Latest commits:
git log --oneline -5

echo.
echo 📋 Next steps:
echo 1. Verify all sensitive data is removed:
echo    git log --grep="password\|secret\|Ksu123321" --oneline
echo.
echo 2. Force push to GitHub (⚠️ DESTRUCTIVE):
echo    git push origin --force --all
echo    git push origin --force --tags
echo.
echo 3. Notify team members to re-clone repository
echo.
echo 4. Change all exposed passwords immediately
echo.

echo ⚠️ Remember: Force push will affect all team members!
echo 🎉 Git history cleanup completed!

pause
