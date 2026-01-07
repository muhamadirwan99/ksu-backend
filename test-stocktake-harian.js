// Test file untuk Stock Opname Harian API
// Run: node test-stocktake-harian.js

import { generateDate } from "./src/utils/generate-date.js";

console.log("=== STOCK OPNAME HARIAN - API TEST GUIDE ===\n");

const baseURL = "http://localhost:3000";
const token = "YOUR_AUTH_TOKEN_HERE"; // Ganti dengan token yang valid

const formatDate = () => {
  const now = generateDate();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year}, ${hours}:${minutes}`;
};

const testData = {
  tg_stocktake: formatDate(),
  id_tutup_kasir: 1, // Sesuaikan dengan ID tutup kasir yang ada
  username: "admin",
  name: "Administrator",
};

console.log("📅 Tanggal SO Test:", testData.tg_stocktake);
console.log("🔑 Base URL:", baseURL);
console.log("\n" + "=".repeat(60) + "\n");

// ========================================
// TEST 1: Check SO Status
// ========================================
console.log("🧪 TEST 1: Check SO Status");
console.log("Endpoint: POST /api/stock/check-so-status");
console.log("Purpose: Cek apakah tutup kasir sudah dilakukan dan status SO\n");

const test1 = {
  method: "POST",
  url: `${baseURL}/api/stock/check-so-status`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: {
    tg_stocktake: testData.tg_stocktake,
  },
};

console.log("Request:");
console.log(JSON.stringify(test1, null, 2));
console.log("\n" + "-".repeat(60) + "\n");

// ========================================
// TEST 2: Get Products for Daily SO
// ========================================
console.log("🧪 TEST 2: Get Products for Daily SO");
console.log("Endpoint: POST /api/stock/get-products-for-daily-so");
console.log("Purpose: Dapatkan list semua produk untuk di-SO\n");

const test2 = {
  method: "POST",
  url: `${baseURL}/api/stock/get-products-for-daily-so`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: {
    tg_stocktake: testData.tg_stocktake,
    id_tutup_kasir: testData.id_tutup_kasir,
  },
};

console.log("Request:");
console.log(JSON.stringify(test2, null, 2));
console.log("\n⚠️  Expected Response:");
console.log("- summary.total_products: jumlah semua produk aktif");
console.log("- divisi_list: array of divisi dengan products");
console.log("- is_done: false untuk produk yang belum di-SO");
console.log("\n" + "-".repeat(60) + "\n");

// ========================================
// TEST 3: Create Single Stock Take
// ========================================
console.log("🧪 TEST 3: Create Single Stock Take");
console.log("Endpoint: POST /api/stock/create-stock-opname");
console.log("Purpose: Input SO per produk (single)\n");

const test3 = {
  method: "POST",
  url: `${baseURL}/api/stock/create-stock-opname`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: {
    tg_stocktake: testData.tg_stocktake,
    id_product: "PROD001", // Ganti dengan product ID yang valid
    nm_product: "Beras Premium 5kg",
    stok_awal: 100,
    stok_akhir: 98,
    username: testData.username,
    name: testData.name,
  },
};

console.log("Request:");
console.log(JSON.stringify(test3, null, 2));
console.log("\n⚠️  Note:");
console.log("- Akan error jika belum Tutup Kasir");
console.log("- Akan error jika SO sudah di-confirm");
console.log("- Auto update jumlah di tabel product");
console.log("\n" + "-".repeat(60) + "\n");

// ========================================
// TEST 4: Batch Save Daily SO
// ========================================
console.log("🧪 TEST 4: Batch Save Daily SO (FINAL)");
console.log("Endpoint: POST /api/stock/batch-save-daily-so");
console.log("Purpose: Save semua SO sekaligus dan mark tutup kasir complete\n");

const test4 = {
  method: "POST",
  url: `${baseURL}/api/stock/batch-save-daily-so`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: {
    tg_stocktake: testData.tg_stocktake,
    id_tutup_kasir: testData.id_tutup_kasir,
    username: testData.username,
    name: testData.name,
    products: [
      {
        id_product: "PROD001",
        nm_product: "Beras Premium 5kg",
        stok_awal: 100,
        stok_akhir: 98,
        keterangan: "2 karung bocor",
      },
      {
        id_product: "PROD002",
        nm_product: "Gula Pasir 1kg",
        stok_awal: 50,
        stok_akhir: 50,
        keterangan: "",
      },
      // ... tambahkan SEMUA produk aktif
    ],
  },
};

console.log("Request:");
console.log(JSON.stringify(test4, null, 2));
console.log("\n⚠️  CRITICAL:");
console.log("- HARUS include SEMUA produk aktif");
console.log("- Akan error jika kurang 1 produk saja");
console.log("- Akan update is_stocktake_done = true");
console.log("- Setelah ini, tidak bisa SO lagi untuk tanggal yang sama");
console.log("\n" + "=".repeat(60) + "\n");

// ========================================
// TESTING USING CURL
// ========================================
console.log("📝 TESTING USING CURL:\n");

console.log("# Test 1: Check SO Status");
console.log(`curl -X POST ${baseURL}/api/stock/check-so-status \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '${JSON.stringify({ tg_stocktake: testData.tg_stocktake })}'
`);

console.log("\n# Test 2: Get Products for Daily SO");
console.log(`curl -X POST ${baseURL}/api/stock/get-products-for-daily-so \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '${JSON.stringify({ tg_stocktake: testData.tg_stocktake, id_tutup_kasir: testData.id_tutup_kasir })}'
`);

console.log("\n" + "=".repeat(60) + "\n");

// ========================================
// ERROR SCENARIOS
// ========================================
console.log("⚠️  ERROR SCENARIOS TO TEST:\n");

const errorScenarios = [
  {
    scenario: "SO tanpa Tutup Kasir",
    action: "Call any SO endpoint sebelum tutup kasir",
    expected:
      "Error: Harap lakukan Tutup Kasir terlebih dahulu sebelum melakukan Stock Opname",
  },
  {
    scenario: "SO sudah selesai",
    action: "Call batch-save-daily-so dua kali dengan tanggal yang sama",
    expected:
      "Error: Stock Opname untuk tanggal ini sudah selesai dan dikonfirmasi",
  },
  {
    scenario: "Batch save tidak lengkap",
    action: "Call batch-save dengan hanya 100 produk (total 150)",
    expected:
      "Error: Semua produk harus di-stock opname. Total produk aktif: 150, produk yang di-SO: 100",
  },
  {
    scenario: "Product tidak ditemukan",
    action: "Call create-stock-opname dengan id_product yang tidak ada",
    expected: "Error: Product is not found",
  },
];

errorScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.scenario}`);
  console.log(`   Action: ${scenario.action}`);
  console.log(`   Expected: ${scenario.expected}`);
  console.log();
});

