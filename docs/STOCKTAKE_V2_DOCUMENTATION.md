# Stocktake V2 - Advanced Inventory Counting System

## 📋 Overview

Stocktake V2 adalah sistem penghitungan stok fisik yang canggih dengan workflow state machine, blind counting untuk mencegah manipulasi, dan intelligent to-do list generation.

## 🎯 Key Features

### 1. **Pre-condition Validation**

- Validasi Tutup Kasir sebelum memulai stocktake
- Pastikan tidak ada transaksi pending atau hold
- Cegah duplikasi stocktake untuk shift yang sama

### 2. **Smart Cycle Count (Stocktake Harian)**

- Auto-generate to-do list berdasarkan:
  - Produk dengan transaksi di shift tersebut (penjualan/pembelian)
  - Produk high-risk yang wajib dihitung (configurable list)
- Berbasis **Session/Shift ID** bukan tanggal kalender
- Optimized untuk efisiensi - hanya hitung yang penting

### 3. **Wall-to-Wall Count (Stocktake Bulanan)**

- Menghitung **semua produk aktif** di database
- Support filtering & pagination untuk manage data besar
- Bisa di-filter per kategori, divisi, atau rak

### 4. **Blind Count Mechanism**

- UI menyembunyikan stok sistem dari kasir
- Mencegah bias dan manipulasi data
- Local storage support untuk offline capability

### 5. **Workflow State Machine**

```
DRAFT (Kasir Count)
  ↓ Submit
SUBMITTED (Menunggu Review)
  ↓ Review
APPROVE → Finalize → COMPLETED (Stock Updated)
  OR
REQUEST_REVISION → REVISION (Hitung Ulang)
```

### 6. **Inventory Adjustment Tracking**

- Automatic stock update setelah finalize
- Detailed adjustment logs dengan value impact
- Audit trail lengkap untuk compliance

---

## 📊 Database Structure

### Tables

#### 1. **stocktake_sessions_v2**

Master table untuk setiap sesi stocktake.

| Field                | Type         | Description                                      |
| -------------------- | ------------ | ------------------------------------------------ |
| id_stocktake_session | VARCHAR(30)  | Format: ST-YYYYMMDD-HHMMSS                       |
| stocktake_type       | ENUM         | HARIAN atau BULANAN                              |
| status               | ENUM         | DRAFT, SUBMITTED, REVISION, COMPLETED, CANCELLED |
| id_tutup_kasir       | INT          | FK ke tutup_kasir                                |
| shift                | VARCHAR(20)  | Shift terkait                                    |
| username_kasir       | VARCHAR(100) | Kasir yang melakukan count                       |
| username_reviewer    | VARCHAR(100) | Manajer yang review                              |
| total_items          | INT          | Total produk yang harus dihitung                 |
| total_counted        | INT          | Total produk yang sudah dihitung                 |
| total_variance       | INT          | Total selisih (absolut)                          |

#### 2. **stocktake_items_v2**

Detail item per produk dalam satu sesi.

| Field                | Type         | Description                             |
| -------------------- | ------------ | --------------------------------------- |
| id_stocktake_item    | INT          | Auto increment PK                       |
| id_stocktake_session | VARCHAR(30)  | FK ke sessions                          |
| id_product           | VARCHAR(100) | FK ke products                          |
| stok_sistem          | INT          | Stok di database saat stocktake dimulai |
| stok_fisik           | INT          | Input dari kasir (nullable)             |
| selisih              | INT          | stok_fisik - stok_sistem                |
| is_counted           | BOOLEAN      | Sudah dihitung atau belum               |
| is_flagged           | BOOLEAN      | Di-flag untuk review/hitung ulang       |
| is_high_risk         | BOOLEAN      | Termasuk barang high risk               |
| has_transaction      | BOOLEAN      | Ada transaksi di shift ini              |

#### 3. **stocktake_high_risk_products**

Configurable list produk high-risk yang wajib dihitung.

| Field        | Type         | Description                      |
| ------------ | ------------ | -------------------------------- |
| id_high_risk | INT          | Auto increment PK                |
| id_product   | VARCHAR(100) | FK ke products (unique)          |
| category     | VARCHAR(100) | Kategori (rokok, kopi, gas, dll) |
| reason       | TEXT         | Alasan kenapa high risk          |
| is_active    | BOOLEAN      | Bisa di-nonaktifkan tanpa hapus  |

#### 4. **stocktake_adjustment_logs**

Audit trail setiap adjustment stok setelah finalize.

