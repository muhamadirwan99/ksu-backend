# 📋 Stock Opname Harian API Documentation

## Overview
API untuk sistem Stock Opname Harian yang terintegrasi dengan Tutup Kasir. Stock Opname hanya dapat dilakukan setelah Tutup Kasir selesai.

---

## 🔄 Flow Bisnis

```
1. Tutup Kasir (shift pagi/siang) ✅
   ↓
2. Cek Status SO
   ↓
3. Get List Produk untuk SO Harian
   ↓
4. User melakukan SO per produk
   ↓
5. Batch Save semua SO → Mark Tutup Kasir complete
```

---

## 📡 API Endpoints

### 1. Check SO Status
**Endpoint:** `POST /api/stock/check-so-status`

**Request Body:**
```json
{
  "tg_stocktake": "07-01-2026, 19:00"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Success check SO status",
  "data": {
    "is_tutup_kasir_done": true,
    "is_stocktake_done": false,
    "id_tutup_kasir": 123,
    "tg_tutup_kasir": "07-01-2026, 19:00",
    "shift": "siang",
    "stocktake_completed_at": null,
    "progress": {
      "completed": 0,
      "total": 150,
      "percentage": "0.00"
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Success check SO status",
  "data": {
    "is_tutup_kasir_done": false,
    "is_stocktake_done": false,
    "message": "Tutup Kasir belum dilakukan untuk tanggal ini"
  }
}
```

---

### 2. Get Products for Daily SO
**Endpoint:** `POST /api/stock/get-products-for-daily-so`

**Description:** Mendapatkan daftar produk **yang terjual di hari tersebut** untuk di-SO, dikelompokkan per divisi dengan status progress.

⚠️ **Important:** Hanya produk yang terjual di hari yang sama yang perlu di-stock opname, bukan semua produk aktif.

**Request Body:**
```json
{
  "tg_stocktake": "07-01-2026, 19:00",
  "id_tutup_kasir": 123
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Success get products for daily stock opname",
  "data": {
    "id_tutup_kasir": 123,
    "tg_stocktake": "07-01-2026, 19:00",
    "is_stocktake_done": false,
    "summary": {
      "total_products": 45,
      "completed": 25,
      "remaining": 20,
      "progress_percentage": 55.56
    },
    "divisi_list": [
      {
        "id_divisi": "DIV001",
        "nm_divisi": "Sembako",
        "products": [
          {
            "id_product": "PROD001",
            "nm_product": "Beras Premium 5kg",
            "stok_sistem": 100,
            "stok_fisik": 98,
            "selisih": -2,
            "is_done": true,
            "petugas": "admin",
            "keterangan": "2 karung bocor"
          },
          {
            "id_product": "PROD002",
            "nm_product": "Gula Pasir 1kg",
            "stok_sistem": 50,
            "stok_fisik": null,
            "selisih": null,
            "is_done": false,
            "petugas": null,
            "keterangan": null
          }
        ]
      },
      {
        "id_divisi": "DIV002",
        "nm_divisi": "Minuman",
        "products": [...]
      }
    ]
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Harap lakukan Tutup Kasir terlebih dahulu sebelum melakukan Stock Opname"
}
```

---

### 3. Batch Save Daily SO
**Endpoint:** `POST /api/stock/batch-save-daily-so`

**Description:** Menyimpan SO untuk semua produk sekaligus. Akan update jumlah stock di produk, simpan data SO, dan mark tutup kasir sebagai complete.

**Request Body:**
```json
{
  "tg_stocktake": "07-01-2026, 19:00",
  "id_tutup_kasir": 123,
  "username": "admin",
  "name": "Administrator",
  "products": [
    {
      "id_product": "PROD001",
      "nm_product": "Beras Premium 5kg",
      "stok_awal": 100,
      "stok_akhir": 98,
      "keterangan": "2 karung bocor"
    },
    {
      "id_product": "PROD002",
      "nm_product": "Gula Pasir 1kg",
      "stok_awal": 50,
      "stok_akhir": 50,
      "keterangan": ""
    },
    {
      "id_product": "PROD003",
      "nm_product": "Minyak Goreng 2L",
      "stok_awal": 75,
      "stok_akhir": 80,
      "keterangan": "Ada tambahan dari supplier"
    }
  ]
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Stock opname harian successfully saved",
  "data": {
    "total_products": 45,
    "id_tutup_kasir": 123,
    "completed_at": "2026-01-07T19:05:30.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Stock Opname untuk tanggal ini sudah selesai dan dikonfirmasi"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Semua produk yang terjual harus di-stock opname. Total produk terjual: 45, produk yang di-SO: 40"
}
```

---

### 4. Create Stock Take (Single Product)
**Endpoint:** `POST /api/stock/create-stock-opname`

**Description:** Untuk menyimpan SO per produk (single). Sekarang dengan validasi Tutup Kasir.

