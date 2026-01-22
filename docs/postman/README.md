# 📮 Postman Collection - Stock Verification

## 🚀 Cara Import ke Postman

### 1. Buka Postman
- Launch aplikasi Postman

### 2. Import Collection
- Klik **Import** button (kiri atas)
- Pilih file: `Stocktake_V2_Verification.postman_collection.json`
- Klik **Import**

### 3. Set Environment Variables
Sebelum testing, set variables berikut:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:3000` | Base URL API server |
| `access_token` | `your_jwt_token` | JWT token dari login |
| `product_id` | `8991002135376` | ID produk untuk testing |
| `session_id` | `ST-20260122-043705` | Session ID stock opname |

#### Cara Set Variables:
1. Klik **Environments** (kiri sidebar)
2. Create new environment: "Stocktake Dev"
3. Add variables di atas
4. Select environment di dropdown (kanan atas)

---

## 📋 Collection Contents

### 1️⃣ Verify Stock System - KAPAL API
```
GET /api/stocktake/v2/verify-stock/8991002135376
```
**Tujuan:** Verifikasi stok sistem untuk KAPAL API SPECIAL MIX SACH

**Response Example:**
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
      "is_matched": true
    },
    "transaction_history": [...],
    "verification_result": {
      "is_stock_verified": true,
      "message": "✅ Stok sistem AKURAT!"
    }
  }
}
```

---

### 2️⃣ Verify Stock System - With End Date
```
GET /api/stocktake/v2/verify-stock/8991002135376?end_date=2026-01-21
```
**Tujuan:** Verifikasi stok sampai tanggal tertentu (audit retrospektif)

**Use Case:**
- Investigasi selisih di tanggal tertentu
- Historical audit
- Forensic analysis

---

### 3️⃣ Verify Stock - Product Example 1
```
GET /api/stocktake/v2/verify-stock/{{product_id}}
```
**Tujuan:** Template untuk verify produk lain

**Cara Pakai:**
1. Ganti `{{product_id}}` dengan ID produk yang ingin diverifikasi
2. Atau set variable `product_id` di environment

**Contoh Product IDs:**
- `8991002135376` - KAPAL API SPECIAL MIX SACH
- `161467` - AMIDIS 220ML BOTOL
- `00040938` - LUMRING BASRENG
- `AB01` - ANITA BAKERY SEMUA RASA
- `8991906106250` - DJARUM 76 APEL KRETEK 12

---

### 4️⃣ Get Stocktake Sessions
```
GET /api/stocktake/v2/sessions?status=APPROVED&limit=10
```
**Tujuan:** List semua stocktake sessions

**Query Parameters:**
- `status`: DRAFT | SUBMITTED | APPROVED | REVISION | CANCELLED
- `limit`: Jumlah data per page
- `page`: Page number
- `jenis_opname`: HARIAN | MINGGUAN | BULANAN | ADHOC

---

### 5️⃣ Get Stocktake Session Details
```
GET /api/stocktake/v2/sessions/{{session_id}}
```
**Tujuan:** Detail session stock opname tertentu

**Response:**
- Session info (tanggal, status, petugas)
- Summary (total items, counted, flagged)
- High risk items count
- Valuasi

---

### 6️⃣ Get Stocktake Items
```
GET /api/stocktake/v2/sessions/{{session_id}}/items?is_high_risk=true
```
**Tujuan:** List items dalam session

**Query Parameters:**
- `is_high_risk`: true/false
- `is_counted`: true/false
- `is_flagged`: true/false
- `nm_divisi`: filter by division

---

### 7️⃣ Get Adjustment Logs
```
GET /api/stocktake/v2/sessions/{{session_id}}/adjustments
```
**Tujuan:** History adjustment untuk audit trail

---

## 🎯 Testing Workflow

### Scenario: User Tidak Percaya Stok Sistem

**Step 1: Login & Get Token**
```bash
POST /api/users/login
Body: { username, password }
Response: { token }
```
→ Copy token ke environment variable `access_token`

**Step 2: Verify Stock**
```bash
GET /api/stocktake/v2/verify-stock/8991002135376
```
→ Lihat `stock_calculation` dan `transaction_history`

**Step 3: Cross-check dengan Stock Opname**
```bash
GET /api/stocktake/v2/sessions?status=APPROVED
```
→ Cari session terakhir yang sudah diapprove

**Step 4: Lihat Detail Items**
```bash
GET /api/stocktake/v2/sessions/{session_id}/items
```
→ Cari produk yang bermasalah

**Step 5: Check Adjustment Logs**
```bash
GET /api/stocktake/v2/sessions/{session_id}/adjustments
```
→ Lihat history perubahan stok

---

## 📊 Response Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal error |

---

## 🔐 Authentication

All endpoints require JWT Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get token:**
1. Login via `/api/users/login`
2. Copy token from response
3. Set `access_token` environment variable
4. Token will be auto-added to all requests

---

## 💡 Tips

### 1. Save Responses
- Klik **Save Response** untuk example responses
- Berguna untuk dokumentasi dan comparison

### 2. Use Variables
- Jangan hardcode values
- Gunakan `{{variable}}` untuk flexibility

### 3. Test Scripts
Tambahkan di **Tests** tab:

```javascript
// Auto-save token
if (pm.response.json().data?.token) {
    pm.environment.set("access_token", pm.response.json().data.token);
}

// Verify status
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

// Verify stock is matched
pm.test("Stock is verified", function () {
    const data = pm.response.json().data;
    pm.expect(data.verification_result.is_stock_verified).to.be.true;
});
```

### 4. Pre-request Scripts
Setup before request:

```javascript
// Set dynamic end_date
const today = new Date().toISOString().split('T')[0];
pm.variables.set("end_date", today);
```

---

## 🐛 Troubleshooting

### Error: 401 Unauthorized
→ Token expired atau invalid. Login ulang.

### Error: 404 Not Found
→ Product ID atau Session ID salah. Check database.

### Error: 500 Server Error
→ Check server logs untuk detail error.

### Response kosong
→ Belum ada data stock opname. Create session dulu.

---

## 📞 Support

Jika ada masalah:
1. Check server logs
2. Verify token validity
3. Confirm product/session ID exists
4. Check database connectivity

---

**Happy Testing! 🚀**
