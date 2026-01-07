[![wakatime](https://wakatime.com/badge/user/424ac19d-b9e3-4d7b-84dc-4ae0c38b5a96/project/e34d2ccf-ddce-41fb-8c7e-ff304ec3d0c9.svg)](https://wakatime.com/badge/user/424ac19d-b9e3-4d7b-84dc-4ae0c38b5a96/project/e34d2ccf-ddce-41fb-8c7e-ff304ec3d0c9)

# 🏪 KSU Backend

Backend sistem untuk Koperasi Simpan Pinjam (KSU) dengan fitur lengkap manajemen toko, inventory, dan keuangan.

## ✨ Latest Features

### 🆕 Stock Opname Harian (January 2026)

Sistem Stock Opname Harian yang terintegrasi dengan Tutup Kasir:

- ✅ Validasi bisnis logic (SO setelah Tutup Kasir)
- ✅ Batch save untuk efisiensi
- ✅ Progress tracking real-time
- ✅ Transaction safety & rollback
- ✅ Auto update stock produk

**Documentation:**

- 📖 [Quick Start Guide](./docs/STOCKTAKE_HARIAN_QUICKSTART.md)
- 📖 [API Documentation](./docs/STOCKTAKE_HARIAN_API.md)
- 📖 [Implementation Details](./docs/STOCKTAKE_HARIAN_IMPLEMENTATION.md)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev

# Or start production server
npm start
```

## 📚 Additional Documentation

- [Backup System](./docs/BACKUP_SYSTEM.md)
- [Docker Production](./docs/DOCKER_PRODUCTION.md)
- [Logging Guide](./docs/LOGGING_GUIDE.md)
- [Security Incident Response](./docs/SECURITY_INCIDENT_RESPONSE.md)

## 🛠️ Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **ORM:** Prisma
- **Authentication:** JWT
- **Logging:** Winston

## 📦 Main Features

- 👥 User & Role Management
- 🏢 Anggota & Supplier Management
- 📦 Product & Inventory Management
- 💰 Sales & Purchase Management
- 💳 Payment Processing (Tunai, QRIS, Kredit)
- 📊 Dashboard & Reporting
- 🔄 Stock Opname & Stock Take
- 💼 Tutup Kasir (Shift Management)
- 📝 Backup & Restore System

## 🐳 Docker Support

```bash
# Development
npm run docker:dev

# Production
npm run docker:prod

# Quick deploy
npm run deploy:quick
```

## 👨‍💻 Developer

**Muhamad Irwan**

---

**Last Updated:** January 7, 2026
