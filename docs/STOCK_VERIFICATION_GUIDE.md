# 📋 Panduan Verifikasi Stok Sistem

## 🎯 Tujuan
Fungsi ini dibuat untuk **membuktikan bahwa stok sistem akurat** dengan menampilkan **audit trail lengkap** dari semua transaksi yang mempengaruhi stok produk.

## 🔍 Cara Kerja

Sistem akan:
1. **Mengambil stok awal** dari stock opname terakhir yang sudah diapprove
2. **Menelusuri semua transaksi** (pembelian, penjualan, retur, adjustment) secara kronologis
3. **Menghitung running stock** setelah setiap transaksi
4. **Membandingkan** hasil kalkulasi dengan stok sistem saat ini
5. **Memberikan verdict**: ✅ Akurat atau ⚠️ Ada selisih

## 📡 API Endpoint

```
GET /api/stocktake/v2/verify-stock/:id_product?end_date=YYYY-MM-DD
```

### Parameters:
- `id_product` (required): ID produk yang ingin diverifikasi
- `end_date` (optional): Tanggal cutoff untuk audit (default: hari ini)

### Headers:
```
Authorization: Bearer <token>
```

## 💡 Contoh Penggunaan

### Case 1: User Tidak Percaya Stok Sistem = 26

**Situasi:**
```json
{
  "id_product": "8991002135376",
  "nm_product": "KAPAL API SPECIAL MIX SACH",
  "stok_sistem": 26,
  "stok_fisik": 0,  // User hitung manual
  "selisih": -26
}
```

**Request:**
```bash
GET /api/stocktake/v2/verify-stock/8991002135376
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "product_info": {
      "id_product": "8991002135376",
      "nm_product": "KAPAL API SPECIAL MIX SACH",
      "nm_divisi": "KOPI",
      "harga_beli": 1647,
      "harga_jual": 2000,
      "current_system_stock": 26
    },
    "audit_period": {
      "start_date": "2026-01-15T00:00:00.000Z",
      "end_date": "2026-01-22T14:30:00.000Z",
      "total_days": 7
    },
    "starting_stock": {
      "quantity": 10,
      "date": "2026-01-15T21:00:00.000Z",
      "reference": "ST-20260115-043705",
      "notes": "Dari stock opname terakhir yang diapprove"
    },
    "transaction_summary": {
      "total_purchases": 40,
      "total_purchase_transactions": 2,
      "total_sales": 24,
      "total_sale_transactions": 18,
      "total_returns": 0,
      "total_return_transactions": 0,
      "total_adjustments": 0,
      "total_adjustment_events": 0
    },
    "stock_calculation": {
      "starting_stock": 10,
      "plus_purchases": 40,
      "minus_sales": 24,
      "plus_returns": 0,
      "calculated_stock_before_adjustments": 26,
      "plus_minus_adjustments": 0,
      "final_calculated_stock": 26,
      "current_system_stock": 26,
      "is_matched": true,
      "difference": 0
    },
    "transaction_history": [
      {
        "sequence": 0,
        "timestamp": "2026-01-15T21:00:00.000Z",
        "type": "STOCK_OPNAME",
        "reference": "ST-20260115-043705",
        "description": "Stok Awal (dari Stock Opname sebelumnya)",
        "qty_in": 0,
        "qty_out": 0,
        "qty_adjustment": 0,
        "stock_before": 0,
        "stock_after": 10,
        "running_stock": 10,
        "performed_by": "admin",
        "notes": "Hasil stock opname yang sudah diapprove"
      },
      {
        "sequence": 1,
        "timestamp": "2026-01-16T08:30:00.000Z",
        "type": "PEMBELIAN",
        "reference": "BL-16012026001",
        "description": "Pembelian @ Rp 1,647",
        "qty_in": 20,
        "qty_out": 0,
        "qty_adjustment": 0,
        "stock_before": 10,
        "stock_after": 30,
        "running_stock": 30,
        "performed_by": "admin",
        "notes": "Total: Rp 32,940"
      },
      {
        "sequence": 2,
        "timestamp": "2026-01-16T10:15:00.000Z",
        "type": "PENJUALAN",
        "reference": "JL-16012026005",
        "description": "Penjualan (TUNAI) @ Rp 2,000",
        "qty_in": 0,
        "qty_out": 3,
        "qty_adjustment": 0,
        "stock_before": 30,
        "stock_after": 27,
        "running_stock": 27,
        "performed_by": "KASIR1",
        "notes": "Total: Rp 6,000"
      },
      {
        "sequence": 3,
        "timestamp": "2026-01-17T14:20:00.000Z",
        "type": "PEMBELIAN",
        "reference": "BL-17012026002",
        "description": "Pembelian @ Rp 1,647",
        "qty_in": 20,
        "qty_out": 0,
        "qty_adjustment": 0,
        "stock_before": 27,
        "stock_after": 47,
        "running_stock": 47,
        "performed_by": "admin",
        "notes": "Total: Rp 32,940"
      },
      {
        "sequence": 4,
        "timestamp": "2026-01-18T09:00:00.000Z",
        "type": "PENJUALAN",
        "reference": "JL-18012026012",
        "description": "Penjualan (QRIS) @ Rp 2,000",
        "qty_in": 0,
        "qty_out": 5,
        "qty_adjustment": 0,
        "stock_before": 47,
        "stock_after": 42,
        "running_stock": 42,
        "performed_by": "KASIR2",
        "notes": "Total: Rp 10,000"
      },
      // ... transaksi lainnya ...
      {
        "sequence": 25,
        "timestamp": "2026-01-21T19:30:00.000Z",
        "type": "PENJUALAN",
        "reference": "JL-21012026032",
        "description": "Penjualan (TUNAI) @ Rp 2,000",
        "qty_in": 0,
        "qty_out": 2,
        "qty_adjustment": 0,
        "stock_before": 28,
        "stock_after": 26,
        "running_stock": 26,
        "performed_by": "KASIR1",
        "notes": "Total: Rp 4,000"
      }
    ],
    "verification_result": {
      "is_stock_verified": true,
      "message": "✅ Stok sistem AKURAT! Sesuai dengan history transaksi.",
      "recommendation": "Stok sistem dapat dipercaya. Data akurat berdasarkan audit trail."
    }
  },
  "message": "Stock verification completed successfully"
}
```

