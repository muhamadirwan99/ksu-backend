# Troubleshooting Guide - Hutang Dagang

## Masalah yang Diidentifikasi

### 1. Race Condition

**Gejala**: Data hutang dagang hilang dari list tetapi masih ada di daftar pembelian, dan tidak muncul di riwayat pelunasan.

**Penyebab**:

- Multiple request bersamaan ke endpoint pembayaran hutang dagang
- Operasi database tidak atomic (tidak menggunakan transaction)
- Tidak ada mekanisme untuk mencegah duplicate request

**Solusi yang Diterapkan**:

- ✅ Menggunakan database transaction dengan isolation level `ReadCommitted`
- ✅ Menambahkan middleware `requestDeduplication` untuk mencegah duplicate request
- ✅ Menambahkan timeout protection (10 detik)
- ✅ Validasi lebih ketat sebelum operasi database

### 2. Inkonsistensi Data

**Gejala**: Total hutang di tabel supplier tidak sesuai dengan sum hutang di tabel hutang_dagang.

**Penyebab**:

- Operasi update yang tidak atomic
- Error handling yang tidak sempurna
- Concurrent access tanpa locking

**Solusi yang Diterapkan**:

- ✅ Validasi konsistensi data setelah setiap transaksi
- ✅ Audit trail untuk tracking perubahan data
- ✅ Endpoint monitoring untuk deteksi masalah
- ✅ Fungsi auto-fix untuk memperbaiki inkonsistensi

## Endpoint Baru untuk Monitoring

### 1. Check Consistency

```
POST /api/hutang-dagang/check-consistency
Body: { "id_supplier": "SUP001" } // optional
```

Mengecek konsistensi data antara tabel hutang_dagang dan supplier.

### 2. Fix Data

```
POST /api/hutang-dagang/fix-data
Body: { "id_supplier": "SUP001" } // required
```

Memperbaiki inkonsistensi data dengan menghitung ulang total hutang.

### 3. Summary

```
POST /api/hutang-dagang/summary
Body: { "id_supplier": "SUP001" } // optional
```

Menampilkan ringkasan data hutang dagang untuk debugging.

## Log Monitoring

### Log Patterns untuk Deteksi Masalah

1. **Duplicate Request**:

```
"Duplicate request detected"
```

2. **Data Inconsistency**:

```
"Inconsistent hutang dagang data detected"
"Data inconsistency detected after payment"
```

3. **Transaction Errors**:

```
"Pembayaran hutang dagang gagal"
```

### Monitoring dengan Log Files

Gunakan command berikut untuk monitoring real-time:

```bash
# Monitor error patterns
tail -f logs/application-*.log | grep -E "(Duplicate|Inconsistent|gagal)"

# Monitor pembayaran hutang dagang
tail -f logs/application-*.log | grep "hutang dagang"
```

## Pencegahan di Development

### 1. Testing Race Condition

```javascript
// Test concurrent requests
const promises = [];
for (let i = 0; i < 5; i++) {
  promises.push(
    fetch("/api/hutang-dagang/bayar-hutang-dagang", {
      method: "POST",
      body: JSON.stringify(samePaymentData),
      headers: { "Content-Type": "application/json" },
    })
  );
}

await Promise.all(promises);
// Hanya 1 request yang harus berhasil, sisanya return error 409
```

### 2. Validasi Manual

```bash
# Cek konsistensi semua supplier
curl -X POST http://localhost:3000/api/hutang-dagang/check-consistency \
  -H "Content-Type: application/json" \
  -d "{}"

# Fix data supplier tertentu
curl -X POST http://localhost:3000/api/hutang-dagang/fix-data \
  -H "Content-Type: application/json" \
  -d '{"id_supplier": "SUP001"}'
```

## Best Practices

### 1. Untuk Frontend

- Disable button setelah submit
- Implement loading state
- Tidak retry otomatis pada error 409 (duplicate request)
- Implement proper error handling

### 2. Untuk Backend

- Selalu gunakan database transaction untuk operasi yang melibatkan multiple table
- Implement proper logging untuk debugging
- Regular monitoring konsistensi data
- Backup data sebelum operasi critical

### 3. Untuk Database

- Regular backup
- Monitor deadlock dan long-running transaction
- Index yang tepat untuk performa optimal

## Recovery Steps

Jika terjadi masalah inkonsistensi data:

1. **Identifikasi Supplier yang Bermasalah**:

```bash
curl -X POST http://localhost:3000/api/hutang-dagang/check-consistency
```

2. **Perbaiki Data**:

```bash
curl -X POST http://localhost:3000/api/hutang-dagang/fix-data \
  -d '{"id_supplier": "SUPPLIER_ID"}'
```

3. **Verifikasi Perbaikan**:

```bash
curl -X POST http://localhost:3000/api/hutang-dagang/summary \
  -d '{"id_supplier": "SUPPLIER_ID"}'
```

4. **Monitor Log** untuk memastikan tidak ada error lanjutan.

## Contact

Jika masalah masih berlanjut setelah implementasi perbaikan ini, silakan:

1. Cek log file terbaru
2. Jalankan endpoint monitoring
3. Dokumentasikan langkah-langkah reproduksi masalah
