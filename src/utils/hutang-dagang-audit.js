import { prismaClient } from "../application/database.js";
import { generateDate } from "./generate-date.js";
import { logger } from "../application/logging.js";

/**
 * Audit trail untuk transaksi hutang dagang
 */
const createHutangDagangAudit = async (operation, data, user = "system") => {
  try {
    const auditData = {
      operation,
      table_name: "hutang_dagang",
      record_id: data.id_hutang_dagang || data.id_history_hutang_dagang,
      old_values: data.old_values ? JSON.stringify(data.old_values) : null,
      new_values: data.new_values ? JSON.stringify(data.new_values) : null,
      user_id: user,
      timestamp: generateDate(),
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null,
    };

    logger.info(`Hutang Dagang Audit: ${operation}`, auditData);

    // Simpan ke database jika tabel audit sudah tersedia
    // await prismaClient.auditLog.create({ data: auditData });
  } catch (error) {
    logger.error("Failed to create audit trail", {
      error: error.message,
      operation,
      data,
    });
  }
};

/**
 * Validasi konsistensi data hutang dagang
 */
const validateHutangDagangConsistency = async (id_supplier) => {
  try {
    // Ambil total hutang dari tabel hutang_dagang
    const totalHutangDagang = await prismaClient.hutangDagang.aggregate({
      where: { id_supplier },
      _sum: { nominal: true },
    });

    // Ambil hutang dari tabel supplier
    const supplier = await prismaClient.supplier.findUnique({
      where: { id_supplier },
      select: { hutang_dagang: true },
    });

    const hutangDagangSum = totalHutangDagang._sum.nominal || 0;
    const supplierHutang = supplier?.hutang_dagang || 0;

    if (Math.abs(hutangDagangSum - supplierHutang) > 0.01) {
      // Toleransi 1 sen untuk floating point
      logger.error("Inconsistent hutang dagang data detected", {
        id_supplier,
        hutang_dagang_sum: hutangDagangSum,
        supplier_hutang: supplierHutang,
        difference: Math.abs(hutangDagangSum - supplierHutang),
      });

      return {
        isConsistent: false,
        hutang_dagang_sum: hutangDagangSum,
        supplier_hutang: supplierHutang,
        difference: Math.abs(hutangDagangSum - supplierHutang),
      };
    }

    return { isConsistent: true };
  } catch (error) {
    logger.error("Failed to validate hutang dagang consistency", {
      error: error.message,
      id_supplier,
    });
    return { isConsistent: false, error: error.message };
  }
};

/**
 * Perbaiki inkonsistensi data hutang dagang
 */
const fixHutangDagangInconsistency = async (id_supplier) => {
  try {
    return await prismaClient.$transaction(async (tx) => {
      // Hitung ulang total hutang dari tabel hutang_dagang
      const totalHutangDagang = await tx.hutangDagang.aggregate({
        where: { id_supplier },
        _sum: { nominal: true },
      });

      const correctTotal = totalHutangDagang._sum.nominal || 0;

      // Update hutang di tabel supplier
      await tx.supplier.update({
        where: { id_supplier },
        data: {
          hutang_dagang: correctTotal,
          updated_at: generateDate(),
        },
      });

      logger.info("Fixed hutang dagang inconsistency", {
        id_supplier,
        corrected_amount: correctTotal,
      });

      return { success: true, corrected_amount: correctTotal };
    });
  } catch (error) {
    logger.error("Failed to fix hutang dagang inconsistency", {
      error: error.message,
      id_supplier,
    });
    return { success: false, error: error.message };
  }
};

export {
  createHutangDagangAudit,
  validateHutangDagangConsistency,
  fixHutangDagangInconsistency,
};
