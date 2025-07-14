# 🚨 SECURITY INCIDENT RESPONSE GUIDE

## GitHub Secret Detection Alert

GitHub detected exposed MySQL passwords in the repository. This guide helps you respond to and prevent such incidents.

### 🔥 IMMEDIATE ACTIONS TAKEN

1. **✅ Removed hardcoded passwords** from all files
2. **✅ Converted to environment variables**
3. **✅ Updated .gitignore** to prevent future exposure
4. **✅ Created template files** with placeholder values

### 📋 FILES THAT WERE AFFECTED

- `docker-compose.yml`
- `docker-compose.production.yml`
- `docker/production.env`
- `scripts/setup-docker-production.sh`
- `scripts/test-backup-complete.sh`
- `docs/DOCKER_PRODUCTION.md`

### 🔧 WHAT YOU NEED TO DO

#### 1. **Change All Passwords Immediately**

```bash
# Change MySQL root password
# Change MySQL user password
# Change JWT secret key
# Change any other exposed credentials
```

#### 2. **Create Environment Files**

```bash
# Copy template and fill with new passwords
cp .env.example .env
cp docker/production.env .env.production

# Edit files with secure passwords
nano .env
nano .env.production
```

#### 3. **Regenerate Secrets**

```bash
# Generate strong MySQL passwords
openssl rand -base64 32

# Generate strong JWT secret
openssl rand -base64 64
```

#### 4. **Update Database Passwords**

```sql
-- Connect to MySQL and change passwords
ALTER USER 'root'@'%' IDENTIFIED BY 'new_secure_password';
ALTER USER 'ksu_user'@'%' IDENTIFIED BY 'new_secure_password';
FLUSH PRIVILEGES;
```

#### 5. **Remove from Git History** (Optional but Recommended)

```bash
# WARNING: This rewrites git history
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch docker-compose.yml' \
--prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team)
git push origin --force --all
```

### 🛡️ PREVENTION MEASURES

#### Environment Variables Setup

```bash
# Always use .env files for secrets
echo "DATABASE_PASSWORD=your_secure_password" >> .env
echo "JWT_SECRET=your_jwt_secret" >> .env

# Never commit .env files
echo ".env*" >> .gitignore
```

#### Pre-commit Hooks

```bash
# Install git-secrets to prevent future incidents
npm install --save-dev @commitlint/cli
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run security-scan"
```

#### Docker Secrets (Production)

```yaml
# Use Docker secrets for production
services:
  app:
    secrets:
      - db_password
      - jwt_secret
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

### 📊 SECURITY CHECKLIST

- [ ] **Passwords changed** in database
- [ ] **Environment files created** with new secrets
- [ ] **Applications redeployed** with new credentials
- [ ] **Team notified** of password change
- [ ] **Git history cleaned** (if required)
- [ ] **Monitoring enabled** for future incidents
- [ ] **Pre-commit hooks** installed
- [ ] **Security review** of all config files

### 🔍 DETECTION TOOLS

#### Local Scanning

```bash
# Install truffleHog for local scanning
pip install truffleHog
truffleHog filesystem .

# Install gitleaks
brew install gitleaks  # macOS
gitleaks detect --source .
```

#### GitHub Integration

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run GitLeaks
        uses: zricethezav/gitleaks-action@master
```

### 📞 INCIDENT RESPONSE

1. **Immediate**: Change all exposed credentials
2. **Short-term**: Update all applications and deployments
3. **Medium-term**: Review and improve security practices
4. **Long-term**: Implement automated scanning and monitoring

### 🎯 BEST PRACTICES

#### Environment Management

- Use separate environment files per environment
- Never commit environment files to version control
- Use secrets management services (AWS Secrets Manager, Azure Key Vault)
- Rotate credentials regularly

#### Development Workflow

- Use development-specific credentials
- Implement proper secret scanning in CI/CD
- Train team on security best practices
- Regular security audits

### 📚 RESOURCES

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Remember**: Security is an ongoing process, not a one-time fix. Regularly review and update your security practices.
