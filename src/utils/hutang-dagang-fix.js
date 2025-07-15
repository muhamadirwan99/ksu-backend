import { prismaClient } from "../application/database.js";
import { generateDate } from "./generate-date.js";
import { logger } from "../application/logging.js";

/**
 * Fungsi untuk memperbaiki semua inkonsistensi data hutang dagang
 */
export const fixAllHutangDagangInconsistency = async () => {
  try {
    logger.info("Starting bulk hutang dagang consistency fix");

    // Ambil semua supplier yang punya hutang dagang
    const suppliers = await prismaClient.supplier.findMany({
      where: {
        OR: [
          { hutang_dagang: { gt: 0 } },
          {
            hutangDagang: {
              some: {},
            },
          },
        ],
      },
      select: {
        id_supplier: true,
        nm_supplier: true,
        hutang_dagang: true,
      },
    });

    const results = [];
    let fixedCount = 0;
    let errorCount = 0;

    for (const supplier of suppliers) {
      try {
        // Hitung total hutang dari tabel hutang_dagang
        const totalHutangDagang = await prismaClient.hutangDagang.aggregate({
          where: { id_supplier: supplier.id_supplier },
          _sum: { nominal: true },
        });

        const hutangDagangSum = totalHutangDagang._sum.nominal || 0;
        const supplierHutang = supplier.hutang_dagang || 0;

        // Cek apakah ada selisih
        if (Math.abs(hutangDagangSum - supplierHutang) > 0.01) {
          await prismaClient.supplier.update({
            where: { id_supplier: supplier.id_supplier },
            data: {
              hutang_dagang: hutangDagangSum,
              updated_at: generateDate(),
            },
          });

          results.push({
            id_supplier: supplier.id_supplier,
            nm_supplier: supplier.nm_supplier,
            old_amount: supplierHutang,
            new_amount: hutangDagangSum,
            difference: Math.abs(hutangDagangSum - supplierHutang),
            status: "FIXED",
          });

          fixedCount++;

          logger.info("Fixed hutang dagang inconsistency", {
            id_supplier: supplier.id_supplier,
            nm_supplier: supplier.nm_supplier,
            old_amount: supplierHutang,
            new_amount: hutangDagangSum,
            difference: Math.abs(hutangDagangSum - supplierHutang),
          });
        } else {
          results.push({
            id_supplier: supplier.id_supplier,
            nm_supplier: supplier.nm_supplier,
            amount: supplierHutang,
            status: "CONSISTENT",
          });
        }
      } catch (error) {
        errorCount++;
        results.push({
          id_supplier: supplier.id_supplier,
          nm_supplier: supplier.nm_supplier,
          status: "ERROR",
          error: error.message,
        });

        logger.error("Error fixing hutang dagang for supplier", {
          id_supplier: supplier.id_supplier,
          error: error.message,
        });
      }
    }

    logger.info("Bulk hutang dagang consistency fix completed", {
      total_suppliers: suppliers.length,
      fixed_count: fixedCount,
      error_count: errorCount,
    });

    return {
      success: true,
      total_suppliers: suppliers.length,
      fixed_count: fixedCount,
      error_count: errorCount,
      results,
    };
  } catch (error) {
    logger.error("Failed to execute bulk hutang dagang consistency fix", {
      error: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Fungsi untuk memvalidasi konsistensi semua data hutang dagang
 */
export const validateAllHutangDagangConsistency = async () => {
  try {
    logger.info("Starting bulk hutang dagang consistency validation");

    // Ambil semua supplier yang punya hutang dagang
    const suppliers = await prismaClient.supplier.findMany({
      where: {
        OR: [
          { hutang_dagang: { gt: 0 } },
          {
            hutangDagang: {
              some: {},
            },
          },
        ],
      },
      select: {
        id_supplier: true,
        nm_supplier: true,
        hutang_dagang: true,
      },
    });

    const results = [];
    let consistentCount = 0;
    let inconsistentCount = 0;

    for (const supplier of suppliers) {
      try {
        // Hitung total hutang dari tabel hutang_dagang
        const totalHutangDagang = await prismaClient.hutangDagang.aggregate({
          where: { id_supplier: supplier.id_supplier },
          _sum: { nominal: true },
        });

        const hutangDagangSum = totalHutangDagang._sum.nominal || 0;
        const supplierHutang = supplier.hutang_dagang || 0;

        // Cek konsistensi
        if (Math.abs(hutangDagangSum - supplierHutang) > 0.01) {
          inconsistentCount++;
          results.push({
            id_supplier: supplier.id_supplier,
            nm_supplier: supplier.nm_supplier,
            supplier_hutang: supplierHutang,
            hutang_dagang_sum: hutangDagangSum,
            difference: Math.abs(hutangDagangSum - supplierHutang),
            status: "INCONSISTENT",
          });
        } else {
          consistentCount++;
          results.push({
            id_supplier: supplier.id_supplier,
            nm_supplier: supplier.nm_supplier,
            amount: supplierHutang,
            status: "CONSISTENT",
          });
        }
      } catch (error) {
        results.push({
          id_supplier: supplier.id_supplier,
          nm_supplier: supplier.nm_supplier,
          status: "ERROR",
          error: error.message,
        });
      }
    }

    logger.info("Bulk hutang dagang consistency validation completed", {
      total_suppliers: suppliers.length,
      consistent_count: consistentCount,
      inconsistent_count: inconsistentCount,
    });

    return {
      total_suppliers: suppliers.length,
      consistent_count: consistentCount,
      inconsistent_count: inconsistentCount,
      inconsistent_suppliers: results.filter(
        (r) => r.status === "INCONSISTENT"
      ),
      all_results: results,
    };
  } catch (error) {
    logger.error("Failed to validate hutang dagang consistency", {
      error: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Fungsi untuk mendapatkan summary hutang dagang
 */
export const getHutangDagangSummary = async (id_supplier = null) => {
  try {
    const whereClause = id_supplier ? { id_supplier } : {};

    // Summary dari tabel hutang_dagang
    const hutangDagangSummary = await prismaClient.hutangDagang.groupBy({
      by: ["id_supplier", "nm_supplier"],
      where: whereClause,
      _sum: { nominal: true },
      _count: { id_hutang_dagang: true },
    });

    // Summary dari tabel supplier
    const supplierSummary = await prismaClient.supplier.findMany({
      where: id_supplier ? { id_supplier } : { hutang_dagang: { gt: 0 } },
      select: {
        id_supplier: true,
        nm_supplier: true,
        hutang_dagang: true,
      },
    });

    // History pembayaran terbaru
    const recentPayments = await prismaClient.historyHutangDagang.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      take: 10,
      select: {
        id_history_hutang_dagang: true,
        id_supplier: true,
        nm_supplier: true,
        tg_bayar_hutang: true,
        nominal: true,
        created_at: true,
      },
    });

    return {
      hutang_dagang_summary: hutangDagangSummary,
      supplier_summary: supplierSummary,
      recent_payments: recentPayments,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Failed to get hutang dagang summary", {
      error: error.message,
      id_supplier,
    });
    throw error;
  }
};
