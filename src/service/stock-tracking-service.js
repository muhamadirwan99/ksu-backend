import { prismaClient } from "../application/database.js";
import { validate } from "../validation/validation.js";
import Joi from "joi";

const trackStockDiscrepancyValidation = Joi.object({
  id_product: Joi.string().max(100).required(),
  start_date: Joi.string().optional(),
  end_date: Joi.string().optional(),
});

/**
 * Melacak selisih stock dari aktivitas
 * Menampilkan semua transaksi yang mempengaruhi stock untuk produk tertentu
 */
const trackStockDiscrepancy = async (request) => {
  request = validate(trackStockDiscrepancyValidation, request);

  const product = await prismaClient.product.findUnique({
    where: { id_product: request.id_product },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Filter tanggal jika ada
  const dateFilter = {};
  if (request.start_date) {
    dateFilter.gte = new Date(request.start_date);
  }
  if (request.end_date) {
    dateFilter.lte = new Date(request.end_date);
  }

  // 1. Ambil semua transaksi pembelian
  const pembelianTransactions = await prismaClient.detailPembelian.findMany({
    where: {
      id_product: request.id_product,
      ...(Object.keys(dateFilter).length > 0 && {
        created_at: dateFilter,
      }),
    },
    include: {
      pembelian: true,
    },
    orderBy: { created_at: "asc" },
  });

  // 2. Ambil semua transaksi penjualan
  const penjualanTransactions = await prismaClient.detailPenjualan.findMany({
    where: {
      id_product: request.id_product,
      ...(Object.keys(dateFilter).length > 0 && {
        created_at: dateFilter,
      }),
    },
    include: {
      penjualan: true,
    },
    orderBy: { created_at: "asc" },
  });

  // 3. Ambil semua transaksi retur
  const returTransactions = await prismaClient.detailRetur.findMany({
    where: {
      id_product: request.id_product,
      ...(Object.keys(dateFilter).length > 0 && {
        created_at: dateFilter,
      }),
    },
    include: {
      retur: true,
    },
    orderBy: { created_at: "asc" },
  });

  // 4. Ambil semua stock take history
  const stockTakeHistory = await prismaClient.stockTake.findMany({
    where: {
      id_product: request.id_product,
      ...(Object.keys(dateFilter).length > 0 && {
        created_at: dateFilter,
      }),
    },
    orderBy: { created_at: "asc" },
  });

  // Gabungkan semua aktivitas
  const allActivities = [];

  // Stock awal (dari stock take pertama atau 0)
  let stockBerjalan =
    stockTakeHistory.length > 0 ? stockTakeHistory[0].stok_awal : 0;
  let expectedStock = stockBerjalan;

  allActivities.push({
    no: 0,
    tg_aktivitas: product.created_at,
    jenis_aktivitas: "Stock Awal",
    id_transaksi: "-",
    jumlah: stockBerjalan,
    stock_sebelum: 0,
    stock_sesudah: stockBerjalan,
    stock_expected: expectedStock,
    selisih: 0,
    keterangan: "Inisialisasi stock",
    user: "-",
  });

  let activityNumber = 1;

  // Proses pembelian
  pembelianTransactions.forEach((detail) => {
    const stockSebelum = stockBerjalan;
    stockBerjalan += detail.jumlah;
    expectedStock += detail.jumlah;

    allActivities.push({
      no: activityNumber++,
      tg_aktivitas: detail.created_at,
      jenis_aktivitas: "Pembelian",
      id_transaksi: detail.id_pembelian,
      jumlah: `+${detail.jumlah}`,
      stock_sebelum: stockSebelum,
      stock_sesudah: stockBerjalan,
      stock_expected: expectedStock,
      selisih: stockBerjalan - expectedStock,
      keterangan: `Pembelian dari ${detail.pembelian.nm_supplier}`,
      user: "-",
    });
  });

  // Proses penjualan
  penjualanTransactions.forEach((detail) => {
    const stockSebelum = stockBerjalan;
    stockBerjalan -= detail.jumlah;
    expectedStock -= detail.jumlah;

    allActivities.push({
      no: activityNumber++,
      tg_aktivitas: detail.created_at,
      jenis_aktivitas: "Penjualan",
      id_transaksi: detail.id_penjualan,
      jumlah: `-${detail.jumlah}`,
      stock_sebelum: stockSebelum,
      stock_sesudah: stockBerjalan,
      stock_expected: expectedStock,
      selisih: stockBerjalan - expectedStock,
      keterangan: `Penjualan ke ${detail.penjualan.nm_anggota}`,
      user: detail.penjualan.username,
    });
  });

  // Proses retur
  returTransactions.forEach((detail) => {
    const stockSebelum = stockBerjalan;
    stockBerjalan -= detail.jumlah;
    expectedStock -= detail.jumlah;

    allActivities.push({
      no: activityNumber++,
      tg_aktivitas: detail.created_at,
      jenis_aktivitas: "Retur",
      id_transaksi: detail.id_retur,
      jumlah: `-${detail.jumlah}`,
      stock_sebelum: stockSebelum,
      stock_sesudah: stockBerjalan,
      stock_expected: expectedStock,
      selisih: stockBerjalan - expectedStock,
      keterangan: `Retur ke ${detail.retur.nm_supplier}`,
      user: "-",
    });
  });

  // Proses stock take
  stockTakeHistory.forEach((st) => {
    const stockSebelum = stockBerjalan;
    const selisihStockTake = st.stok_akhir - st.stok_awal;

    // Update stock berjalan ke stok_akhir karena stock take adalah adjustment
    stockBerjalan = st.stok_akhir;

    allActivities.push({
      no: activityNumber++,
      tg_aktivitas: st.created_at,
      jenis_aktivitas: "Stock Take / Opname",
      id_transaksi: `ST-${st.id_stocktake}`,
      jumlah:
        selisihStockTake >= 0 ? `+${selisihStockTake}` : `${selisihStockTake}`,
      stock_sebelum: st.stok_awal,
      stock_sesudah: st.stok_akhir,
      stock_expected: expectedStock,
      selisih: st.selisih,
      keterangan: `Stock take oleh ${st.name}. Selisih: ${st.selisih}`,
      user: st.username,
      tg_stocktake: st.tg_stocktake,
    });

    // Setelah stock take, expected stock = actual stock
    expectedStock = stockBerjalan;
  });

  // Urutkan berdasarkan tanggal
  allActivities.sort(
    (a, b) => new Date(a.tg_aktivitas) - new Date(b.tg_aktivitas)
  );

  // Re-number setelah sorting
  allActivities.forEach((activity, index) => {
    activity.no = index;
  });

  // Cari aktivitas dengan selisih
  const aktivitasDenganSelisih = allActivities.filter(
    (a) => Math.abs(a.selisih) > 0
  );

  // Summary
  const summary = {
    id_product: product.id_product,
    nm_product: product.nm_product,
    stock_current: product.jumlah,
    stock_calculated: expectedStock,
    total_selisih: product.jumlah - expectedStock,
    total_pembelian: pembelianTransactions.reduce(
      (sum, t) => sum + t.jumlah,
      0
    ),
    total_penjualan: penjualanTransactions.reduce(
      (sum, t) => sum + t.jumlah,
      0
    ),
    total_retur: returTransactions.reduce((sum, t) => sum + t.jumlah, 0),
    total_stock_take: stockTakeHistory.length,
    aktivitas_dengan_selisih: aktivitasDenganSelisih.length,
  };

  return {
    summary,
    aktivitas_dengan_selisih: aktivitasDenganSelisih,
    semua_aktivitas: allActivities,
  };
};

/**
 * Mencari produk dengan selisih
 */
const findProductsWithDiscrepancy = async () => {
  // Ambil semua stock take terbaru per produk
  const latestStockTakes = await prismaClient.$queryRaw`
    SELECT s1.*
    FROM stocktake s1
    JOIN (
      SELECT id_product, MAX(created_at) AS latest_created_at
      FROM stocktake
      GROUP BY id_product
    ) s2
    ON s1.id_product = s2.id_product AND s1.created_at = s2.latest_created_at
    WHERE s1.selisih != 0
    ORDER BY ABS(s1.selisih) DESC
  `;

  const productsWithDiscrepancy = [];

  for (const st of latestStockTakes) {
    const product = await prismaClient.product.findUnique({
      where: { id_product: st.id_product },
      include: {
        divisi: true,
        supplier: true,
      },
    });

    if (product) {
      productsWithDiscrepancy.push({
        id_product: product.id_product,
        nm_product: product.nm_product,
        nm_divisi: product.divisi.nm_divisi,
        nm_supplier: product.supplier.nm_supplier,
        stock_current: product.jumlah,
        stock_take_terakhir: {
          tg_stocktake: st.tg_stocktake,
          stok_awal: st.stok_awal,
          stok_akhir: st.stok_akhir,
          selisih: st.selisih,
          petugas: st.name,
          created_at: st.created_at,
        },
      });
    }
  }

  return {
    total_product_dengan_selisih: productsWithDiscrepancy.length,
    products: productsWithDiscrepancy,
  };
};

/**
 * Analisis penyebab selisih untuk produk tertentu
 */
const analyzeCauseOfDiscrepancy = async (request) => {
  request = validate(trackStockDiscrepancyValidation, request);

  // Dapatkan tracking lengkap
  const trackingResult = await trackStockDiscrepancy(request);

  // Analisis penyebab
  const causes = [];

  // 1. Cek stock take yang menyebabkan selisih
  const stockTakesWithDiscrepancy = trackingResult.semua_aktivitas.filter(
    (a) =>
      a.jenis_aktivitas === "Stock Take / Opname" && Math.abs(a.selisih) > 0
  );

  if (stockTakesWithDiscrepancy.length > 0) {
    stockTakesWithDiscrepancy.forEach((st) => {
      causes.push({
        kategori: "Stock Take",
        aktivitas: st,
        penyebab_kemungkinan: [
          "Kesalahan perhitungan fisik stock",
          "Produk hilang/rusak tidak tercatat",
          "Produk keluar tanpa transaksi penjualan",
          "Produk masuk tanpa transaksi pembelian",
          "Human error saat input stock take",
        ],
        dampak: st.selisih,
      });
    });
  }

  // 2. Cek apakah ada gap waktu yang besar antara aktivitas
  for (let i = 1; i < trackingResult.semua_aktivitas.length; i++) {
    const current = trackingResult.semua_aktivitas[i];
    const previous = trackingResult.semua_aktivitas[i - 1];

    const timeDiff =
      new Date(current.tg_aktivitas) - new Date(previous.tg_aktivitas);
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (daysDiff > 7 && Math.abs(current.selisih) > 0) {
      causes.push({
        kategori: "Gap Waktu",
        aktivitas: current,
        penyebab_kemungkinan: [
          `Gap waktu ${Math.round(daysDiff)} hari antara aktivitas`,
          "Kemungkinan ada transaksi yang tidak tercatat",
          "Stock adjustment manual yang tidak terdokumentasi",
        ],
        dampak: current.selisih,
      });
    }
  }

  // 3. Rekomendasi
  const recommendations = [
    "Lakukan stock opname secara berkala (minimal 1x seminggu)",
    "Pastikan setiap barang keluar/masuk dicatat dalam sistem",
    "Verifikasi ulang stock take yang memiliki selisih besar",
    "Dokumentasikan setiap adjustment manual",
    "Cross-check dengan bukti fisik (nota pembelian/penjualan)",
  ];

  return {
    summary: trackingResult.summary,
    penyebab_teridentifikasi: causes,
    aktivitas_kritis: trackingResult.aktivitas_dengan_selisih,
    rekomendasi: recommendations,
  };
};

export default {
  trackStockDiscrepancy,
  findProductsWithDiscrepancy,
  analyzeCauseOfDiscrepancy,
};
