# Dokumentasi Stock Tracking & Analisis Selisih

## Overview

Fitur ini digunakan untuk melacak dan menganalisis selisih stock pada produk. Fitur ini akan menunjukkan:

- Kapan selisih mulai terjadi
- Dari aktivitas apa selisih tersebut berasal
- Kemungkinan penyebab selisih
- Rekomendasi untuk mengatasi masalah

## Kemungkinan Penyebab Selisih Stock

### 1. **Stock Take (Opname) dengan Selisih**

Saat melakukan stock opname, petugas menemukan jumlah fisik berbeda dengan jumlah di sistem.

**Penyebab:**

- Kesalahan perhitungan fisik stock
- Produk hilang/rusak tidak tercatat
- Produk keluar tanpa transaksi penjualan (kecurian, kerusakan)
- Produk masuk tanpa transaksi pembelian (sample, bonus tidak tercatat)
- Human error saat input stock take

### 2. **Transaksi Tidak Tercatat**

- Penjualan tidak diinput ke sistem
- Pembelian tidak diinput ke sistem
- Retur tidak diinput ke sistem

### 3. **Error Input Data**

- Jumlah salah saat input penjualan/pembelian
- Produk salah (input produk A, tapi barang yang keluar produk B)

### 4. **Adjustment Manual**

- Update jumlah stock langsung di database tanpa dokumentasi
- Stock correction tanpa stock take

### 5. **Gap Waktu Aktivitas**

- Jarak waktu yang terlalu lama antara stock take dapat menyebabkan ketidakakuratan

## API Endpoints

### 1. Track Stock Discrepancy

Melacak semua aktivitas yang mempengaruhi stock produk tertentu.

**Endpoint:** `POST /api/stock/track-discrepancy`

**Request Body:**

```json
{
  "id_product": "PRD001",
  "start_date": "2025-01-01", // Optional
  "end_date": "2025-10-31" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Success track stock discrepancy",
  "data": {
    "summary": {
      "id_product": "PRD001",
      "nm_product": "Nama Produk",
      "stock_current": 50,
      "stock_calculated": 58,
      "total_selisih": -8,
      "total_pembelian": 100,
      "total_penjualan": 42,
      "total_retur": 0,
      "total_stock_take": 3,
      "aktivitas_dengan_selisih": 2
    },
    "aktivitas_dengan_selisih": [
      {
        "no": 15,
        "tg_aktivitas": "2025-10-20T10:30:00Z",
        "jenis_aktivitas": "Stock Take / Opname",
        "id_transaksi": "ST-123",
        "jumlah": "-8",
        "stock_sebelum": 58,
        "stock_sesudah": 50,
        "stock_expected": 58,
        "selisih": -8,
        "keterangan": "Stock take oleh Ahmad. Selisih: -8",
        "user": "ahmad",
        "tg_stocktake": "2025-10-20"
      }
    ],
    "semua_aktivitas": [
      // Array semua aktivitas dari awal sampai akhir
      // Setiap aktivitas menunjukkan:
      // - Stock sebelum transaksi
      // - Stock sesudah transaksi
      // - Stock yang diharapkan (calculated)
      // - Selisih antara actual vs expected
    ]
  }
}
```

### 2. Find Products with Discrepancy

Mencari semua produk yang memiliki selisih pada stock take terakhir.

**Endpoint:** `POST /api/stock/find-products-with-discrepancy`

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "message": "Success find products with discrepancy",
  "data": {
    "total_product_dengan_selisih": 5,
    "products": [
      {
        "id_product": "PRD001",
        "nm_product": "Nama Produk",
        "nm_divisi": "Makanan",
        "nm_supplier": "Supplier A",
        "stock_current": 50,
        "stock_take_terakhir": {
          "tg_stocktake": "2025-10-20",
          "stok_awal": 58,
          "stok_akhir": 50,
          "selisih": -8,
          "petugas": "Ahmad",
          "created_at": "2025-10-20T10:30:00Z"
        }
      }
    ]
  }
}
```

### 3. Analyze Cause of Discrepancy

Menganalisis penyebab selisih secara detail dengan rekomendasi.

**Endpoint:** `POST /api/stock/analyze-cause-discrepancy`

**Request Body:**

```json
{
  "id_product": "PRD001",
  "start_date": "2025-01-01", // Optional
  "end_date": "2025-10-31" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Success analyze cause of discrepancy",
  "data": {
    "summary": {
      "id_product": "PRD001",
      "nm_product": "Nama Produk",
      "stock_current": 50,
      "stock_calculated": 58,
      "total_selisih": -8
    },
    "penyebab_teridentifikasi": [
      {
        "kategori": "Stock Take",
        "aktivitas": {
          "no": 15,
          "tg_aktivitas": "2025-10-20T10:30:00Z",
          "jenis_aktivitas": "Stock Take / Opname",
          "id_transaksi": "ST-123",
          "selisih": -8
        },
        "penyebab_kemungkinan": [
          "Kesalahan perhitungan fisik stock",
          "Produk hilang/rusak tidak tercatat",
          "Produk keluar tanpa transaksi penjualan",
          "Produk masuk tanpa transaksi pembelian",
          "Human error saat input stock take"
        ],
        "dampak": -8
      }
    ],
    "aktivitas_kritis": [
      // Daftar semua aktivitas yang menyebabkan selisih
    ],
    "rekomendasi": [
      "Lakukan stock opname secara berkala (minimal 1x seminggu)",
      "Pastikan setiap barang keluar/masuk dicatat dalam sistem",
      "Verifikasi ulang stock take yang memiliki selisih besar",
      "Dokumentasikan setiap adjustment manual",
      "Cross-check dengan bukti fisik (nota pembelian/penjualan)"
    ]
  }
}
```

## Cara Menggunakan

### Scenario 1: Menemukan Produk dengan Selisih 8

**Langkah 1:** Cari semua produk yang memiliki selisih

```bash
curl -X POST http://localhost:3000/api/stock/find-products-with-discrepancy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Langkah 2:** Setelah menemukan produk dengan selisih -8, track aktivitasnya

