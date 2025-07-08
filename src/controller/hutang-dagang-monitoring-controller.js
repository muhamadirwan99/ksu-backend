import { ResponseSuccess } from "../utils/response-success.js";
import {
  validateHutangDagangConsistency,
  fixHutangDagangInconsistency,
} from "../utils/hutang-dagang-audit.js";
import { prismaClient } from "../application/database.js";
import { logger } from "../application/logging.js";

const checkHutangDagangConsistency = async (req, res, next) => {
  try {
    const { id_supplier } = req.body;

    if (!id_supplier) {
      // Check all suppliers if no specific supplier provided
      const suppliers = await prismaClient.supplier.findMany({
        where: { hutang_dagang: { gt: 0 } },
        select: { id_supplier: true, nm_supplier: true },
      });

      const results = await Promise.all(
        suppliers.map(async (supplier) => {
          const consistency = await validateHutangDagangConsistency(
            supplier.id_supplier
          );
          return {
            id_supplier: supplier.id_supplier,
            nm_supplier: supplier.nm_supplier,
            ...consistency,
          };
        })
      );

      const inconsistentSuppliers = results.filter((r) => !r.isConsistent);

      const responses = new ResponseSuccess("Consistency check completed", {
        total_suppliers_checked: results.length,
        inconsistent_count: inconsistentSuppliers.length,
        inconsistent_suppliers: inconsistentSuppliers,
        all_results: results,
      }).getResponse();

      res.status(200).json(responses);
    } else {
      // Check specific supplier
      const consistency = await validateHutangDagangConsistency(id_supplier);

      const responses = new ResponseSuccess("Consistency check completed", {
        id_supplier,
        ...consistency,
      }).getResponse();

      res.status(200).json(responses);
    }
  } catch (e) {
    logger.error("Error checking hutang dagang consistency", {
      error: e.message,
      stack: e.stack,
    });
    next(e);
  }
};

const fixHutangDagangData = async (req, res, next) => {
  try {
    const { id_supplier } = req.body;

    if (!id_supplier) {
      return res.status(400).json({
        success: false,
        message: "id_supplier is required",
      });
    }

    logger.info("Manual fix requested for hutang dagang", {
      id_supplier,
      user: req.user?.username,
    });

    const result = await fixHutangDagangInconsistency(id_supplier);

    const responses = new ResponseSuccess(
      result.success ? "Data fixed successfully" : "Failed to fix data",
      result
    ).getResponse();

    res.status(result.success ? 200 : 500).json(responses);
  } catch (e) {
    logger.error("Error fixing hutang dagang data", {
      error: e.message,
      stack: e.stack,
    });
    next(e);
  }
};

const getHutangDagangSummary = async (req, res, next) => {
  try {
    const { id_supplier } = req.body;

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
        id_pembelian: true,
        created_at: true,
      },
    });

    const responses = new ResponseSuccess(
      "Hutang dagang summary retrieved successfully",
      {
        hutang_dagang_summary: hutangDagangSummary,
        supplier_summary: supplierSummary,
        recent_payments: recentPayments,
        summary_date: new Date().toISOString(),
      }
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    logger.error("Error getting hutang dagang summary", {
      error: e.message,
      stack: e.stack,
    });
    next(e);
  }
};

export default {
  checkHutangDagangConsistency,
  fixHutangDagangData,
  getHutangDagangSummary,
};
