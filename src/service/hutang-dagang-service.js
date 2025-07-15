import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../utils/response-error.js";
import {
  listHutangDagangValidation,
  listPembayaranHutangDagangValidation,
  pembayaranHutangDagangValidation,
} from "../validation/hutang-dagang-validation.js";
import { generateDate } from "../utils/generate-date.js";
import { parse } from "date-fns";
import { generateBayarHutangDagangId } from "../utils/generate-bayar-hutang-dagang-id.js";
import { logger } from "../application/logging.js";
import {
  createHutangDagangAudit,
  validateHutangDagangConsistency,
} from "../utils/hutang-dagang-audit.js";

const pembayaranHutangDagang = async (request) => {
  request = validate(pembayaranHutangDagangValidation, request);

  request.nominal_bayar = parseInt(request.nominal_bayar);

  const parseDate = parse(request.tg_bayar, "dd-MM-yyyy", new Date());

  // Validasi apakah tanggal berhasil diparse
  if (isNaN(parseDate)) {
    throw new Error("Invalid date format. Please use dd-MM-yyyy format.");
  }

  // Gunakan database transaction untuk memastikan atomicity
  return await prismaClient.$transaction(
    async (tx) => {
      // Validasi dan lock hutang dagang record
      const hutangDagang = await tx.hutangDagang.findUnique({
        where: {
          id_hutang_dagang: request.id_hutang_dagang,
        },
      });

      if (!hutangDagang) {
        throw new ResponseError("Hutang Dagang is not found");
      }

      const nominalHutang = parseInt(hutangDagang.nominal);

      // Audit: Record data sebelum perubahan
      await createHutangDagangAudit("PAYMENT_ATTEMPT", {
        id_hutang_dagang: request.id_hutang_dagang,
        old_values: {
          nominal_hutang: nominalHutang,
          nominal_bayar: request.nominal_bayar,
        },
      });

      // Validasi jumlah_pembayaran
      if (request.nominal_bayar > nominalHutang) {
        throw new ResponseError(
          "Jumlah Pembayaran is greater than Sisa Hutang"
        );
      }

      // Validasi nominal pembayaran harus positif
      if (request.nominal_bayar <= 0) {
        throw new ResponseError("Nominal pembayaran harus lebih besar dari 0");
      }

      // Get supplier data untuk update hutang
      const supplier = await tx.supplier.findUnique({
        where: {
          id_supplier: hutangDagang.id_supplier,
        },
      });

      if (!supplier) {
        throw new ResponseError("Supplier not found");
      }

      const currentSupplierHutang = parseInt(supplier.hutang_dagang) || 0;

      // Validasi pembayaran tidak boleh melebihi hutang supplier
      if (request.nominal_bayar > currentSupplierHutang) {
        throw new ResponseError("Pembayaran melebihi total hutang supplier");
      }

      const newSupplierHutang = currentSupplierHutang - request.nominal_bayar;

      // Generate ID untuk history
      const historyId = await generateBayarHutangDagangId(parseDate);

      // Simpan data untuk audit
      const auditData = {
        old_values: {
          hutang_dagang_nominal: nominalHutang,
          supplier_hutang: currentSupplierHutang,
        },
        new_values: {
          pembayaran: request.nominal_bayar,
          new_supplier_hutang: newSupplierHutang,
        },
      };

      // Jika pembayaran lunas, hapus record hutang dagang
      if (request.nominal_bayar === nominalHutang) {
        await tx.hutangDagang.delete({
          where: {
            id_hutang_dagang: request.id_hutang_dagang,
          },
        });

        await createHutangDagangAudit("DELETE_HUTANG_LUNAS", {
          id_hutang_dagang: request.id_hutang_dagang,
          ...auditData,
        });
      } else {
        // Update sisa hutang dagang
        await tx.hutangDagang.update({
          where: {
            id_hutang_dagang: request.id_hutang_dagang,
          },
          data: {
            nominal: nominalHutang - request.nominal_bayar,
            updated_at: generateDate(),
          },
        });

        await createHutangDagangAudit("UPDATE_HUTANG_PARTIAL", {
          id_hutang_dagang: request.id_hutang_dagang,
          ...auditData,
          new_values: {
            ...auditData.new_values,
            remaining_hutang: nominalHutang - request.nominal_bayar,
          },
        });
      }

      // Update hutang di table supplier
      await tx.supplier.update({
        where: {
          id_supplier: hutangDagang.id_supplier,
        },
        data: {
          hutang_dagang: newSupplierHutang,
          updated_at: generateDate(),
        },
      });

      // Insert data history hutang dagang
      const historyRecord = await tx.historyHutangDagang.create({
        data: {
          id_history_hutang_dagang: historyId,
          id_supplier: hutangDagang.id_supplier,
          nm_supplier: hutangDagang.nm_supplier,
          tg_bayar_hutang: request.tg_bayar,
          nominal: request.nominal_bayar,
          keterangan:
            request.keterangan ||
            `Pembayaran hutang dagang ${hutangDagang.id_pembelian}`,
          id_pembelian: hutangDagang.id_pembelian,
          created_at: generateDate(),
        },
      });

      await createHutangDagangAudit("CREATE_HISTORY", {
        id_history_hutang_dagang: historyId,
        id_hutang_dagang: request.id_hutang_dagang,
        ...auditData,
      });

      // Validasi konsistensi data setelah transaksi
      setTimeout(async () => {
        const consistency = await validateHutangDagangConsistency(
          hutangDagang.id_supplier
        );
        if (!consistency.isConsistent) {
          logger.error("Data inconsistency detected after payment", {
            id_supplier: hutangDagang.id_supplier,
            consistency,
          });
        }
      }, 1000); // Check 1 detik setelah transaksi selesai

      return historyRecord;
    },
    {
      isolationLevel: "ReadCommitted", // Menggunakan isolation level yang tepat
      timeout: 10000, // Timeout 10 detik untuk menghindari deadlock
    }
  );
};

