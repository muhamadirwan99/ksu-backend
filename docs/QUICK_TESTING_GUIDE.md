# 🚀 Quick Testing Guide - Stock Verification API

## 📦 Files Yang Sudah Dibuat

```
docs/postman/
├── Stocktake_V2_Verification.postman_collection.json  ← Import ini ke Postman
├── Stocktake_Development.postman_environment.json     ← Environment variables
└── README.md                                          ← Dokumentasi lengkap
```

---

## ⚡ Quick Start (5 Menit)

### 1. Import ke Postman

**Option A: Via Postman UI**
1. Buka Postman
2. Klik **Import** → Pilih file `Stocktake_V2_Verification.postman_collection.json`
3. Klik **Import** → Pilih file `Stocktake_Development.postman_environment.json`

**Option B: Via Command Line**
```bash
# Copy URL collection
curl -o collection.json https://your-repo/docs/postman/Stocktake_V2_Verification.postman_collection.json

# Import ke Postman via Newman (if installed)
newman run collection.json -e environment.json
```

---

### 2. Login & Get Token

**Request:**
```bash
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Action:** Copy token → Set di environment variable `access_token`

---

### 3. Verify Stock (Main Feature!)

**Request:**
```bash
GET http://localhost:3000/api/stocktake/v2/verify-stock/8991002135376
Authorization: Bearer {{access_token}}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product_info": {
      "id_product": "8991002135376",
      "nm_product": "KAPAL API SPECIAL MIX SACH",
      "current_system_stock": 26
    },
    "stock_calculation": {
      "starting_stock": 15,
      "plus_purchases": 35,
      "minus_sales": 24,
      "final_calculated_stock": 26,
      "is_matched": true,      ← ✅ STOCK AKURAT!
      "difference": 0
    },
    "transaction_history": [
      {
        "sequence": 0,
        "type": "STOCK_OPNAME",
        "running_stock": 15
      },
      {
        "sequence": 1,
        "type": "PEMBELIAN",
        "qty_in": 20,
        "running_stock": 35
      },
      {
        "sequence": 2,
        "type": "PENJUALAN",
        "qty_out": 3,
        "running_stock": 32
      }
      // ... more transactions
    ],
    "verification_result": {
      "is_stock_verified": true,
      "message": "✅ Stok sistem AKURAT! Sesuai dengan history transaksi."
    }
  }
}
```

---

## 🎯 Test Cases

### Case 1: Stok Akurat (Expected)
```bash
GET /api/stocktake/v2/verify-stock/8991002135376
```
**Expected:**
- `is_matched: true`
- `difference: 0`
- `message: "✅ Stok sistem AKURAT!"`

---

### Case 2: Stok Tidak Match (Anomaly)
```bash
GET /api/stocktake/v2/verify-stock/{product_with_issue}
```
**Expected:**
- `is_matched: false`
- `difference: ±X`
- `message: "⚠️ Terdapat selisih..."`

**Action:** Investigasi `transaction_history` untuk cari anomali

---

### Case 3: Historical Verification
```bash
GET /api/stocktake/v2/verify-stock/8991002135376?end_date=2026-01-21
```
**Expected:**
- Audit sampai tanggal 21 Jan saja
- Berguna untuk forensic analysis

---

### Case 4: Product Tanpa Stock Opname
```bash
GET /api/stocktake/v2/verify-stock/{new_product_id}
```
**Expected:**
- `starting_stock: 0`
- `notes: "Belum ada stock opname sebelumnya"`

---

## 🔍 Debugging Tips

### ✅ Check 1: Token Valid?
```bash
# Jika response 401 Unauthorized
# → Login ulang dan get new token
POST /api/users/login
```

### ✅ Check 2: Product Exists?
```bash
# Verify product ID di database
GET /api/products/{product_id}
```

### ✅ Check 3: Ada Transaksi?
```bash
# Check transaction summary di response
"transaction_summary": {
  "total_purchases": 0,  ← Jika semua 0, berarti belum ada transaksi
  "total_sales": 0,
  "total_returns": 0
}
```

### ✅ Check 4: Stock Opname Ada?
```bash
GET /api/stocktake/v2/sessions?status=APPROVED
# Check apakah ada session yang sudah APPROVED
```

---

## 📊 Interpret Results

### ✅ Stok Akurat
```json
{
  "is_matched": true,
  "difference": 0,
  "message": "✅ Stok sistem AKURAT!"
}
```
**Action:** Tunjukkan ke user bahwa sistem benar

---

### ⚠️ Stok Tidak Match
```json
{
  "is_matched": false,
  "difference": -5,
  "message": "⚠️ Terdapat selisih -5 antara stok sistem dan kalkulasi..."
}
```
**Action:** 
1. Check `transaction_history` untuk anomali
2. Cari transaksi yang tidak tercatat
3. Investigasi manual adjustment
4. Check kemungkinan bug sistem

---

## 💡 Pro Tips

### Tip 1: Save Common Product IDs
```javascript
// Di Postman environment, tambahkan:
{
  "kapal_api": "8991002135376",
  "amidis": "161467",
  "lumring": "00040938",
  "anita_bakery": "AB01"
}

