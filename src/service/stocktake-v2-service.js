/**
 * Stocktake V2 Service
 * Business logic untuk advanced inventory counting system
 */

import { prismaClient } from "../application/database.js";
import { ResponseError } from "../utils/response-error.js";
import { generateDate } from "../utils/generate-date.js";
import { format } from "date-fns";

// ========================================
// HELPER: Generate Stocktake Session ID
// Format: ST-YYYYMMDD-HHMMSS
// ========================================
const generateStocktakeSessionId = () => {
  const now = generateDate();
  const formatted = format(now, "yyyyMMdd-HHmmss");
  return `ST-${formatted}`;
};

// ========================================
// VALIDATION: Check Prerequisites
// ========================================
const validateStocktakePrerequisites = async (idTutupKasir) => {
  // 1. Validasi Tutup Kasir exists
  const tutupKasir = await prismaClient.tutupKasir.findUnique({
    where: { id_tutup_kasir: idTutupKasir },
  });

  if (!tutupKasir) {
    throw new ResponseError("Data Tutup Kasir tidak ditemukan", {});
  }

  // 2. Cek apakah sudah ada stocktake untuk shift ini yang masih aktif
  const existingStocktake = await prismaClient.stocktakeSession.findFirst({
    where: {
      id_tutup_kasir: idTutupKasir,
      status: {
        in: ["DRAFT", "SUBMITTED", "REVISION"],
      },
    },
  });

  if (existingStocktake) {
    throw new ResponseError(
      `Sudah ada stocktake aktif untuk shift ini (ID: ${existingStocktake.id_stocktake_session}, Status: ${existingStocktake.status})`,
      {}
    );
  }

  return tutupKasir;
};