console.log("=".repeat(60) + "\n");

// ========================================
// DATABASE VERIFICATION
// ========================================
console.log("🔍 DATABASE VERIFICATION QUERIES:\n");

console.log("-- Check Tutup Kasir status");
console.log(`SELECT id_tutup_kasir, tg_tutup_kasir, shift, 
       is_stocktake_done, stocktake_completed_at
FROM tutup_kasir
WHERE tg_tutup_kasir LIKE '${testData.tg_stocktake.split(",")[0]}%';
`);

console.log("\n-- Check Stock Take records");
console.log(`SELECT id_stocktake, id_product, nm_product, 
       stok_awal, stok_akhir, selisih, 
       id_tutup_kasir, is_confirmed
FROM stocktake
WHERE tg_stocktake = '${testData.tg_stocktake}';
`);

console.log("\n-- Check Product jumlah updated");
console.log(`SELECT p.id_product, p.nm_product, p.jumlah as stok_sistem,
       s.stok_akhir as stok_so, s.selisih
FROM products p
LEFT JOIN stocktake s ON p.id_product = s.id_product 
  AND s.tg_stocktake = '${testData.tg_stocktake}'
WHERE p.status_product = true
LIMIT 10;
`);

console.log("\n" + "=".repeat(60) + "\n");

// ========================================
// TESTING CHECKLIST
// ========================================
console.log("✅ TESTING CHECKLIST:\n");

const checklist = [
  "Test check SO status sebelum tutup kasir (should show warning)",
  "Test check SO status setelah tutup kasir (should show progress 0%)",
  "Test get products for daily SO (should return all active products)",
  "Test create single stock take (should update product jumlah)",
  "Test get products again (should show progress increased)",
  "Test batch save with incomplete data (should error)",
  "Test batch save with all products (should success)",
  "Test check SO status after batch save (should show is_stocktake_done = true)",
  "Test create stock take after batch save (should error)",
  "Verify product jumlah in database matches stok_akhir",
  "Verify tutup_kasir.is_stocktake_done = true",
  "Verify stocktake.id_tutup_kasir is set correctly",
];

checklist.forEach((item, index) => {
  console.log(`[ ] ${index + 1}. ${item}`);
});

console.log("\n" + "=".repeat(60) + "\n");
console.log("🎉 Happy Testing!");
console.log("📖 Full Documentation: docs/STOCKTAKE_HARIAN_API.md");
console.log("\n");