**Request Body:**
```json
{
  "tg_stocktake": "07-01-2026, 19:00",
  "id_product": "PROD001",
  "nm_product": "Beras Premium 5kg",
  "stok_awal": 100,
  "stok_akhir": 98,
  "username": "admin",
  "name": "Administrator"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Stock opname successfully registered",
  "data": {
    "id_stocktake": 456,
    "tg_stocktake": "07-01-2026, 19:00",
    "id_product": "PROD001",
    "nm_product": "Beras Premium 5kg",
    "stok_awal": 100,
    "stok_akhir": 98,
    "selisih": -2,
    "username": "admin",
    "name": "Administrator",
    "id_tutup_kasir": 123,
    "is_confirmed": false,
    "keterangan": null,
    "created_at": "2026-01-07T19:03:00.000Z"
  }
}
```

---

## 🗄️ Database Changes

### Tabel `tutup_kasir`
**Kolom Baru:**
- `is_stocktake_done` (BOOLEAN, default: false) - Flag SO sudah selesai
- `stocktake_completed_at` (TIMESTAMP, nullable) - Waktu SO diselesaikan
- Relasi ke tabel `stocktake`

### Tabel `stocktake`
**Kolom Baru:**
- `id_tutup_kasir` (INT, nullable) - Foreign key ke tutup_kasir
- `is_confirmed` (BOOLEAN, default: false) - Flag konfirmasi SO
- `keterangan` (TEXT, nullable) - Catatan/keterangan SO

---

## ⚠️ Business Rules

### 1. Validasi Tutup Kasir
- SO hanya dapat dilakukan SETELAH Tutup Kasir
- Jika belum tutup kasir, akan error: "Harap lakukan Tutup Kasir terlebih dahulu"

### 2. Validasi SO Sudah Selesai
- Jika `is_stocktake_done = true`, tidak bisa SO lagi
- Error: "Stock Opname untuk tanggal ini sudah selesai dan dikonfirmasi"

### 3. Validasi All Products
- Pada batch save, SEMUA produk **yang terjual di hari tersebut** harus di-SO
- Hanya produk yang ada di transaksi penjualan hari itu yang perlu di-SO
- Jika kurang, error dengan detail berapa yang kurang

### 4. Transaction Safety
- Semua operasi menggunakan database transaction
- Jika ada error, semua perubahan di-rollback

### 5. Auto Update Stock
- Setiap SO akan update `jumlah` di tabel `product`
- Menggunakan `stok_akhir` dari hasil SO

---

## 🔐 Authorization
Semua endpoint membutuhkan:
- Header: `Authorization: Bearer {token}`
- User harus login
- Role harus punya akses `sts_stocktake_harian = true`

---

## 📊 Example Use Case

### Scenario: SO Harian Shift Siang

```javascript
// 1. Cek status SO
POST /api/stock/check-so-status
{
  "tg_stocktake": "07-01-2026, 19:00"
}

// 2. Get list produk untuk di-SO
POST /api/stock/get-products-for-daily-so
{
  "tg_stocktake": "07-01-2026, 19:00",
  "id_tutup_kasir": 123
}

// 3. User melakukan counting fisik...

// 4. Save semua SO sekaligus
POST /api/stock/batch-save-daily-so
{
  "tg_stocktake": "07-01-2026, 19:00",
  "id_tutup_kasir": 123,
  "username": "admin",
  "name": "Administrator",
  "products": [
    // ... semua 150 produk dengan stok_akhir
  ]
}
```

---

## 🐛 Error Handling

| Error Code | Message | Cause |
|------------|---------|-------|
| 400 | Harap lakukan Tutup Kasir terlebih dahulu... | Tutup Kasir belum dilakukan |
| 400 | Stock Opname untuk tanggal ini sudah selesai... | SO sudah dikonfirmasi |
| 400 | Semua produk yang terjual harus di-stock opname... | Tidak semua produk terjual di-SO |
| 400 | Beberapa produk tidak ditemukan... | Product ID tidak valid |
| 404 | Product is not found | Product tidak ada |
| 401 | Unauthorized | Token tidak valid |

---

## 🧪 Testing Checklist

- [ ] Test SO tanpa Tutup Kasir dulu (should error)
- [ ] Test SO dengan Tutup Kasir yang sudah di-SO (should error)
- [ ] Test batch save dengan data lengkap (should success)
- [ ] Test batch save dengan data tidak lengkap (should error)
- [ ] Test update stock product setelah SO
- [ ] Test transaction rollback jika ada error
- [ ] Test perhitungan selisih positif dan negatif
- [ ] Test progress percentage calculation
- [ ] Test dengan multiple divisi

---

## 🚀 Next Steps (Medium Priority)

1. **Progress Tracker Real-time** - WebSocket untuk update progress
2. **Warning untuk Selisih Besar** - Alert jika selisih > threshold
3. **Auto-save Draft** - Simpan progress SO sebelum final
4. **Export Report** - Export hasil SO ke Excel/PDF
5. **Dashboard Analytics** - Grafik trend selisih SO

---

## 📞 Support

Jika ada pertanyaan atau issue, hubungi tim development.

**Last Updated:** 07 Januari 2026