// ========================================
// BUSINESS LOGIC: Generate To-Do List for HARIAN
// Smart Cycle Count: Barang Bergerak + High Risk
// ========================================
const generateHarianToDoList = async (idTutupKasir, shift) => {
  const productList = new Map(); // Using Map to avoid duplicates

  // 1. Get products with transactions in this shift
  // Dari Penjualan
  const salesProducts = await prismaClient.detailPenjualan.findMany({
    where: {
      penjualan: {
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    },
    select: {
      id_product: true,
      product: {
        select: {
          id_product: true,
          nm_product: true,
          jumlah: true,
          harga_beli: true,
          divisi: {
            select: {
              nm_divisi: true,
            },
          },
          status_product: true,
        },
      },
    },
  });

  salesProducts.forEach((item) => {
    if (item.product.status_product) {
      productList.set(item.id_product, {
        id_product: item.product.id_product,
        nm_product: item.product.nm_product,
        nm_divisi: item.product.divisi.nm_divisi,
        stok_sistem: item.product.jumlah,
        harga_beli: item.product.harga_beli,
        harga_jual: item.product.harga_jual,
        is_high_risk: false,
        has_transaction: true,
      });
    }
  });

  // Dari Pembelian (hari ini)
  const purchaseProducts = await prismaClient.detailPembelian.findMany({
    where: {
      pembelian: {
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    },
    select: {
      id_product: true,
      product: {
        select: {
          id_product: true,
          nm_product: true,
          jumlah: true,
          harga_beli: true,
          divisi: {
            select: {
              nm_divisi: true,
            },
          },
          status_product: true,
        },
      },
    },
  });

  purchaseProducts.forEach((item) => {
    if (item.product.status_product) {
      const existing = productList.get(item.id_product);
      productList.set(item.id_product, {
        id_product: item.product.id_product,
        nm_product: item.product.nm_product,
        nm_divisi: item.product.divisi.nm_divisi,
        stok_sistem: item.product.jumlah,
        harga_beli: item.product.harga_beli,
        harga_jual: item.product.harga_jual,
        is_high_risk: existing?.is_high_risk || false,
        has_transaction: true,
      });
    }
  });

  // 2. Get High Risk Products (WAJIB dihitung)
  const highRiskProducts = await prismaClient.stocktakeHighRiskProduct.findMany(
    {
      where: {
        is_active: true,
      },
      include: {
        product: {
          include: {
            divisi: true,
          },
        },
      },
    }
  );

  highRiskProducts.forEach((hrp) => {
    if (hrp.product.status_product) {
      const existing = productList.get(hrp.id_product);
      productList.set(hrp.id_product, {
        id_product: hrp.product.id_product,
        nm_product: hrp.product.nm_product,
        nm_divisi: hrp.product.divisi.nm_divisi,
        stok_sistem: hrp.product.jumlah,
        harga_beli: hrp.product.harga_beli,
        harga_jual: hrp.product.harga_jual,
        is_high_risk: true,
        has_transaction: existing?.has_transaction || false,
      });
    }
  });

  return Array.from(productList.values());
};

// ========================================
// BUSINESS LOGIC: Generate To-Do List for BULANAN
// Wall-to-Wall: Semua Produk Aktif
// ========================================
const generateBulananToDoList = async () => {
  const products = await prismaClient.product.findMany({
    where: {
      status_product: true,
    },
    include: {
      divisi: true,
    },
    orderBy: [{ id_divisi: "asc" }, { nm_product: "asc" }],
  });

  return products.map((product) => ({
    id_product: product.id_product,
    nm_product: product.nm_product,
    nm_divisi: product.divisi.nm_divisi,
    stok_sistem: product.jumlah,
    harga_beli: product.harga_beli,
    harga_jual: product.harga_jual,
    is_high_risk: false, // Will be checked later
    has_transaction: false, // Not relevant for BULANAN
  }));
};

// ========================================
// SERVICE: Create Stocktake Session
// ========================================
const createStocktakeSession = async (request, user) => {
  const { stocktake_type, id_tutup_kasir, notes_kasir } = request;

  // Validate prerequisites
  const tutupKasir = await validateStocktakePrerequisites(id_tutup_kasir);

  // Generate session ID
  const sessionId = generateStocktakeSessionId();

  // Generate To-Do List berdasarkan tipe
  let todoList = [];
  if (stocktake_type === "HARIAN") {
    todoList = await generateHarianToDoList(id_tutup_kasir, tutupKasir.shift);
  } else if (stocktake_type === "BULANAN") {
    todoList = await generateBulananToDoList();

    // Check high risk products untuk BULANAN
    const highRiskIds = await prismaClient.stocktakeHighRiskProduct.findMany({
      where: { is_active: true },
      select: { id_product: true },
    });

    const highRiskSet = new Set(highRiskIds.map((hr) => hr.id_product));
    todoList = todoList.map((item) => ({
      ...item,
      is_high_risk: highRiskSet.has(item.id_product),
    }));
  }

  if (todoList.length === 0) {
    throw new ResponseError(
      "Tidak ada produk yang perlu dihitung. Pastikan ada transaksi atau produk aktif.",
      {}
    );
  }

  // Create session dan items dalam transaction
  const result = await prismaClient.$transaction(async (prisma) => {
    // Create session
    const session = await prisma.stocktakeSession.create({
      data: {
        id_stocktake_session: sessionId,
        stocktake_type,
        status: "DRAFT",
        id_tutup_kasir,
        shift: tutupKasir.shift,
        tg_stocktake: generateDate(),
        username_kasir: user.username,
        nama_kasir: user.name,
        total_items: todoList.length,
        total_counted: 0,
        total_variance: 0,
        notes_kasir: notes_kasir || null,
      },
    });

    // Create items
    const itemsData = todoList.map((item) => ({
      id_stocktake_session: sessionId,
      id_product: item.id_product,
      nm_product: item.nm_product,
      nm_divisi: item.nm_divisi,
      stok_sistem: item.stok_sistem,
      harga_beli: item.harga_beli || 0, // Snapshot harga beli untuk valuasi
      harga_jual: item.harga_jual || 0, // Snapshot harga jual untuk valuasi
      stok_fisik: null, // Akan diisi saat blind count
      selisih: 0,
      is_counted: false,
      is_flagged: false,
      is_high_risk: item.is_high_risk,
      has_transaction: item.has_transaction,
    }));

    await prisma.stocktakeItem.createMany({
      data: itemsData,
    });

    return session;
  });

  return {
    ...result,
    message: `Stocktake ${stocktake_type} berhasil dibuat dengan ${todoList.length} item`,
  };
};

// ========================================
// SERVICE: Get Stocktake Session Details
// ========================================
const getStocktakeSessionDetails = async (sessionId, user) => {
  const session = await prismaClient.stocktakeSession.findUnique({
    where: { id_stocktake_session: sessionId },
    include: {
      tutupKasir: true,
    },
  });

  if (!session) {
    throw new ResponseError("Stocktake Session tidak ditemukan", {});
  }

  // Get summary statistics
  const stats = await prismaClient.stocktakeItem.groupBy({
    by: ["is_counted", "is_flagged"],
    where: {
      id_stocktake_session: sessionId,
    },
    _count: true,
    _sum: {
      selisih: true,
    },
  });

  // Calculate progress
  const countedItems = stats
    .filter((s) => s.is_counted)
    .reduce((sum, s) => sum + s._count, 0);

  const flaggedItems = stats
    .filter((s) => s.is_flagged)
    .reduce((sum, s) => sum + s._count, 0);

  const totalVariance = stats.reduce(
    (sum, s) => sum + Math.abs(s._sum.selisih || 0),
    0
  );

  // Get all items for valuasi calculation
  const allItems = await prismaClient.stocktakeItem.findMany({
    where: {
      id_stocktake_session: sessionId,
    },
    select: {
      stok_sistem: true,
      stok_fisik: true,
      selisih: true,
      harga_beli: true,
      harga_jual: true,
      is_counted: true,
    },
  });

  // Calculate valuasi totals
  let totalValuasiSistemBeli = 0;
  let totalValuasiSistemJual = 0;
  let totalValuasiFisikBeli = 0;
  let totalValuasiFisikJual = 0;
  let totalValuasiSelisihBeli = 0;
  let totalValuasiSelisihJual = 0;

  allItems.forEach((item) => {
    const hargaBeli = parseFloat(item.harga_beli);
    const hargaJual = parseFloat(item.harga_jual);
    const stokSistem = item.stok_sistem;
    const stokFisik = item.stok_fisik || 0;
    const selisih = item.selisih;

    totalValuasiSistemBeli += stokSistem * hargaBeli;
    totalValuasiSistemJual += stokSistem * hargaJual;

    if (item.is_counted) {
      totalValuasiFisikBeli += stokFisik * hargaBeli;
      totalValuasiFisikJual += stokFisik * hargaJual;
      totalValuasiSelisihBeli += selisih * hargaBeli;
      totalValuasiSelisihJual += selisih * hargaJual;
    }
  });

  return {
    ...session,
    statistics: {
      total_items: session.total_items,
      counted_items: countedItems,
      pending_items: session.total_items - countedItems,
      flagged_items: flaggedItems,
      total_variance: totalVariance,
      progress_percentage: ((countedItems / session.total_items) * 100).toFixed(
        2
      ),
    },
    valuasi_summary: {
      // Total Valuasi Sistem
      total_valuasi_sistem_beli: totalValuasiSistemBeli,
      total_valuasi_sistem_jual: totalValuasiSistemJual,

      // Total Valuasi Fisik (hanya item yang sudah dihitung)
      total_valuasi_fisik_beli: totalValuasiFisikBeli,
      total_valuasi_fisik_jual: totalValuasiFisikJual,

      // Total Valuasi Selisih (Kerugian/Keuntungan)
      total_valuasi_selisih_beli: totalValuasiSelisihBeli, // + = Keuntungan, - = Kerugian
      total_valuasi_selisih_jual: totalValuasiSelisihJual, // Potensi Omzet Hilang/Bertambah
    },
  };
};

// ========================================
// SERVICE: Get Stocktake Items with Pagination & Filters
// ========================================
const getStocktakeItems = async (query) => {
  const {
    id_stocktake_session,
    is_counted,
    is_flagged,
    is_high_risk,
    has_variance,
    page = 1,
    limit = 50,
  } = query;

  // Build where clause
  const where = {
    id_stocktake_session,
    ...(is_counted !== undefined && { is_counted }),
    ...(is_flagged !== undefined && { is_flagged }),
    ...(is_high_risk !== undefined && { is_high_risk }),
    ...(has_variance && {
      selisih: {
        not: 0,
      },
    }),
  };

  // Get total count
  const total = await prismaClient.stocktakeItem.count({ where });

  // Get items
  const items = await prismaClient.stocktakeItem.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [
      { is_high_risk: "desc" }, // High risk first
      { is_counted: "asc" }, // Uncounted first
      { nm_product: "asc" },
    ],
  });

  // Add valuasi calculations to each item
  const itemsWithValuasi = items.map((item) => {
    const hargaBeli = parseFloat(item.harga_beli);
    const hargaJual = parseFloat(item.harga_jual);
    const stokSistem = item.stok_sistem;
    const stokFisik = item.stok_fisik || 0;
    const selisih = item.selisih;

    return {
      ...item,
      valuasi: {
        // Data Sistem
        qty_sistem: stokSistem,
        valuasi_sistem_beli: stokSistem * hargaBeli,
        valuasi_sistem_jual: stokSistem * hargaJual,

        // Data Fisik
        qty_fisik: stokFisik,
        valuasi_fisik_beli: stokFisik * hargaBeli,
        valuasi_fisik_jual: stokFisik * hargaJual,

        // Data Selisih
        qty_selisih: selisih,
        valuasi_selisih_beli: selisih * hargaBeli, // Indikator Kerugian/Keuntungan
        valuasi_selisih_jual: selisih * hargaJual, // Indikator Potensi Omzet Hilang
      },
    };
  });

  return {
    data: itemsWithValuasi,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

// ========================================
// SERVICE: Update Stocktake Item (Blind Count)
// Kasir input stok fisik (tidak lihat stok sistem)
// ========================================
const updateStocktakeItem = async (request, user) => {
  const { id_stocktake_item, stok_fisik, notes } = request;

  // Get item dengan session info
  const item = await prismaClient.stocktakeItem.findUnique({
    where: { id_stocktake_item },
    include: {
      session: true,
    },
  });

  if (!item) {
    throw new ResponseError("Stocktake Item tidak ditemukan", {});
  }

  // Validasi status session (harus DRAFT atau REVISION)
  if (!["DRAFT", "REVISION"].includes(item.session.status)) {
    throw new ResponseError(
      `Tidak dapat mengupdate item. Status session: ${item.session.status}`,
      {}
    );
  }

  // Validasi user (harus kasir yang sama)
  if (item.session.username_kasir !== user.username) {
    throw new ResponseError(
      "Anda tidak memiliki akses untuk mengupdate item ini",
      {}
    );
  }

  // Calculate selisih
  const selisih = stok_fisik - item.stok_sistem;

  // Update item
  const updatedItem = await prismaClient.stocktakeItem.update({
    where: { id_stocktake_item },
    data: {
      stok_fisik,
      selisih,
      is_counted: true,
      is_flagged: false, // Reset flag jika sebelumnya di-flag
      notes: notes || null,
      counted_at: generateDate(),
    },
  });

  // Update session statistics
  await updateSessionStatistics(item.id_stocktake_session);

  return updatedItem;
};

// ========================================
// SERVICE: Batch Update Stocktake Items
// ========================================
const batchUpdateStocktakeItems = async (request, user) => {
  const { items } = request;

  // Validate semua items
  const itemIds = items.map((i) => i.id_stocktake_item);
  const dbItems = await prismaClient.stocktakeItem.findMany({
    where: {
      id_stocktake_item: {
        in: itemIds,
      },
    },
    include: {
      session: true,
    },
  });

  if (dbItems.length !== items.length) {
    throw new ResponseError("Beberapa item tidak ditemukan", {});
  }

  // Validasi semua item dari session yang sama
  const sessionIds = [...new Set(dbItems.map((i) => i.id_stocktake_session))];
  if (sessionIds.length > 1) {
    throw new ResponseError("Semua item harus dari session yang sama", {});
  }

  const session = dbItems[0].session;

  // Validasi status dan user
  if (!["DRAFT", "REVISION"].includes(session.status)) {
    throw new ResponseError(
      `Tidak dapat mengupdate items. Status session: ${session.status}`,
      {}
    );
  }

  if (session.username_kasir !== user.username) {
    throw new ResponseError(
      "Anda tidak memiliki akses untuk mengupdate items ini",
      {}
    );
  }

  // Batch update dalam transaction
  const result = await prismaClient.$transaction(async (prisma) => {
    const updates = [];

    for (const item of items) {
      const dbItem = dbItems.find(
        (i) => i.id_stocktake_item === item.id_stocktake_item
      );
      const selisih = item.stok_fisik - dbItem.stok_sistem;

      const updated = await prisma.stocktakeItem.update({
        where: { id_stocktake_item: item.id_stocktake_item },
        data: {
          stok_fisik: item.stok_fisik,
          selisih,
          is_counted: true,
          is_flagged: false,
          notes: item.notes || null,
          counted_at: generateDate(),
        },
      });

      updates.push(updated);
    }

    // Update session statistics
    await updateSessionStatistics(session.id_stocktake_session, prisma);

    return updates;
  });

  return {
    updated_count: result.length,
    items: result,
  };
};

// ========================================
// HELPER: Update Session Statistics
// ========================================
const updateSessionStatistics = async (sessionId, prismaInstance = null) => {
  const prisma = prismaInstance || prismaClient;

  const stats = await prisma.stocktakeItem.aggregate({
    where: {
      id_stocktake_session: sessionId,
    },
    _count: {
      id_stocktake_item: true,
    },
    _sum: {
      selisih: true,
    },
  });

  const countedItems = await prisma.stocktakeItem.count({
    where: {
      id_stocktake_session: sessionId,
      is_counted: true,
    },
  });

  await prisma.stocktakeSession.update({
    where: { id_stocktake_session: sessionId },
    data: {
      total_counted: countedItems,
      total_variance: Math.abs(stats._sum.selisih || 0),
    },
  });
};

// ========================================
// SERVICE: Submit Stocktake (Kasir -> Reviewer)
// ========================================
const submitStocktake = async (request, user) => {
  const { id_stocktake_session, notes_kasir } = request;

  const session = await prismaClient.stocktakeSession.findUnique({
    where: { id_stocktake_session },
  });

  if (!session) {
    throw new ResponseError("Stocktake Session tidak ditemukan", {});
  }

  // Validasi user
  if (session.username_kasir !== user.username) {
    throw new ResponseError("Anda tidak memiliki akses", {});
  }

  // Validasi status
  if (!["DRAFT", "REVISION"].includes(session.status)) {
    throw new ResponseError(
      `Tidak dapat submit. Status saat ini: ${session.status}`,
      {}
    );
  }

  // Validasi semua item sudah dihitung
  const uncountedItems = await prismaClient.stocktakeItem.count({
    where: {
      id_stocktake_session,
      is_counted: false,
    },
  });

  if (uncountedItems > 0) {
    throw new ResponseError(
      `Masih ada ${uncountedItems} item yang belum dihitung`,
      {}
    );
  }

  // Update session status
  const updatedSession = await prismaClient.stocktakeSession.update({
    where: { id_stocktake_session },
    data: {
      status: "SUBMITTED",
      notes_kasir: notes_kasir || session.notes_kasir,
      submitted_at: generateDate(),
    },
  });

  return updatedSession;
};

// ========================================
// SERVICE: Review Stocktake (Manajer)
// ========================================
const reviewStocktake = async (request, user) => {
  const { id_stocktake_session, action, notes_reviewer, revision_items } =
    request;

  const session = await prismaClient.stocktakeSession.findUnique({
    where: { id_stocktake_session },
  });

  if (!session) {
    throw new ResponseError("Stocktake Session tidak ditemukan", {});
  }

  // Validasi status
  if (session.status !== "SUBMITTED") {
    throw new ResponseError(
      `Tidak dapat review. Status saat ini: ${session.status}`,
      {}
    );
  }

  if (action === "APPROVE") {
    // Approve dan lanjut ke finalize
    const updatedSession = await prismaClient.stocktakeSession.update({
      where: { id_stocktake_session },
      data: {
        username_reviewer: user.username,
        nama_reviewer: user.name,
        notes_reviewer: notes_reviewer || null,
        reviewed_at: generateDate(),
      },
    });

    return {
      ...updatedSession,
      message: "Stocktake approved. Silakan finalize untuk update stok.",
    };
  } else if (action === "REQUEST_REVISION") {
    // Request revision dan flag items
    const result = await prismaClient.$transaction(async (prisma) => {
      // Update session status
      const updatedSession = await prisma.stocktakeSession.update({
        where: { id_stocktake_session },
        data: {
          status: "REVISION",
          username_reviewer: user.username,
          nama_reviewer: user.name,
          notes_reviewer: notes_reviewer || null,
          reviewed_at: generateDate(),
        },
      });

      // Flag items yang perlu dihitung ulang
      if (revision_items && revision_items.length > 0) {
        for (const revItem of revision_items) {
          await prisma.stocktakeItem.update({
            where: { id_stocktake_item: revItem.id_stocktake_item },
            data: {
              is_flagged: true,
              flag_reason: revItem.flag_reason,
              is_counted: false, // Reset counted status
              stok_fisik: null, // Reset physical count
            },
          });
        }
      }

      return updatedSession;
    });

    return {
      ...result,
      message: `Revision requested. ${revision_items?.length || 0} item(s) flagged for recount.`,
    };
  }
};

// ========================================
// SERVICE: Finalize Stocktake (Update Stock Master)
// ========================================
const finalizeStocktake = async (request, user) => {
  const { id_stocktake_session, notes_reviewer } = request;

  const session = await prismaClient.stocktakeSession.findUnique({
    where: { id_stocktake_session },
  });

  if (!session) {
    throw new ResponseError("Stocktake Session tidak ditemukan", {});
  }

  // Validasi status (harus sudah di-review atau SUBMITTED)
  if (!["SUBMITTED"].includes(session.status)) {
    throw new ResponseError(
      `Tidak dapat finalize. Status saat ini: ${session.status}. Session harus di-review dulu.`,
      {}
    );
  }

  // Get all items dengan variance
  const itemsWithVariance = await prismaClient.stocktakeItem.findMany({
    where: {
      id_stocktake_session,
      selisih: {
        not: 0,
      },
    },
    include: {
      product: true,
    },
  });

  // Finalize dalam transaction
  const result = await prismaClient.$transaction(async (prisma) => {
    const adjustmentLogs = [];

    // Update stok untuk setiap item dengan variance
    for (const item of itemsWithVariance) {
      const newStock = item.stok_fisik;

      // Update product stock
      await prisma.product.update({
        where: { id_product: item.id_product },
        data: {
          jumlah: newStock,
          updated_at: generateDate(),
        },
      });

      // Create adjustment log
      const adjustmentLog = await prisma.stocktakeAdjustmentLog.create({
        data: {
          id_stocktake_session,
          id_product: item.id_product,
          nm_product: item.nm_product,
          stok_before: item.stok_sistem,
          stok_after: newStock,
          adjustment_qty: item.selisih,
          harga_beli: item.product.harga_beli,
          nilai_adjustment: item.product.harga_beli * item.selisih,
          adjustment_reason: "Stocktake Physical Count Variance",
          adjusted_by: user.username,
        },
      });

      adjustmentLogs.push(adjustmentLog);
    }

    // Update session status
    const updatedSession = await prisma.stocktakeSession.update({
      where: { id_stocktake_session },
      data: {
        status: "COMPLETED",
        username_reviewer: user.username,
        nama_reviewer: user.name,
        notes_reviewer: notes_reviewer || session.notes_reviewer,
        completed_at: generateDate(),
      },
    });

    return {
      session: updatedSession,
      adjustments: adjustmentLogs,
    };
  });

  return {
    ...result.session,
    adjustments_count: result.adjustments.length,
    adjustments: result.adjustments,
    message: `Stocktake finalized. ${result.adjustments.length} product(s) stock updated.`,
  };
};

// ========================================
// SERVICE: Cancel Stocktake
// ========================================
const cancelStocktake = async (request, user) => {
  const { id_stocktake_session, cancel_reason } = request;

  const session = await prismaClient.stocktakeSession.findUnique({
    where: { id_stocktake_session },
  });

  if (!session) {
    throw new ResponseError("Stocktake Session tidak ditemukan", {});
  }

  // Tidak bisa cancel yang sudah completed
  if (session.status === "COMPLETED") {
    throw new ResponseError(
      "Tidak dapat membatalkan stocktake yang sudah completed",
      {}
    );
  }

  // Update session
  const updatedSession = await prismaClient.stocktakeSession.update({
    where: { id_stocktake_session },
    data: {
      status: "CANCELLED",
      notes_reviewer: cancel_reason,
      username_reviewer: user.username,
      nama_reviewer: user.name,
      updated_at: generateDate(),
    },
  });

  return updatedSession;
};

// ========================================
// SERVICE: Get Stocktake Sessions with Filters
// ========================================
const getStocktakeSessions = async (query) => {
  const {
    stocktake_type,
    status,
    start_date,
    end_date,
    shift,
    page = 1,
    limit = 20,
  } = query;

  const where = {
    ...(stocktake_type && { stocktake_type }),
    ...(status && { status }),
    ...(shift && { shift }),
    ...(start_date &&
      end_date && {
        tg_stocktake: {
          gte: new Date(start_date),
          lte: new Date(end_date),
        },
      }),
  };

  const total = await prismaClient.stocktakeSession.count({ where });

  const sessions = await prismaClient.stocktakeSession.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      created_at: "desc",
    },
    include: {
      tutupKasir: {
        select: {
          tg_tutup_kasir: true,
          shift: true,
        },
      },
    },
  });

  return {
    data: sessions,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

// ========================================
// SERVICE: High Risk Product Management
// ========================================
const addHighRiskProduct = async (request) => {
  const { id_product, category, reason } = request;

  // Check if product exists
  const product = await prismaClient.product.findUnique({
    where: { id_product },
  });

  if (!product) {
    throw new ResponseError("Product tidak ditemukan", {});
  }

  // Check if already in high risk list
  const existing = await prismaClient.stocktakeHighRiskProduct.findUnique({
    where: { id_product },
  });

  if (existing) {
    throw new ResponseError("Product sudah ada di high risk list", {});
  }

  const highRiskProduct = await prismaClient.stocktakeHighRiskProduct.create({
    data: {
      id_product,
      nm_product: product.nm_product,
      category: category || null,
      reason: reason || null,
      is_active: true,
    },
  });

  return highRiskProduct;
};

const updateHighRiskProduct = async (request) => {
  const { id_high_risk, category, reason, is_active } = request;

  const highRiskProduct = await prismaClient.stocktakeHighRiskProduct.update({
    where: { id_high_risk },
    data: {
      ...(category !== undefined && { category }),
      ...(reason !== undefined && { reason }),
      ...(is_active !== undefined && { is_active }),
      updated_at: generateDate(),
    },
  });

  return highRiskProduct;
};

const deleteHighRiskProduct = async (id_high_risk) => {
  await prismaClient.stocktakeHighRiskProduct.delete({
    where: { id_high_risk },
  });

  return { message: "High Risk Product deleted successfully" };
};

const getHighRiskProducts = async (filters = {}) => {
  const { is_active, category } = filters;

  const where = {
    ...(is_active !== undefined && { is_active }),
    ...(category && { category }),
  };

  const highRiskProducts = await prismaClient.stocktakeHighRiskProduct.findMany(
    {
      where,
      include: {
        product: {
          include: {
            divisi: true,
          },
        },
      },
      orderBy: {
        nm_product: "asc",
      },
    }
  );

  return highRiskProducts;
};

// ========================================
// SERVICE: Get Adjustment Logs
// ========================================
const getAdjustmentLogs = async (sessionId) => {
  const logs = await prismaClient.stocktakeAdjustmentLog.findMany({
    where: {
      id_stocktake_session: sessionId,
    },
    orderBy: {
      adjusted_at: "desc",
    },
  });

  return logs;
};

// ========================================
// EXPORTS
// ========================================
export default {
  createStocktakeSession,
  getStocktakeSessionDetails,
  getStocktakeItems,
  updateStocktakeItem,
  batchUpdateStocktakeItems,
  submitStocktake,
  reviewStocktake,
  finalizeStocktake,
  cancelStocktake,
  getStocktakeSessions,
  addHighRiskProduct,
  updateHighRiskProduct,
  deleteHighRiskProduct,
  getHighRiskProducts,
  getAdjustmentLogs,
};
