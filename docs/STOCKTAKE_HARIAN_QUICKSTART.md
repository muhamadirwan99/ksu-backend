# 📦 Stock Opname Harian - Quick Start Guide

## 🚀 Quick Links

- **Full API Docs:** [STOCKTAKE_HARIAN_API.md](./STOCKTAKE_HARIAN_API.md)
- **Implementation Summary:** [STOCKTAKE_HARIAN_IMPLEMENTATION.md](./STOCKTAKE_HARIAN_IMPLEMENTATION.md)
- **Testing Guide:** [../test-stocktake-harian.js](../test-stocktake-harian.js)

---

## ✨ What's New?

### 3 New API Endpoints:

1. **Check SO Status**
   ```
   POST /api/stock/check-so-status
   ```
   Cek apakah tutup kasir sudah dilakukan dan progress SO

2. **Get Products for Daily SO**
   ```
   POST /api/stock/get-products-for-daily-so
   ```
   Get list produk **yang terjual di hari tersebut** untuk di-SO (grouped by divisi)

   ⚠️ **Hanya produk yang terjual** di hari itu yang perlu di-SO

3. **Batch Save Daily SO**
   ```
   POST /api/stock/batch-save-daily-so
   ```
   Save semua SO sekaligus dan mark tutup kasir complete

---

## 🎯 Usage Flow

```javascript
// 1. Check Status
const status = await fetch('/api/stock/check-so-status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    tg_stocktake: "07-01-2026, 19:00"
  })
});

// 2. Get Products List
const products = await fetch('/api/stock/get-products-for-daily-so', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    tg_stocktake: "07-01-2026, 19:00",
    id_tutup_kasir: 123
  })
});

// 3. User melakukan counting fisik...

// 4. Batch Save
const result = await fetch('/api/stock/batch-save-daily-so', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    tg_stocktake: "07-01-2026, 19:00",
    id_tutup_kasir: 123,
    username: "admin",
    name: "Administrator",
    products: [
      {
        id_product: "PROD001",
        nm_product: "Beras Premium 5kg",
        stok_awal: 100,
        stok_akhir: 98,
        keterangan: "2 karung bocor"
      },
      // ... semua produk aktif
    ]
  })
});
```

---

## ⚠️ Important Rules

1. **Tutup Kasir First** - SO hanya bisa dilakukan setelah tutup kasir
2. **Sold Products Only** - ⚠️ **Hanya produk yang TERJUAL di hari tersebut** yang perlu di-SO
3. **All Sold Products** - Batch save harus include SEMUA produk yang terjual
4. **One Time Only** - Setelah batch save sukses, tidak bisa SO lagi untuk tanggal yang sama
5. **Auto Update** - Stock produk otomatis ter-update dengan stok_akhir

---

## 🗄️ Database Changes

### `tutup_kasir` table:
- ✅ `is_stocktake_done` (Boolean)
- ✅ `stocktake_completed_at` (Timestamp)

### `stocktake` table:
- ✅ `id_tutup_kasir` (FK to tutup_kasir)
- ✅ `is_confirmed` (Boolean)
- ✅ `keterangan` (Text)

**Migration:** `20260106234330_add_stocktake_harian_fields`

---

## 🧪 Quick Test

```bash
# 1. Check SO Status
curl -X POST http://localhost:3000/api/stock/check-so-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"tg_stocktake": "07-01-2026, 19:00"}'

# 2. Get Products
curl -X POST http://localhost:3000/api/stock/get-products-for-daily-so \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"tg_stocktake": "07-01-2026, 19:00", "id_tutup_kasir": 1}'
```

---

## 📝 Files Changed

### Backend:
- ✅ `prisma/schema.prisma` - Database schema
- ✅ `src/validation/stock-take-harian-validation.js` - Validation
- ✅ `src/service/stock-take-service.js` - Business logic
- ✅ `src/controller/stock-take-controller.js` - Controllers
- ✅ `src/route/routes/stock-take-route.js` - Routes

### Documentation:
- ✅ `docs/STOCKTAKE_HARIAN_API.md` - Full API docs
- ✅ `docs/STOCKTAKE_HARIAN_IMPLEMENTATION.md` - Implementation summary
- ✅ `test-stocktake-harian.js` - Testing guide

---

## 🚀 Deploy Checklist

- [x] ✅ Database migration done
- [x] ✅ Prisma client generated
- [x] ✅ Code syntax validated
- [x] ✅ Service import successful
- [ ] ⏳ Manual testing
- [ ] ⏳ User acceptance testing
- [ ] ⏳ Production deployment

---

## 💡 Tips

1. **Use Batch Save** - Lebih efisien daripada satu-satu
2. **Check Status First** - Sebelum mulai SO, cek status dulu
3. **Monitor Progress** - summary.progress_percentage untuk tracking
4. **Validate Data** - Pastikan semua produk ter-count sebelum save

---

## 🐛 Common Issues

**"Harap lakukan Tutup Kasir terlebih dahulu"**
- Solution: Lakukan tutup kasir dulu

**"Stock Opname sudah selesai dan dikonfirmasi"**
- Solution: SO sudah selesai, tidak bisa ubah lagi

**"Semua produk yang terjual harus di-stock opname"**
- Solution: Ada produk yang terjual tapi belum di-SO, cek list produk yang missing

---

## 📞 Support

Jika ada masalah, cek:
1. Error logs di `logs/`
2. Database query di MySQL
3. API documentation lengkap di `STOCKTAKE_HARIAN_API.md`

---

**Version:** 1.0.0  
**Last Updated:** 07 Januari 2026  
**Status:** ✅ Ready for Testing