const listPembayaranHutangDagang = async (request) => {
  // Apabila request sama dengan {}, maka langsung balikkan semua data anggota
  if (Object.keys(request).length === 0) {
    const hutangDagang = await prismaClient.historyHutangDagang.findMany();
    return {
      data_bayar_hutang: hutangDagang,
      paging: {
        page: 1,
        total_item: hutangDagang.length,
        total_page: 1,
      },
    };
  }
  request = validate(listPembayaranHutangDagangValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.nm_supplier) {
    filters.push({
      nm_supplier: {
        contains: request.nm_supplier,
      },
    });
  }

  if (request.id_supplier) {
    filters.push({
      id_supplier: {
        contains: request.id_supplier,
      },
    });
  }

  const sortBy = request.sort_by || ["nm_supplier"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const hutangDagang = await prismaClient.historyHutangDagang.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.historyHutangDagang.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_bayar_hutang: hutangDagang,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

const listHutangDagang = async (request) => {
  // Apabila request sama dengan {}, maka langsung balikkan semua data hutang dagang
  if (Object.keys(request).length === 0) {
    const hutangDagang = await prismaClient.hutangDagang.findMany();
    return {
      data_hutang_dagang: hutangDagang,
      paging: {
        page: 1,
        total_item: hutangDagang.length,
        total_page: 1,
      },
    };
  }
  request = validate(listHutangDagangValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.id_supplier) {
    filters.push({
      id_supplier: {
        contains: request.id_supplier,
      },
    });
  }

  const sortBy = request.sort_by || ["tg_hutang"];
  const sortOrder = request.sort_order || ["desc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const hutangDagang = await prismaClient.hutangDagang.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.hutangDagang.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_hutang_dagang: hutangDagang,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  pembayaranHutangDagang,
  listPembayaranHutangDagang,
  listHutangDagang,
};
