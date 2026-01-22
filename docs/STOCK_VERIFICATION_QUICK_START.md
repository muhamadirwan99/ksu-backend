# 🚀 Quick Start: Verifikasi Stok KAPAL API

## Contoh Real Case Anda

**Produk:** KAPAL API SPECIAL MIX SACH (8991002135376)
**Masalah:** User tidak percaya stok sistem = 26

## 1️⃣ Panggil API

```bash
curl -X GET "http://localhost:3000/api/stocktake/v2/verify-stock/8991002135376" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 2️⃣ Baca Hasilnya

### Bagian Penting yang Harus Dilihat:

#### A. Stok Calculation (Bukti Matematis)
```json
{
  "stock_calculation": {
    "starting_stock": 15,           // Stok awal (dari opname terakhir)
    "plus_purchases": 35,           // Total pembelian setelah opname
    "minus_sales": 24,              // Total penjualan setelah opname
    "plus_returns": 0,              // Total retur (barang kembali)
    "calculated_stock": 26,         // Hasil kalkulasi: 15 + 35 - 24 = 26
    "current_system_stock": 26,     // Stok di sistem saat ini
    "is_matched": true,             // ✅ COCOK!
    "difference": 0                 // Tidak ada selisih
  }
}
```

**Penjelasan ke User:**
```
Stok awal (dari opname terakhir):  15 pcs
+ Pembelian baru:                   35 pcs
- Penjualan:                        24 pcs
─────────────────────────────────────────
= STOK SISTEM SAAT INI:            26 pcs ✅

Kesimpulan: STOK SISTEM BENAR!
```

#### B. Transaction History (Bukti Detail)

Tunjukkan 5-10 transaksi terakhir:

```
TRANSAKSI TERAKHIR:
══════════════════════════════════════════════════
21 Jan, 19:30 - Penjualan (JL-21012026032)
  Kasir: KASIR1
  Qty: -2 pcs
  Stok sebelum: 28 → Stok sesudah: 26 ✅

20 Jan, 15:20 - Penjualan (JL-20012026025)
  Kasir: KASIR2
  Qty: -3 pcs
  Stok sebelum: 31 → Stok sesudah: 28

19 Jan, 14:00 - Pembelian (BL-19012026003)
  Admin: admin
  Qty: +20 pcs
  Stok sebelum: 11 → Stok sesudah: 31

... (dan seterusnya)
```

#### C. Verification Result
```json
{
  "verification_result": {
    "is_stock_verified": true,
    "message": "✅ Stok sistem AKURAT! Sesuai dengan history transaksi.",
    "recommendation": "Stok sistem dapat dipercaya. Data akurat berdasarkan audit trail."
  }
}
```

## 3️⃣ Diskusi dengan User

### Jika User Masih Tidak Percaya:

**Tanya:**
> "Coba lihat transaksi ini satu per satu. Mana yang salah?"

**Tunjukkan:**
1. Nota pembelian (cross-check dengan transaksi PEMBELIAN di history)
2. Struk penjualan (cross-check dengan transaksi PENJUALAN di history)
3. Hasil opname sebelumnya (cross-check dengan STOCK_OPNAME di history)

**Ajak:**
> "Kita cek bareng-bareng, transaksi mana yang tidak sesuai?"

### Jika Stok Fisik Benar-benar = 0:

**Kemungkinan:**
1. **Produk hilang/dicuri** (26 pcs)
2. **Salah hitung fisik** (hitung ulang)
3. **Produk dipindah** ke lokasi lain tapi tidak tercatat
4. **Expired/rusak** dan dibuang tanpa dicatat di sistem

**Solusi:**
- Lakukan **investigasi fisik**
- Cek **CCTV** jika produk hilang
- **Stock opname ulang** dengan saksi
- Catat selisih di **adjustment log**

## 4️⃣ Update Stock jika Memang Salah

Jika setelah investigasi terbukti stok fisik = 0:

```bash
# Finalize stock opname dengan stok_fisik = 0
POST /api/stocktake/v2/sessions/ST-xxx/finalize
```

Sistem akan:
- Update stok master: 26 → 0
- Catat adjustment log: -26 pcs
- Simpan alasan: "Produk hilang/dicuri"

## 📱 Frontend Implementation

Buat halaman "Verifikasi Stok" dengan tampilan:

```
┌─────────────────────────────────────────────┐
│ VERIFIKASI STOK SISTEM                      │
├─────────────────────────────────────────────┤
│ Produk: KAPAL API SPECIAL MIX SACH          │
│ ID: 8991002135376                           │
│                                             │
│ 📊 KALKULASI STOK                           │
│ ─────────────────────────────────────────── │
│ Stok Awal (Opname 15 Jan)      15 pcs      │
│ + Pembelian                    35 pcs      │
│ - Penjualan                    24 pcs      │
│ ═══════════════════════════════════════     │
│ = STOK SISTEM                  26 pcs ✅   │
│                                             │
│ 📋 HISTORY TRANSAKSI (10 terakhir)          │
│ ─────────────────────────────────────────── │
│ [Tabel transaksi di sini]                  │
│                                             │
│ ✅ STATUS: STOK AKURAT                      │
│ Data sistem sesuai dengan transaksi        │
│                                             │
│ [Download PDF] [Print] [Share]             │
└─────────────────────────────────────────────┘
```

## 🎯 Tips Komunikasi dengan User

### ❌ JANGAN:
- "Sistemnya pasti benar, kamu yang salah hitung!"
- "Data di database enggak mungkin salah"
- "Ini teknologi, pasti akurat"

### ✅ LAKUKAN:
- "Mari kita cek bareng-bareng transaksinya"
- "Ini data lengkap dari sistem, coba kita cross-check"
- "Kita punya audit trail lengkap, lihat satu per satu yuk"
- "Sistem transparan, semua tercatat. Kalau ada yang salah, kita bisa lacak"

## 💡 Key Takeaways

1. **Transparansi = Trust**: Tunjukkan semua transaksi, jangan sembunyikan data
2. **Bukti Konkret**: Berikan angka, tanggal, referensi transaksi yang jelas
3. **Kolaboratif**: Ajak user cek bareng, bukan "ngotot" sistem benar
4. **Audit Trail**: Sistem yang bisa diaudit = sistem yang dipercaya
5. **Continuous Improvement**: Dengarkan feedback, perbaiki proses

**Remember:** Trust issues = Communication issues! 🤝