```bash
curl -X POST http://localhost:3000/api/stock/track-discrepancy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_product": "PRD001"
  }'
```

**Langkah 3:** Analisis penyebab selisih

```bash
curl -X POST http://localhost:3000/api/stock/analyze-cause-discrepancy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_product": "PRD001"
  }'
```

### Scenario 2: Investigasi Selisih pada Periode Tertentu

Jika ingin tahu selisih dimulai kapan, filter berdasarkan tanggal:

```bash
curl -X POST http://localhost:3000/api/stock/track-discrepancy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_product": "PRD001",
    "start_date": "2025-10-01",
    "end_date": "2025-10-31"
  }'
```

## Interpretasi Hasil

### Field Penting pada Response

1. **selisih**:

   - Positif (+) = Stock lebih banyak dari yang diharapkan
   - Negatif (-) = Stock kurang dari yang diharapkan

2. **stock_expected vs stock_sesudah**:

   - Jika sama = Tidak ada masalah
   - Jika berbeda = Ada selisih yang perlu diperiksa

3. **jenis_aktivitas**:
   - `Stock Take / Opname` = Paling sering menjadi sumber selisih
   - `Pembelian` = Menambah stock
   - `Penjualan` = Mengurangi stock
   - `Retur` = Mengurangi stock

### Contoh Kasus Selisih -8

Dari response, jika ditemukan:

```json
{
  "tg_aktivitas": "2025-10-20T10:30:00Z",
  "jenis_aktivitas": "Stock Take / Opname",
  "stock_sebelum": 58,
  "stock_sesudah": 50,
  "selisih": -8
}
```

**Artinya:**

- Pada tanggal 20 Oktober 2025 jam 10:30
- Dilakukan stock take
- Sistem mencatat stock seharusnya 58
- Tapi fisik hanya ditemukan 50
- Selisih: -8 (kurang 8 unit)

**Kemungkinan penyebab:**

1. 8 unit hilang/rusak tidak tercatat
2. Ada 8 unit terjual tapi tidak diinput sistem
3. Error perhitungan fisik saat stock take
4. Produk dipindahkan ke lokasi lain tanpa dokumentasi

## Best Practices

1. **Lakukan Stock Take Rutin**

   - Minimal 1x seminggu untuk produk fast-moving
   - Minimal 1x bulan untuk produk slow-moving

2. **Dokumentasi Lengkap**

   - Catat semua transaksi masuk/keluar
   - Dokumentasikan barang rusak/hilang
   - Buat catatan adjustment manual

3. **Cross-Check**

   - Bandingkan dengan nota pembelian
   - Bandingkan dengan struk penjualan
   - Verifikasi dengan CCTV jika tersedia

4. **Training Petugas**

   - Pastikan petugas paham cara input transaksi
   - Latih cara hitung stock yang benar
   - Edukasi pentingnya akurasi data

5. **Investigasi Segera**
   - Jika menemukan selisih > 5 unit, investigasi segera
   - Jangan biarkan selisih akumulasi
   - Cari sumber masalah sebelum stock take berikutnya

## Troubleshooting

### Q: Selisih terus bertambah setiap stock take

**A:** Kemungkinan ada transaksi rutin yang tidak tercatat. Periksa:

- Apakah ada barang yang sering rusak tapi tidak dicatat?
- Apakah ada penjualan offline yang tidak diinput?
- Apakah ada petugas yang lupa input transaksi?

### Q: Selisih hanya terjadi pada produk tertentu

**A:** Kemungkinan masalah spesifik pada produk tersebut:

- Produk mudah rusak/kadaluarsa
- Produk sering dicuri
- Produk sering tertukar dengan produk lain yang mirip

### Q: Real-nya tidak ada selisih, tapi sistem menunjukkan selisih

**A:** Kemungkinan error input:

- Salah input jumlah saat transaksi
- Salah pilih produk saat input
- Ada double entry
- Perlu koreksi data historis

## Support

Untuk pertanyaan lebih lanjut, hubungi tim IT atau lihat dokumentasi di:

- `/docs/STOCK_MANAGEMENT.md`
- `/docs/INVENTORY_BEST_PRACTICES.md`