| Field                | Type         | Description                  |
| -------------------- | ------------ | ---------------------------- |
| id_adjustment        | INT          | Auto increment PK            |
| id_stocktake_session | VARCHAR(30)  | FK ke sessions               |
| id_product           | VARCHAR(100) | Produk yang di-adjust        |
| stok_before          | INT          | Stok sebelum adjustment      |
| stok_after           | INT          | Stok setelah adjustment      |
| adjustment_qty       | INT          | Jumlah adjustment (+/-)      |
| nilai_adjustment     | DECIMAL      | adjustment_qty \* harga_beli |
| adjusted_by          | VARCHAR(100) | Username reviewer            |

---

## 🔌 API Endpoints

### Base URL: `/api/stocktake/v2`

### Session Management

#### 1. Create Stocktake Session

```http
POST /sessions
Authorization: Bearer {token}

Request Body:
{
  "stocktake_type": "HARIAN", // or "BULANAN"
  "id_tutup_kasir": 123,
  "notes_kasir": "Optional notes"
}

Response 201:
{
  "success": true,
  "message": "Stocktake session created successfully",
  "data": {
    "id_stocktake_session": "ST-20260108-143025",
    "stocktake_type": "HARIAN",
    "status": "DRAFT",
    "total_items": 45,
    ...
  }
}
```

#### 2. Get Stocktake Sessions (List with Filters)

```http
GET /sessions?stocktake_type=HARIAN&status=DRAFT&page=1&limit=20
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Stocktake sessions retrieved successfully",
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

#### 3. Get Session Details

```http
GET /sessions/:sessionId
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "id_stocktake_session": "ST-20260108-143025",
    "status": "DRAFT",
    "statistics": {
      "total_items": 45,
      "counted_items": 30,
      "pending_items": 15,
      "flagged_items": 2,
      "total_variance": 10,
      "progress_percentage": "66.67"
    },
    ...
  }
}
```

### Item Management

#### 4. Get Stocktake Items

```http
GET /sessions/:sessionId/items?is_counted=false&is_high_risk=true&page=1&limit=50
Authorization: Bearer {token}

Query Parameters:
- is_counted: boolean (filter counted/uncounted)
- is_flagged: boolean (filter flagged items)
- is_high_risk: boolean (filter high risk items)
- has_variance: boolean (filter items with variance)
- page: integer (default: 1)
- limit: integer (default: 50, max: 500)

Response 200:
{
  "success": true,
  "data": {
    "data": [
      {
        "id_stocktake_item": 1,
        "id_product": "P001",
        "nm_product": "Marlboro Merah",
        "stok_sistem": 50,
        "stok_fisik": null,
        "is_counted": false,
        "is_high_risk": true,
        ...
      }
    ],
    "pagination": {...}
  }
}
```

#### 5. Update Single Item (Blind Count)

```http
PATCH /items/:itemId
Authorization: Bearer {token}

Request Body:
{
  "stok_fisik": 48,
  "notes": "Ada 2 bungkus rusak"
}

Response 200:
{
  "success": true,
  "message": "Stocktake item updated successfully",
  "data": {
    "id_stocktake_item": 1,
    "stok_sistem": 50,
    "stok_fisik": 48,
    "selisih": -2,
    "is_counted": true,
    ...
  }
}
```

#### 6. Batch Update Items

```http
PATCH /sessions/:sessionId/items/batch
Authorization: Bearer {token}

Request Body:
{
  "items": [
    {
      "id_stocktake_item": 1,
      "stok_fisik": 48,
      "notes": "Optional"
    },
    {
      "id_stocktake_item": 2,
      "stok_fisik": 100
    }
  ]
}

Response 200:
{
  "success": true,
  "message": "Stocktake items batch updated successfully",
  "data": {
    "updated_count": 2,
    "items": [...]
  }
}
```

### Workflow Actions

#### 7. Submit Stocktake

```http
POST /sessions/:sessionId/submit
Authorization: Bearer {token}

Request Body:
{
  "notes_kasir": "Semua sudah dihitung dengan teliti"
}

Response 200:
{
  "success": true,
  "message": "Stocktake submitted successfully",
  "data": {
    "status": "SUBMITTED",
    "submitted_at": "2026-01-08T14:45:00.000Z",
    ...
  }
}
```

#### 8. Review Stocktake (Manajer)

```http
POST /sessions/:sessionId/review
Authorization: Bearer {token}

# APPROVE
Request Body:
{
  "action": "APPROVE",
  "notes_reviewer": "Data valid, siap difinalize"
}

# REQUEST REVISION
Request Body:
{
  "action": "REQUEST_REVISION",
  "notes_reviewer": "Ada selisih mencurigakan, mohon hitung ulang",
  "revision_items": [
    {
      "id_stocktake_item": 5,
      "flag_reason": "Selisih terlalu besar (-50 unit)"
    }
  ]
}

Response 200:
{
  "success": true,
  "message": "Stocktake reviewed successfully",
  "data": {...}
}
```

#### 9. Finalize Stocktake

```http
POST /sessions/:sessionId/finalize
Authorization: Bearer {token}