## 📊 Penjelasan Output

### 1. **Product Info**
Informasi dasar produk yang diverifikasi.

### 2. **Audit Period**
Periode waktu yang diaudit (dari stock opname terakhir sampai sekarang).

### 3. **Starting Stock**
Stok awal berdasarkan stock opname terakhir yang sudah diapprove.

### 4. **Transaction Summary**
Ringkasan total transaksi:
- Total pembelian: +40 pcs (dari 2 transaksi)
- Total penjualan: -24 pcs (dari 18 transaksi)
- Total retur: 0 pcs
- Total adjustment: 0 pcs

### 5. **Stock Calculation**
Kalkulasi matematika:
```
Stok Awal:          10
+ Pembelian:        40
- Penjualan:        24
+ Retur:             0
= Stok Terhitung:   26
+ Adjustment:        0
= Stok Final:       26
= Stok Sistem:      26 ✅ MATCH!
```

### 6. **Transaction History**
Timeline detail semua transaksi dengan:
- Urutan (sequence)
- Timestamp
- Jenis transaksi (IN/OUT)
- Referensi transaksi (ID pembelian/penjualan)
- Qty masuk/keluar
- Running stock setelah transaksi
- Petugas yang melakukan
- Catatan tambahan

### 7. **Verification Result**
Kesimpulan audit:
- ✅ **AKURAT**: Stok sistem cocok dengan kalkulasi
- ⚠️ **ADA SELISIH**: Perlu investigasi lebih lanjut

## 🔧 Cara Membuktikan ke User

### Langkah 1: Panggil API
```bash
GET /api/stocktake/v2/verify-stock/8991002135376
```

### Langkah 2: Tunjukkan Bukti
Tampilkan ke user:

**A. Ringkasan Kalkulasi:**
```
Stok Awal (15 Jan):     10 pcs
+ Pembelian:            40 pcs
- Penjualan:            24 pcs
= STOK SISTEM SEKARANG: 26 pcs ✅
```

**B. Transaction History:**
Tampilkan timeline transaksi dalam tabel:

| No | Tanggal | Jenis | Ref | Qty | Running Stock | Petugas |
|----|---------|-------|-----|-----|---------------|---------|
| 0 | 15 Jan | Opname | ST-xxx | - | 10 | admin |
| 1 | 16 Jan | Pembelian | BL-001 | +20 | 30 | admin |
| 2 | 16 Jan | Penjualan | JL-005 | -3 | 27 | KASIR1 |
| 3 | 17 Jan | Pembelian | BL-002 | +20 | 47 | admin |
| ... | ... | ... | ... | ... | ... | ... |
| 25 | 21 Jan | Penjualan | JL-032 | -2 | **26** ✅ | KASIR1 |

**C. Kesimpulan:**
```
✅ Stok sistem = 26 pcs BENAR!
   Sesuai dengan semua transaksi yang tercatat.
   
   Jika stok fisik = 0, kemungkinan:
   1. Produk hilang/dicuri
   2. Salah hitung fisik
   3. Produk dipindah tapi tidak tercatat
```

## 🚨 Troubleshooting

### Case: Stok Tidak Match

Jika `is_matched: false`, cek:

1. **Difference positif** (+): Transaksi keluar tidak tercatat (penjualan/retur)
2. **Difference negatif** (-): Transaksi masuk tidak tercatat (pembelian)
3. **Manual adjustment** langsung ke database tanpa melalui sistem
4. **Bug sistem** atau data corruption

### Rekomendasi:
```json
{
  "recommendation": "Periksa kemungkinan: 
    (1) Transaksi yang belum tercatat, 
    (2) Manual adjustment langsung ke database, 
    (3) Bug sistem, 
    (4) Data corruption."
}
```

## 📈 Best Practices

1. **Audit Berkala**: Jalankan verifikasi setiap setelah stock opname
2. **Dokumentasi**: Screenshot hasil verifikasi untuk bukti
3. **Cross-check**: Bandingkan dengan bukti fisik (nota pembelian/penjualan)
4. **Training**: Ajarkan user cara membaca transaction history
5. **Trust Building**: Tunjukkan transparansi sistem dengan bukti konkret

## 🎯 Kesimpulan

Dengan fungsi **verifyStockSystem**, Anda bisa:
- ✅ Membuktikan stok sistem akurat dengan **data faktual**
- ✅ Menunjukkan **transparansi penuh** kepada user
- ✅ Menemukan **anomali** jika ada transaksi yang tidak tercatat
- ✅ Membangun **kepercayaan** user terhadap sistem

**Trust Issues Solved! 💪**
