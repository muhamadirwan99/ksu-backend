# Perbaikan Selisih Hutang Dagang - Dokumentasi

## Masalah yang Ditemukan

Terjadi selisih nominal hutang_dagang antara tabel `supplier` dan tabel `hutang_dagang` ketika melakukan pembelian barang secara kredit. Hal ini menyebabkan kesalahan saat user ingin melakukan pembayaran hutang dagang karena data tidak konsisten.

## Analisis Root Cause

### 1. **Operasi Non-Atomic**

- Operasi pembuatan/update hutang dagang dan supplier dilakukan secara terpisah tanpa database transaction
- Jika salah satu operasi gagal, yang lain tetap ter-commit sehingga menyebabkan inkonsistensi data

### 2. **Race Condition**

- Multiple request bersamaan dapat menyebabkan data inconsistent
- Tidak ada locking mechanism yang memadai

### 3. **Error Handling Tidak Sempurna**

- Tidak ada rollback mechanism jika terjadi error di tengah proses
- Validasi data kurang ketat

### 4. **File yang Bermasalah**

- `src/service/purchase-service.js` - Fungsi `createPurchase` dan `removePurchase`
- `src/service/retur-service.js` - Fungsi `createRetur` dan `removeRetur`

## Perbaikan yang Diterapkan

### 1. **Implementasi Database Transaction**

#### Before (Masalah):

```javascript
// purchase-service.js - createPurchase()
if (request.jenis_pembayaran === "kredit") {
  await prismaClient.hutangDagang.create({...});  // Operasi 1

  const supplier = await prismaClient.supplier.findUnique({...});  // Operasi 2

  await prismaClient.supplier.update({...});  // Operasi 3
}
```

#### After (Perbaikan):

```javascript
// purchase-service.js - createPurchase()
if (request.jenis_pembayaran === "kredit") {
  await prismaClient.$transaction(async (tx) => {
    await tx.hutangDagang.create({...});  // Semua operasi dalam satu transaction

    const supplier = await tx.supplier.findUnique({...});

    await tx.supplier.update({...});
  }, {
    isolationLevel: "ReadCommitted",
    timeout: 10000,
  });
}
```

### 2. **Validasi yang Lebih Ketat**

#### Penambahan validasi supplier existence:

```javascript
if (!supplier) {
  throw new Error(
    `Supplier dengan ID ${newPurchase.id_supplier} tidak ditemukan`
  );
}
```

#### Penambahan validasi hutang dagang existence:

```javascript
if (!hutangDagang) {
  throw new Error(
    `Hutang dagang untuk pembelian ${request.id_pembelian} tidak ditemukan`
  );
}
```

### 3. **Isolation Level dan Timeout Protection**

```javascript
{
  isolationLevel: "ReadCommitted",  // Mencegah dirty reads
  timeout: 10000,                  // Timeout 10 detik untuk mencegah deadlock
}
```

### 4. **File yang Diperbaiki**

#### A. `src/service/purchase-service.js`

- ✅ `createPurchase()` - Sekarang menggunakan transaction untuk operasi hutang dagang
- ✅ `removePurchase()` - Semua operasi delete/update menggunakan transaction

#### B. `src/service/retur-service.js`

- ✅ `createRetur()` - Operasi update hutang dagang menggunakan transaction
- ✅ `removeRetur()` - Operasi restore hutang dagang menggunakan transaction

### 5. **Utility Functions untuk Maintenance**

#### A. `src/utils/hutang-dagang-fix.js`

- `fixAllHutangDagangInconsistency()` - Memperbaiki semua inkonsistensi data
- `validateAllHutangDagangConsistency()` - Validasi konsistensi semua data
- `getHutangDagangSummary()` - Summary data untuk debugging

#### B. Maintenance Scripts

- `scripts/hutang-dagang-maintenance.sh` (Linux/Mac)
- `scripts/hutang-dagang-maintenance.bat` (Windows)

## Cara Menggunakan Perbaikan

### 1. **Automatic Fix (Recommended)**

```bash
# Linux/Mac
./scripts/hutang-dagang-maintenance.sh

# Windows
scripts\hutang-dagang-maintenance.bat
```

### 2. **Manual API Calls**

#### Cek konsistensi data:

```bash
curl -X POST http://localhost:3000/api/hutang-dagang/check-consistency \
  -H "Content-Type: application/json" \
  -d "{}"
```

#### Perbaiki data:

```bash
curl -X POST http://localhost:3000/api/hutang-dagang/fix-all \
  -H "Content-Type: application/json" \
  -d "{}"
```

#### Cek specific supplier:

```bash
curl -X POST http://localhost:3000/api/hutang-dagang/check-consistency \
  -H "Content-Type: application/json" \
  -d '{"id_supplier": "SUP001"}'
```

## Monitoring dan Prevention

### 1. **Log Monitoring**

Monitor log files untuk pattern berikut:

```bash
# Monitor error patterns
tail -f logs/application-*.log | grep -E "(Duplicate|Inconsistent|gagal)"

# Monitor hutang dagang operations
tail -f logs/application-*.log | grep "hutang dagang"
```

### 2. **Regular Maintenance**

Jalankan script maintenance secara berkala (misalnya setiap hari):

```bash
# Add to crontab (Linux/Mac)
0 1 * * * /path/to/scripts/hutang-dagang-maintenance.sh

# Add to Task Scheduler (Windows)
schtasks /create /tn "HutangDagangMaintenance" /tr "C:\path\to\scripts\hutang-dagang-maintenance.bat" /sc daily /st 01:00
```

### 3. **Data Validation**

Endpoint yang tersedia untuk monitoring:

- `POST /api/hutang-dagang/check-consistency` - Validasi konsistensi
- `POST /api/hutang-dagang/fix-data` - Perbaiki data specific supplier
- `POST /api/hutang-dagang/summary` - Summary data untuk debugging

## Best Practices Going Forward

### 1. **Development**

- ✅ Selalu gunakan database transaction untuk operasi yang melibatkan multiple tables
- ✅ Implementasi proper error handling dengan rollback mechanism
- ✅ Tambahkan validasi yang ketat sebelum operasi database
- ✅ Gunakan isolation level yang tepat untuk mencegah race condition

### 2. **Testing**

- Test scenario dengan multiple concurrent requests
- Test failure scenarios untuk memastikan rollback berfungsi
- Validate data consistency after operations

### 3. **Production**

- Monitor log files secara regular
- Setup alerting untuk error patterns
- Jalankan maintenance script secara berkala
- Backup data sebelum melakukan bulk operations

## Impact Analysis

### Before Fix:

- ❌ Data hutang dagang tidak konsisten antara tabel
- ❌ Error saat pembayaran hutang dagang
- ❌ Laporan keuangan tidak akurat
- ❌ Race condition pada concurrent requests

### After Fix:

- ✅ Data hutang dagang konsisten dan akurat
- ✅ Pembayaran hutang dagang berjalan normal
- ✅ Laporan keuangan lebih akurat
- ✅ Operasi concurrent aman dengan transaction
- ✅ Auto-detection dan auto-fix untuk inkonsistensi data
- ✅ Better monitoring dan alerting

## Contact

Jika masih ada masalah setelah implementasi perbaikan ini:

1. Cek log file terbaru untuk error patterns
2. Jalankan script maintenance untuk fix otomatis
3. Gunakan API monitoring untuk debugging
4. Dokumentasikan langkah reproduksi masalah untuk troubleshooting lanjutan