Request Body:
{
  "confirmation": true,
  "notes_reviewer": "Stock master updated"
}

Response 200:
{
  "success": true,
  "message": "Stocktake finalized successfully",
  "data": {
    "status": "COMPLETED",
    "adjustments_count": 15,
    "adjustments": [
      {
        "id_product": "P001",
        "stok_before": 50,
        "stok_after": 48,
        "adjustment_qty": -2,
        "nilai_adjustment": -50000,
        ...
      }
    ]
  }
}
```

#### 10. Cancel Stocktake

```http
POST /sessions/:sessionId/cancel
Authorization: Bearer {token}

Request Body:
{
  "cancel_reason": "Alasan pembatalan minimal 10 karakter"
}

Response 200:
{
  "success": true,
  "message": "Stocktake cancelled successfully",
  "data": {
    "status": "CANCELLED",
    ...
  }
}
```

### Reports & Logs

#### 11. Get Adjustment Logs

```http
GET /sessions/:sessionId/adjustments
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Adjustment logs retrieved successfully",
  "data": [...]
}
```

### High Risk Product Management

#### 12. Get High Risk Products

```http
GET /high-risk-products?is_active=true&category=rokok
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [...]
}
```

#### 13. Add High Risk Product

```http
POST /high-risk-products
Authorization: Bearer {token}

Request Body:
{
  "id_product": "P001",
  "category": "rokok",
  "reason": "Produk dengan nilai tinggi dan rawan pencurian"
}

Response 201:
{
  "success": true,
  "message": "High risk product added successfully",
  "data": {...}
}
```

#### 14. Update High Risk Product

```http
PATCH /high-risk-products/:id
Authorization: Bearer {token}

Request Body:
{
  "category": "kopi",
  "reason": "Updated reason",
  "is_active": true
}

Response 200:
{
  "success": true,
  "message": "High risk product updated successfully",
  "data": {...}
}
```

#### 15. Delete High Risk Product

```http
DELETE /high-risk-products/:id
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "High risk product deleted successfully"
}
```

---

## 🔄 Workflow Examples

### Example 1: Stocktake Harian (Happy Path)

```javascript
// 1. Kasir tutup kasir
POST /api/tutup-kasir
// id_tutup_kasir: 123

// 2. Create stocktake session
POST /api/stocktake/v2/sessions
{
  "stocktake_type": "HARIAN",
  "id_tutup_kasir": 123
}
// Response: id_stocktake_session: "ST-20260108-143025"

// 3. Get items to count (blind - tanpa lihat stok sistem)
GET /api/stocktake/v2/sessions/ST-20260108-143025/items?is_counted=false

// 4. Kasir input stok fisik (batch update)
PATCH /api/stocktake/v2/sessions/ST-20260108-143025/items/batch
{
  "items": [
    { "id_stocktake_item": 1, "stok_fisik": 48 },
    { "id_stocktake_item": 2, "stok_fisik": 100 },
    ...
  ]
}

// 5. Submit ke reviewer
POST /api/stocktake/v2/sessions/ST-20260108-143025/submit
{ "notes_kasir": "Semua sudah dihitung" }

// 6. Manajer review
POST /api/stocktake/v2/sessions/ST-20260108-143025/review
{
  "action": "APPROVE",
  "notes_reviewer": "Data valid"
}

// 7. Finalize (update stock master)
POST /api/stocktake/v2/sessions/ST-20260108-143025/finalize
{
  "confirmation": true,
  "notes_reviewer": "Stock updated"
}
```

### Example 2: Stocktake with Revision

```javascript
// ... steps 1-5 sama dengan Example 1

// 6. Manajer request revision
POST /api/stocktake/v2/sessions/ST-20260108-143025/review
{
  "action": "REQUEST_REVISION",
  "notes_reviewer": "Ada selisih mencurigakan",
  "revision_items": [
    {
      "id_stocktake_item": 5,
      "flag_reason": "Selisih -50 unit terlalu besar"
    }
  ]
}
// Status berubah ke REVISION

// 7. Kasir hitung ulang item yang di-flag
GET /api/stocktake/v2/sessions/ST-20260108-143025/items?is_flagged=true

PATCH /api/stocktake/v2/items/5
{
  "stok_fisik": 45,
  "notes": "Sudah dihitung ulang dengan teliti"
}

// 8. Submit lagi
POST /api/stocktake/v2/sessions/ST-20260108-143025/submit

// 9. Review lagi -> Approve -> Finalize
```

---

## ⚙️ Configuration

### High Risk Products

Tambahkan produk ke high risk list untuk memastikan produk tersebut **WAJIB** dihitung di Stocktake Harian:

```javascript
// Tambah rokok sebagai high risk
POST /api/stocktake/v2/high-risk-products
{
  "id_product": "P001",
  "category": "rokok",
  "reason": "Nilai tinggi, rawan pencurian"
}

