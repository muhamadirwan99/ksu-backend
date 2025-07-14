# Quick Start: Docker Logging Setup

## 🚀 Quick Commands

### Deploy with Logging

```bash
# Deploy to production with log monitoring
docker-compose -f docker-compose.production.yml up -d

# Verify logging is working
docker logs ksu-backend --tail 20
```

### Monitor Logs in Real-time

```bash
# Windows - Use provided script
scripts\monitor-logs.bat

# OR manually with Docker
docker logs ksu-backend -f

# OR view files directly
notepad logs\application-2025-07-14.log
```

### Access Log Files

Your logs are automatically available on Windows at:

- `./logs/application-YYYY-MM-DD.log` - General application logs
- `./logs/error-YYYY-MM-DD.log` - Error logs only
- `./logs/exceptions-YYYY-MM-DD.log` - Uncaught exceptions

## 🔍 Log Locations

| Type       | Docker Path                   | Windows Path               | Purpose                    |
| ---------- | ----------------------------- | -------------------------- | -------------------------- |
| App Logs   | `/app/logs/application-*.log` | `./logs/application-*.log` | General application events |
| Error Logs | `/app/logs/error-*.log`       | `./logs/error-*.log`       | Errors only for monitoring |
| Console    | Docker stdout                 | `docker logs ksu-backend`  | Real-time view             |
| Database   | MySQL                         | Response tracking          | API calls tracking         |

## 🔧 Configuration

### Environment Variables

```bash
# In .env.production
LOG_LEVEL=info              # info, warn, error, debug
NODE_ENV=production         # Optimizes logging for production
ENABLE_DATABASE_LOGGING=true # Can be disabled for performance
```

### Log Rotation

- **Max Size**: 20MB per file
- **Max Files**: 14 days for application logs, 30 days for errors
- **Compression**: Automatic gzip for old files
- **Timezone**: Asia/Jakarta (WIB)

## 🚨 Troubleshooting

### No Log Files?

```bash
# Check if volumes are mounted correctly
docker inspect ksu-backend | grep -A 10 "Mounts"

# Verify container is running
docker ps | grep ksu-backend
```

### Permission Issues?

```bash
# Fix log directory permissions
sudo chown -R $USER:$USER logs/
chmod 755 logs/
```

### Container Not Starting?

```bash
# Check startup errors
docker logs ksu-backend

# View exception logs
cat logs/exceptions-*.log
```

## 📊 Production Monitoring

### Daily Monitoring

1. Check `./logs/error-*.log` for any errors
2. Monitor `docker logs ksu-backend` for real-time issues
3. Verify log file sizes aren't growing too large
4. Review database performance logs if enabled

### Weekly Maintenance

1. Run log cleanup: `scripts/monitor-logs.bat` → Option 5
2. Check disk space usage
3. Review application performance metrics
4. Backup important logs if needed

## 🎯 Key Benefits

✅ **No Configuration Required**: Works out of the box with Docker
✅ **Windows Accessible**: Log files appear directly in your project folder  
✅ **Real-time Monitoring**: Multiple ways to view logs
✅ **Production Ready**: Automatic rotation, compression, error separation
✅ **Performance Optimized**: Async logging, configurable database logging
✅ **Security Focused**: Sensitive data redaction, structured logging
