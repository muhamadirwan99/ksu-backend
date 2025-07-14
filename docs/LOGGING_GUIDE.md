# Logging Configuration Guide

## Environment Variables

Add these variables to your `.env` file:

```bash
# Logging Configuration
LOG_LEVEL=info
NODE_ENV=development

# For production, use:
# LOG_LEVEL=warn
# NODE_ENV=production

# Database logging (optional - can be disabled in production for performance)
ENABLE_DATABASE_LOGGING=true

# Docker-specific (optional)
DOCKER_ENV=true  # Force Docker mode if needed
```

## Docker Deployment

### Log Files Location

When running in Docker container, logs are automatically mounted to your Windows host:

```bash
# Windows Host Path        →  Docker Container Path
./logs/                   →  /app/logs/
./backups/                →  /app/backups/
```

This means your log files will be available at:

- `C:\path\to\your\project\logs\application-YYYY-MM-DD.log`
- `C:\path\to\your\project\logs\error-YYYY-MM-DD.log`

### Docker Commands for Logging

```bash
# View real-time logs from Docker container
docker-compose -f docker-compose.production.yml logs -f backend

# View specific service logs
docker logs ksu-backend -f

# View logs with timestamps
docker logs ksu-backend -f -t

# View last 100 lines
docker logs ksu-backend --tail 100
```

### Log Monitoring in Production

The application provides multiple logging channels:

1. **File Logs** (mounted to Windows host):

   - Persistent across container restarts
   - Accessible from Windows Explorer
   - Automatic rotation and compression

2. **Docker Stdout/Stderr**:

   - Real-time monitoring via `docker logs`
   - Integration with container orchestration
   - Centralized logging systems

3. **Database Logs** (optional):
   - Response tracking in database
   - Can be disabled for performance

## Log Levels

- `error`: Error conditions
- `warn`: Warning conditions
- `info`: Informational messages (default)
- `debug`: Debug-level messages
- `silly`: Silly level messages

## Log Files

The application creates several log files:

- `logs/application-YYYY-MM-DD.log` - General application logs
- `logs/error-YYYY-MM-DD.log` - Error logs only
- `logs/exceptions-YYYY-MM-DD.log` - Uncaught exceptions
- `logs/rejections-YYYY-MM-DD.log` - Unhandled promise rejections

## Usage Examples

```javascript
import {
  logInfo,
  logError,
  logWarn,
  logDebug,
} from "../application/logging.js";

// Basic logging
logInfo("User logged in", { userId: 123 });

// Error logging with stack trace
logError("Database connection failed", error, {
  operation: "user-login",
  userId: 123,
});

// Warning for non-critical issues
logWarn("Rate limit approaching", {
  userId: 123,
  requestCount: 95,
  limit: 100,
});

// Debug information (only shown in development)
logDebug("Processing request", {
  requestId: "abc123",
  payload: requestData,
});
```

## Request Context

All HTTP requests now include:

- `requestId`: Unique identifier for each request
- `responseTime`: Time taken to process request
- `userContext`: User information from JWT (if available)
- IP address and user agent

## Best Practices

1. **Use appropriate log levels**

   - `error` for actual errors that need attention
   - `warn` for issues that should be monitored
   - `info` for important business events
   - `debug` for development troubleshooting

2. **Include context**

   - Always include relevant metadata
   - Use structured data (objects) rather than string concatenation

3. **Avoid logging sensitive data**

   - Never log passwords, tokens, or personal information
   - Use `[REDACTED]` placeholders where needed

4. **Performance considerations**
   - Database logging can be disabled in high-traffic production environments
   - Use async logging for non-critical operations

## Docker Integration

### Automatic Volume Mounting

The logging system is configured to work seamlessly with Docker:

```yaml
# docker-compose.production.yml
volumes:
  - ./logs:/app/logs # Log files accessible from Windows
  - ./backups:/app/backups # Backup files accessible from Windows
```

### Monitoring Tools

#### Windows Batch Script

```bash
# Run monitoring script in Windows
scripts\monitor-logs.bat
```

#### Bash Script (WSL/Linux)

```bash
# Run monitoring script in WSL or Linux
./scripts/monitor-logs.sh
```

#### Docker Commands

```bash
# Real-time container logs
docker logs ksu-backend -f

# Production logs
docker-compose -f docker-compose.production.yml logs -f backend

# Last 100 lines
docker logs ksu-backend --tail 100
```

### Log Outputs

1. **Console (Docker stdout/stderr)**:

   - Format: `[YYYY-MM-DD HH:mm:ss] LEVEL: message {metadata}`
   - Visible via `docker logs`
   - Real-time monitoring

2. **File Logs (mounted to Windows)**:
   - Location: `./logs/` directory on Windows host
   - Format: Structured JSON with full metadata
   - Persistent across container restarts
   - Automatic rotation and compression

## Migration Guide

To migrate from console.log to winston:

```javascript
// Old way
console.log("User created:", userData);
console.error("Error:", error);

// New way
logInfo("User created", { userData });
logError("User creation failed", error, { userData });
```
