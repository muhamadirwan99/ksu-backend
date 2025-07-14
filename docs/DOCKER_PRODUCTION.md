# Docker Production Deployment Guide

## 🐳 KSU Backend Docker Production Setup

### Prerequisites

- Windows 10/11 with Docker Desktop installed
- Docker Compose v2.0+
- 8GB+ RAM available
- 50GB+ disk space

### 🚀 Quick Start

1. **Setup Docker Environment**

   ```bash
   npm run docker:setup
   ```

2. **Start Production Services**

   ```bash
   npm run docker:prod
   ```

3. **Test Backup System**
   ```bash
   npm run docker:test
   ```

### 📦 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (nginx)       │    │   (Node.js)     │    │   (MySQL 8.0)   │
│   Port: 80/443  │    │   Port: 3000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Docker        │
                    │   Network       │
                    │   (ksu-network) │
                    └─────────────────┘
```

### 🗂️ File Structure

```
ksu_backend/
├── docker-compose.production.yml  # Production Docker setup
├── Dockerfile.production          # Production container build
├── .env.production                # Production environment
├── docker/
│   ├── production.env             # Docker-specific config
│   └── mysql/
│       └── conf.d/
│           └── mysql-backup.cnf   # MySQL optimization
├── scripts/
│   ├── setup-docker-production.sh # Setup automation
│   └── test-docker-backup.sh      # Backup testing
└── backups/                       # Backup files (mounted)
```

### 🔧 Configuration

#### Environment Variables

**Production (.env.production):**

```env
DATABASE_URL=mysql://ksu_user:Ksu123321@@mysql-db:3306/ksu
BACKUP_MYSQL_HOST=mysql-db
BACKUP_MYSQL_PORT=3306
BACKUP_MYSQL_USER=root
BACKUP_MYSQL_PASSWORD=Ksu123321@
BACKUP_DIRECTORY=/app/backups
```

#### Volume Mounts

| Container Path   | Host Path    | Purpose              |
| ---------------- | ------------ | -------------------- |
| `/app/backups`   | `./backups`  | Backup file storage  |
| `/app/logs`      | `./logs`     | Application logs     |
| `/var/lib/mysql` | `mysql_data` | Database persistence |

### 📊 Backup System

#### Automatic Backups

- **Daily**: 2:00 AM local time
- **Retention**: 30 days default
- **Location**: `./backups/` and `C:/docker-data/ksu/backups/`

#### Manual Backup Commands

```bash
# Create backup
curl -X POST http://localhost:3000/api/backup/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# List backups
curl -X GET http://localhost:3000/api/backup/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get backup info
curl -X GET http://localhost:3000/api/backup/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🔍 Monitoring

#### Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f backend
```

#### Backup Monitoring

```bash
# Check backup status
curl http://localhost:3000/api/backup/scheduler/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Manual backup test
curl -X POST http://localhost:3000/api/backup/scheduler/run-now \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🛠️ Management Commands

#### Service Management

```bash
# Start all services
npm run docker:prod

# Stop all services
npm run docker:stop

# Restart services
npm run docker:stop && npm run docker:prod

# View service status
docker-compose -f docker-compose.production.yml ps
```

#### Database Management

```bash
# Access MySQL CLI
docker-compose -f docker-compose.production.yml exec mysql-db mysql -u root -p ksu

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npm run migrate

# Seed database
docker-compose -f docker-compose.production.yml exec backend npm run seed
```

#### Backup Management

```bash
# Test backup system
npm run docker:test

# View backup files
ls -la ./backups/

# Manual backup from container
docker-compose -f docker-compose.production.yml exec backend \
  curl -X POST http://localhost:3000/api/backup/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🔐 Security

#### Container Security

- Non-root user in application container
- MySQL root password protected
- Network isolation with custom bridge
- Health checks for early problem detection

#### Backup Security

- JWT authentication required
- File system permissions restricted
- Backup retention policy enforced
- Secure password handling

### 🚨 Troubleshooting

#### Common Issues

**1. Port Already in Use**

```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Stop conflicting services
docker-compose -f docker-compose.production.yml down
```

**2. Database Connection Failed**

```bash
# Check database container
docker-compose -f docker-compose.production.yml logs mysql-db

# Test database connectivity
docker-compose -f docker-compose.production.yml exec backend \
  nc -zv mysql-db 3306
```

**3. Backup Directory Issues**

```bash
# Check directory permissions
ls -la ./backups/

# Recreate directories
mkdir -p ./backups ./logs
chmod 755 ./backups ./logs
```

**4. Container Build Failures**

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose -f docker-compose.production.yml build --no-cache
```

#### Log Analysis

```bash
# Application logs
docker-compose -f docker-compose.production.yml logs -f backend

# Database logs
docker-compose -f docker-compose.production.yml logs -f mysql-db

# All services logs
docker-compose -f docker-compose.production.yml logs -f
```

### 📈 Performance Optimization

#### Database Optimization

- InnoDB buffer pool tuned for backup operations
- Binary logging optimized for backup consistency
- Character set optimized for Indonesian content

#### Backup Optimization

- Compressed mysqldump output
- Background backup processing
- Retention policy to manage disk space
- Health monitoring for backup failures

### 🔄 Updates and Maintenance

#### Application Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

#### Database Maintenance

```bash
# Database backup before maintenance
npm run docker:test

# Run database optimization
docker-compose -f docker-compose.production.yml exec mysql-db \
  mysql -u root -p -e "OPTIMIZE TABLE ksu.users, ksu.products;"
```

### 📞 Support

For issues with this Docker setup:

1. Check the troubleshooting section above
2. Review Docker logs for error messages
3. Verify all environment variables are set correctly
4. Ensure Docker Desktop is running and has sufficient resources

### 🎯 Production Checklist

- [ ] Docker Desktop installed and running
- [ ] Environment variables configured
- [ ] SSL certificates configured (if needed)
- [ ] Backup system tested and working
- [ ] Monitoring and alerting set up
- [ ] Database migration completed
- [ ] Application accessible via browser
- [ ] All API endpoints responding correctly
- [ ] Log rotation configured
- [ ] Disaster recovery plan documented
