# Stocktake V2 - Quick Start Guide

## 🚀 Quick Start

### 1. Prerequisites

Pastikan sudah:

- ✅ Migration database applied (`npx prisma migrate dev`)
- ✅ Prisma client generated (`npx prisma generate`)
- ✅ Server running (`npm start`)

### 2. Setup High Risk Products

Tambahkan produk-produk yang WAJIB dihitung setiap hari:

```bash
# Example: Tambah rokok sebagai high risk
curl -X POST http://localhost:3000/api/stocktake/v2/high-risk-products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_product": "P001",
    "category": "rokok",
    "reason": "Nilai tinggi, rawan pencurian"
  }'
```

### 3. Basic Workflow

#### Step 1: Tutup Kasir

```bash
POST /api/tutup-kasir
{
  "shift": "Pagi",
  "username": "kasir01",
  ...
}
# Save the id_tutup_kasir
```

#### Step 2: Create Stocktake Session

```bash
POST /api/stocktake/v2/sessions
{
  "stocktake_type": "HARIAN",
  "id_tutup_kasir": 123
}
# Response: id_stocktake_session: "ST-20260108-143025"
```

#### Step 3: Get Items to Count

```bash
GET /api/stocktake/v2/sessions/ST-20260108-143025/items?is_counted=false
# UI: JANGAN tampilkan stok_sistem ke kasir (blind count)
```

#### Step 4: Count Items

```bash
PATCH /api/stocktake/v2/items/1
{
  "stok_fisik": 48
}
```

#### Step 5: Submit

```bash
POST /api/stocktake/v2/sessions/ST-20260108-143025/submit
{
  "notes_kasir": "Semua sudah dihitung"
}
```

#### Step 6: Review (Manajer)

```bash
POST /api/stocktake/v2/sessions/ST-20260108-143025/review
{
  "action": "APPROVE",
  "notes_reviewer": "Data valid"
}
```

#### Step 7: Finalize

```bash
POST /api/stocktake/v2/sessions/ST-20260108-143025/finalize
{
  "confirmation": true
}
# Stock master akan otomatis terupdate
```

---

## 📊 Key Differences: HARIAN vs BULANAN

| Feature    | HARIAN (Smart Cycle)        | BULANAN (Wall-to-Wall) |
| ---------- | --------------------------- | ---------------------- |
| Scope      | Produk bergerak + High risk | Semua produk aktif     |
| To-Do List | Auto-generated (smart)      | All SKUs               |
| Frequency  | Daily                       | Monthly                |
| Duration   | 15-30 menit                 | 2-4 jam                |
| Based on   | Shift/Session ID            | Calendar date          |

---

## 🔑 Key Concepts

### 1. Blind Count

Kasir **TIDAK boleh** melihat `stok_sistem` saat menghitung. UI harus hide field ini.

```javascript
// GOOD ✅
<input
  type="number"
  placeholder="Masukkan jumlah fisik"
  // stok_sistem TIDAK ditampilkan
/>

// BAD ❌
<div>Stok Sistem: {item.stok_sistem}</div>
<input type="number" />
```

### 2. Session-Based (bukan Date-Based)

Stocktake diikat ke **Shift/Session**, bukan tanggal kalender. Ini memungkinkan:

- Stocktake dimulai jam 23:00 dan selesai jam 01:00 (ganti hari)
- Tetap valid karena berbasis session yang sama

### 3. State Machine

Status harus mengikuti flow:

```
DRAFT → SUBMITTED → (APPROVED) → COMPLETED
         ↓ (or)
      REVISION → DRAFT → ...
```

Tidak bisa loncat status atau mundur secara arbitrary.

---

## 🎯 Common Scenarios

### Scenario 1: Item Rusak/Hilang

```bash
PATCH /api/stocktake/v2/items/5
{
  "stok_fisik": 45,
  "notes": "5 unit rusak/kadaluarsa"
}
```

### Scenario 2: Selisih Besar

Manajer bisa request revision:

```bash
POST /api/stocktake/v2/sessions/:id/review
{
  "action": "REQUEST_REVISION",
  "revision_items": [
    {
      "id_stocktake_item": 5,
      "flag_reason": "Selisih -50 unit terlalu besar, mohon hitung ulang"
    }
  ]
}
```

### Scenario 3: Stocktake Dibatalkan

```bash
POST /api/stocktake/v2/sessions/:id/cancel
{
  "cancel_reason": "Ada masalah sistem, akan dilakukan ulang besok"
}
```

---

## 🛡️ Security Best Practices

1. **Authentication Required**: Semua endpoint memerlukan Bearer token
2. **Authorization Check**:
   - Kasir hanya bisa update session yang dia buat
   - Manajer bisa review semua session
3. **Audit Trail**: Semua perubahan tercatat di adjustment logs
4. **Validation**:
   - Pre-condition check sebelum create session
   - Status validation di setiap action

---

## 📱 Frontend Implementation Tips

### Local Storage Structure

```javascript
// Save draft locally untuk offline capability
const stocktakeDraft = {
  session_id: "ST-20260108-143025",
  items: [
    { id_stocktake_item: 1, stok_fisik: 48, synced: true },
    { id_stocktake_item: 2, stok_fisik: 100, synced: false },
  ],
  last_sync: "2026-01-08T14:30:00Z",
};

localStorage.setItem("stocktake_draft", JSON.stringify(stocktakeDraft));

// Sync saat koneksi kembali
if (navigator.onLine) {
  syncDraftToServer();
}
```

### Progress Indicator

```javascript
const progress = (session.total_counted / session.total_items) * 100;

<ProgressBar
  value={progress}
  label={`${session.total_counted} / ${session.total_items} items`}
/>;
```

### Blind Count UI

```javascript
// ✅ CORRECT: Hide stok_sistem from kasir
function BlindCountInput({ item }) {
  return (
    <div>
      <h3>{item.nm_product}</h3>
      {/* TIDAK tampilkan item.stok_sistem */}
      <input
        type="number"
        placeholder="Hitung stok fisik"
        onChange={(e) => updateItem(item.id, e.target.value)}
      />
    </div>
  );
}

// ✅ CORRECT: Show comparison for reviewer
function ReviewTable({ item }) {
  return (
    <tr>
      <td>{item.nm_product}</td>
      <td>{item.stok_sistem}</td>
      <td>{item.stok_fisik}</td>
      <td className={item.selisih !== 0 ? "text-danger" : ""}>
        {item.selisih}
      </td>
    </tr>
  );
}
```

---

## 🔍 Debugging Tips

### Check Session Status

```bash
GET /api/stocktake/v2/sessions/ST-20260108-143025

# Look for:
# - status (current state)
# - total_counted vs total_items
# - statistics.progress_percentage
```

### Find Uncounted Items

```bash
GET /api/stocktake/v2/sessions/:id/items?is_counted=false
```

### Find Items with Variance

```bash
GET /api/stocktake/v2/sessions/:id/items?has_variance=true
```

### View Adjustment Logs

```bash
GET /api/stocktake/v2/sessions/:id/adjustments
```

---

## 📞 Support

Untuk pertanyaan atau issue:

- 📧 Email: backend-team@ksu.com
- 📱 WhatsApp: +62-XXX-XXX-XXXX
- 📝 Create issue di GitHub repo

---

## 📚 Next Steps

1. ✅ Setup high risk products
2. ✅ Test basic workflow
3. ⬜ Implement frontend UI
4. ⬜ Setup role permissions
5. ⬜ Train kasir & manajer
6. ⬜ Go live!

---

Happy Stocktaking! 🎉