// Tambah gas sebagai high risk
POST /api/stocktake/v2/high-risk-products
{
  "id_product": "P050",
  "category": "gas",
  "reason": "Stok kritis, harus akurat"
}
```

---

## 🔒 Security & Permissions

### Role-Based Access Control

Tambahkan field baru di table `roles`:

- `sts_stocktake_v2_kasir`: Boolean (akses kasir untuk input blind count)
- `sts_stocktake_v2_reviewer`: Boolean (akses manajer untuk review & finalize)

### Validation Rules

1. **Create Session**: Hanya kasir yang sudah tutup kasir
2. **Update Items**: Hanya kasir yang create session tersebut
3. **Submit**: Semua item harus sudah dihitung
4. **Review**: Hanya manajer/reviewer
5. **Finalize**: Hanya manajer/reviewer, dan status harus SUBMITTED
6. **Cancel**: Tidak bisa cancel session yang sudah COMPLETED

---

## 📈 Performance Optimization

### Indexing Strategy

Database sudah di-index pada:

- `id_stocktake_session` untuk join operations
- `status` untuk filtering sessions
- `is_counted`, `is_flagged` untuk filtering items
- `tg_stocktake` untuk date range queries

### Pagination

- Sessions: Default 20 per page
- Items: Default 50 per page (max 500)

### Batch Operations

Gunakan batch update untuk mengurangi network roundtrips:

```javascript
// GOOD: Batch update
PATCH /sessions/:id/items/batch
{ "items": [10 items] } // 1 request

// BAD: Individual updates
PATCH /items/1 { ... } // 10 requests
PATCH /items/2 { ... }
...
```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] Service: generateHarianToDoList()
- [ ] Service: generateBulananToDoList()
- [ ] Service: validateStocktakePrerequisites()
- [ ] Service: updateSessionStatistics()

### Integration Tests

- [ ] Create session dengan tutup kasir valid
- [ ] Create session dengan tutup kasir invalid (harus error)
- [ ] Blind count workflow (kasir tidak lihat stok sistem)
- [ ] Submit dengan item yang belum selesai (harus error)
- [ ] Review: Approve path
- [ ] Review: Revision path
- [ ] Finalize: Stock master updated correctly
- [ ] Adjustment logs created

### Edge Cases

- [ ] Stocktake melewati tengah malam (shift-based, bukan date-based)
- [ ] Concurrent stocktake untuk shift berbeda
- [ ] Duplikasi stocktake untuk shift yang sama (harus ditolak)
- [ ] Cancel session di berbagai status
- [ ] Offline mode (local storage) untuk kasir

---

## 📝 Migration Notes

Migration file: `20260108010957_add_stocktake_v2_module`

### Applied Changes:

1. Created 4 new tables
2. Created 2 new enums (StocktakeType, StocktakeStatus)
3. Added relations to existing tables (Product, TutupKasir)
4. Added proper indexes for performance

### Rollback Strategy:

Jika perlu rollback:

```bash
npx prisma migrate resolve --rolled-back 20260108010957_add_stocktake_v2_module
```

---

## 🚀 Deployment Checklist

- [x] Database migration applied
- [x] Prisma client generated
- [x] API routes registered
- [ ] Role permissions updated di database
- [ ] Frontend UI untuk blind count
- [ ] Local storage implementation
- [ ] Testing di production-like environment
- [ ] Documentation untuk end users
- [ ] Training untuk kasir dan manajer

---

## 🐛 Troubleshooting

### Issue: "Sudah ada stocktake aktif untuk shift ini"

**Solution**: Pastikan stocktake sebelumnya sudah di-finalize atau di-cancel.

### Issue: "Tidak dapat mengupdate item. Status session: SUBMITTED"

**Solution**: Kasir hanya bisa update item saat status DRAFT atau REVISION.

### Issue: "Masih ada X item yang belum dihitung"

**Solution**: Semua item harus dihitung sebelum submit. Check dengan:

```
GET /sessions/:id/items?is_counted=false
```

### Issue: "Tidak dapat finalize. Status saat ini: SUBMITTED"

**Solution**: Session harus di-review dulu sebelum finalize.

---

## 📚 Related Documentation

- [BACKUP_SYSTEM.md](./BACKUP_SYSTEM.md)
- [LOGGING_GUIDE.md](./LOGGING_GUIDE.md)
- [SECURITY_INCIDENT_RESPONSE.md](./SECURITY_INCIDENT_RESPONSE.md)

---

## 👥 Contributors

Developed by: Backend Team
Date: January 8, 2026
Version: 2.0.0

---

## 📄 License

Internal use only - KSU Koperasi System