// Usage:
GET /api/stocktake/v2/verify-stock/{{kapal_api}}
```

### Tip 2: Automated Testing
```javascript
// Di Tests tab Postman:
pm.test("Stock is verified", function () {
    const data = pm.response.json().data;
    pm.expect(data.stock_calculation.is_matched).to.be.true;
});

pm.test("No difference", function () {
    const data = pm.response.json().data;
    pm.expect(data.stock_calculation.difference).to.equal(0);
});
```

### Tip 3: Export to CSV
```javascript
// Transaction history to CSV for analysis
const transactions = pm.response.json().data.transaction_history;
const csv = transactions.map(t => 
  `${t.sequence},${t.timestamp},${t.type},${t.qty_in},${t.qty_out},${t.running_stock}`
).join('\n');
console.log(csv);
```

---

## 📱 Curl Examples

### For Terminal/Command Line Testing:

```bash
# 1. Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Verify Stock
TOKEN="your_token_here"
curl -X GET http://localhost:3000/api/stocktake/v2/verify-stock/8991002135376 \
  -H "Authorization: Bearer $TOKEN"

# 3. With End Date
curl -X GET "http://localhost:3000/api/stocktake/v2/verify-stock/8991002135376?end_date=2026-01-21" \
  -H "Authorization: Bearer $TOKEN"

# 4. Pretty Print (with jq)
curl -X GET http://localhost:3000/api/stocktake/v2/verify-stock/8991002135376 \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

## 🎬 Demo Script

**Untuk presentasi ke user yang trust issues:**

```
1. Buka Postman
2. Select "Verify Stock System - KAPAL API" request
3. Click "Send"
4. Show hasil di Pretty view:
   
   "Lihat bapak/ibu, ini data lengkapnya:"
   
   → Point ke stock_calculation:
     "Stok awal: 15
      Pembelian: +35
      Penjualan: -24
      Hasil: 26 ✅ Sama dengan sistem!"
   
   → Point ke transaction_history:
     "Ini semua transaksinya, ada 25 transaksi
      Bisa dicek satu per satu"
   
   → Point ke verification_result:
     "Sistem bilang: STOK AKURAT ✅"

5. Close: "Kalau masih ragu, coba cek nota transaksinya"
```

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Login ulang, token expired |
| 404 Not Found | Product ID salah, cek database |
| 500 Server Error | Check server logs di terminal |
| Empty response | Belum ada data, create session dulu |
| Token di-reject | Pastikan format: `Bearer {token}` |

---

**Ready to Verify! 🚀**

**Time to test:** ~5 minutes  
**Time to convince user:** ~10 minutes  
**Trust level after demo:** 📈 100%
