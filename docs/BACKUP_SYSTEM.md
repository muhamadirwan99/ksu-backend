# Sistem Backup Database - KSU Backend

## Overview

Sistem backup database yang komprehensif untuk aplikasi KSU Backend. Mendukung backup otomatis terjadwal, backup manual, restore database, dan manajemen file backup.

## Fitur Utama

### 1. Backup Database

- **Backup Manual**: Buat backup kapan saja melalui API
- **Backup Otomatis**: Backup terjadwal (harian, mingguan, bulanan)
- **Backup Table Tertentu**: Backup table spesifik
- **Manajemen File**: List, download, dan hapus file backup

### 2. Restore Database

- Restore database dari file backup yang tersedia
- Validasi file backup sebelum restore

### 3. Maintenance

- Pembersihan backup lama otomatis
- Monitoring disk space
- Logging semua aktivitas backup

## API Endpoints

### Backup Operations

```
POST   /api/backup/create                 - Buat backup database
GET    /api/backup/list                   - Daftar semua backup
GET    /api/backup/info                   - Info storage dan backup
POST   /api/backup/clean?days=30          - Bersihkan backup lama
GET    /api/backup/download/:fileName     - Download file backup
DELETE /api/backup/:fileName             - Hapus file backup
```

### Table-Specific Backup

```
POST   /api/backup/table/:tableName       - Backup table tertentu
```

### Restore Operations

```
POST   /api/backup/restore/:fileName      - Restore dari backup
```

## Jadwal Backup Otomatis

### Backup Harian

- **Waktu**: Setiap hari jam 02:00 WIB
- **Tujuan**: Backup rutin harian

### Backup Mingguan

- **Waktu**: Setiap Minggu jam 01:00 WIB
- **Tujuan**: Backup mingguan + pembersihan backup >30 hari

### Backup Bulanan

- **Waktu**: Tanggal 1 setiap bulan jam 01:00 WIB
- **Tujuan**: Backup bulanan + pembersihan backup >90 hari

### Pembersihan Otomatis

- **Waktu**: Setiap Senin jam 03:00 WIB
- **Tujuan**: Bersihkan backup lama (>30 hari)

## Konfigurasi

### Environment Variables

Pastikan variabel berikut ada di `.env`:

```
DATABASE_URL_NEW=mysql://username:password@host:port/database_name
```

### Dependencies

Pastikan MySQL client tools terinstall di server:

```bash
# Ubuntu/Debian
sudo apt-get install mysql-client

# CentOS/RHEL
sudo yum install mysql

# Windows
# Install MySQL Command Line Client
```

## Struktur File Backup

### Lokasi Backup

```
/backup/
├── backup_ksu_2025-07-14_02-00-00.sql
├── backup_ksu_2025-07-13_02-00-00.sql
├── backup_users_2025-07-14_10-30-00.sql
└── ...
```

### Format Nama File

- **Full Database**: `backup_ksu_YYYY-MM-DD_HH-MM-SS.sql`
- **Table Specific**: `backup_[tablename]_YYYY-MM-DD_HH-MM-SS.sql`

## Penggunaan

### 1. Backup Manual via API

```bash
# Buat backup database lengkap
curl -X POST http://localhost:3000/api/backup/create \
  -H "Authorization: Bearer YOUR_TOKEN"

# Backup table tertentu
curl -X POST http://localhost:3000/api/backup/table/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Melihat Daftar Backup

```bash
curl -X GET http://localhost:3000/api/backup/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Download Backup

```bash
curl -X GET http://localhost:3000/api/backup/download/backup_ksu_2025-07-14_02-00-00.sql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -O
```

### 4. Restore Database

```bash
curl -X POST http://localhost:3000/api/backup/restore/backup_ksu_2025-07-14_02-00-00.sql \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Info Backup

```bash
curl -X GET http://localhost:3000/api/backup/info \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Monitoring & Logging

### Log Files

Semua aktivitas backup dicatat dalam log aplikasi:

```
logs/application-YYYY-MM-DD.log
```

### Database Logging

Aktivitas backup juga dicatat di table `response_logs` dengan data:

```json
{
  "type": "database_backup",
  "fileName": "backup_ksu_2025-07-14_02-00-00.sql",
  "filePath": "/path/to/backup",
  "fileSize": 1024000,
  "fileSizeMB": "1.02"
}
```

## Keamanan

### Autentikasi

Semua endpoint backup memerlukan token autentikasi yang valid.

### Akses File

- File backup disimpan di direktori `/backup` dengan permission terbatas
- Download backup melalui API untuk kontrol akses

### Validasi

- Validasi nama file untuk mencegah path traversal
- Pengecekan keberadaan file sebelum operasi

## Troubleshooting

### Error: "mysqldump: command not found"

```bash
# Install MySQL client tools
sudo apt-get install mysql-client-core-8.0
```

### Error: "Access denied for user"

- Periksa credentials database di `DATABASE_URL_NEW`
- Pastikan user memiliki privilege backup

### Error: "Disk space insufficient"

- Monitor disk space dengan endpoint `/api/backup/info`
- Jalankan pembersihan backup lama

### Error Permission Denied pada direktori backup

```bash
# Set permission direktori backup
chmod 755 backup/
chown app:app backup/
```

## Best Practices

### 1. Monitoring

- Monitor disk space secara berkala
- Set up alerting untuk backup failures
- Review log backup secara rutin

### 2. Retention Policy

- Backup harian: simpan 30 hari
- Backup mingguan: simpan 3 bulan
- Backup bulanan: simpan 1 tahun

### 3. Testing

- Test restore secara berkala
- Validasi integritas backup
- Test disaster recovery procedures

### 4. Security

- Encrypt backup files untuk data sensitif
- Gunakan secure transfer untuk backup off-site
- Rotate backup encryption keys

## Support

Untuk pertanyaan atau masalah terkait sistem backup:

1. Periksa log aplikasi
2. Cek endpoint `/api/backup/info` untuk status
3. Review dokumentasi troubleshooting di atas
