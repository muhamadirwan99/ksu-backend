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

const pembayaranHutangDagang = async (request) => {
  request = validate(pembayaranHutangDagangValidation, request);

  request.nominal_bayar = parseInt(request.nominal_bayar);

  // Validasi id_hutang_anggota
  const hutangDagang = await prismaClient.hutangDagang.findUnique({
    where: {
      id_hutang_dagang: request.id_hutang_dagang,
    },
  });

  if (!hutangDagang) {
    throw new ResponseError("Hutang Dagang is not found");
  }

  hutangDagang.nominal = parseInt(hutangDagang.nominal);

  // Validasi jumlah_pembayaran
  if (request.nominal_bayar > hutangDagang.nominal) {
    throw new ResponseError("Jumlah Pembayaran is greater than Sisa Hutang");
  }

  // Update data hutang_anggota apabila hutang anggota telah lunas hapus data hutang dagang supplier
  if (request.nominal_bayar === hutangDagang.nominal) {
    await prismaClient.hutangDagang.delete({
      where: {
        id_hutang_dagang: request.id_hutang_dagang,
      },
    });
  } else {
    await prismaClient.hutangDagang.update({
      where: {
        id_hutang_dagang: request.id_hutang_dagang,
      },
      data: {
        nominal: hutangDagang.nominal - request.nominal_bayar,
        updated_at: generateDate(),
      },
    });
  }

  // Update hutang di table supplier
  const supplier = await prismaClient.supplier.findUnique({
    where: {
      id_supplier: hutangDagang.id_supplier,
    },
  });

  const hutang = parseInt(supplier.hutang_dagang) - request.nominal_bayar;

  await prismaClient.supplier.update({
    where: {
      id_supplier: hutangDagang.id_supplier,
    },
    data: {
      hutang_dagang: hutang,
      updated_at: generateDate(),
    },
  });

  const parseDate = parse(request.tg_bayar, "dd-MM-yyyy", new Date());

  // Validasi apakah tanggal berhasil diparse
  if (isNaN(parseDate)) {
    throw new Error("Invalid date format. Please use dd-MM-yyyy format.");
  }

  // Insert data history hutang anggota
  return prismaClient.historyHutangDagang.create({
    data: {
      id_history_hutang_dagang: await generateBayarHutangDagangId(parseDate),
      id_supplier: hutangDagang.id_supplier,
      nm_supplier: hutangDagang.nm_supplier,
      tg_bayar_hutang: request.tg_bayar,
      nominal: request.nominal_bayar,
      keterangan: request.keterangan,
      id_pembelian: hutangDagang.id_pembelian,
      created_at: generateDate(),
    },
  });
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
