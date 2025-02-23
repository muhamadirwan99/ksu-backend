import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../utils/response-error.js";
import {
  listHutangAnggotaValidation,
  listPembayaranHutangAnggotaValidation,
  pembayaranHutangAnggotaValidation,
} from "../validation/hutang-anggota-validation.js";
import { generateDate } from "../utils/generate-date.js";
import { generateBayarHutangAnggotaId } from "../utils/generate-bayar-hutang-anggota-id.js";
import { parse } from "date-fns";

const pembayaranHutangAnggota = async (request) => {
  request = validate(pembayaranHutangAnggotaValidation, request);
  request.nominal_bayar = parseInt(request.nominal_bayar);

  // Ambil semua hutang anggota yang belum lunas
  const hutangAnggotaList = await prismaClient.hutangAnggota.findMany({
    where: { id_anggota: request.id_anggota },
    orderBy: { nominal: "asc" },
  });

  if (hutangAnggotaList.length === 0) {
    throw new ResponseError("Hutang anggota tidak ditemukan.");
  }

  // Hitung total hutang anggota
  const totalHutang = hutangAnggotaList.reduce(
    (sum, hutang) => sum + parseInt(hutang.nominal),
    0,
  );

  // Cek apakah nominal bayar lebih besar dari total hutang
  if (request.nominal_bayar > totalHutang) {
    throw new ResponseError(
      "Nominal pembayaran melebihi total hutang anggota.",
    );
  }

  let sisaBayar = request.nominal_bayar;

  for (const hutangAnggota of hutangAnggotaList) {
    if (sisaBayar <= 0) break;

    const nominalHutang = parseInt(hutangAnggota.nominal);
    let nominalDibayar = 0;

    if (sisaBayar >= nominalHutang) {
      // Hutang lunas
      await prismaClient.hutangAnggota.delete({
        where: { id_hutang_anggota: hutangAnggota.id_hutang_anggota },
      });
      nominalDibayar = nominalHutang;
      sisaBayar -= nominalHutang;
    } else {
      // Kurangi nominal hutang yang belum lunas
      await prismaClient.hutangAnggota.update({
        where: { id_hutang_anggota: hutangAnggota.id_hutang_anggota },
        data: {
          nominal: nominalHutang - sisaBayar,
          updated_at: generateDate(),
        },
      });
      nominalDibayar = sisaBayar;
      sisaBayar = 0;
    }

    // Simpan riwayat pembayaran
    const parseDate = parse(request.tg_bayar, "dd-MM-yyyy", new Date());
    if (isNaN(parseDate)) {
      throw new Error("Format tanggal tidak valid. Gunakan format dd-MM-yyyy.");
    }

    await prismaClient.historyHutangAnggota.create({
      data: {
        id_history_hutang_anggota:
          await generateBayarHutangAnggotaId(parseDate),
        id_anggota: hutangAnggota.id_anggota,
        nm_anggota: hutangAnggota.nm_anggota,
        tg_bayar_hutang: request.tg_bayar,
        nominal: nominalDibayar, // Simpan nominal yang dibayarkan
        keterangan: request.keterangan,
        id_penjualan: hutangAnggota.id_penjualan,
        created_at: generateDate(),
      }, // Simpan satu per satu
    });
  }

  // Update total hutang anggota
  const anggota = await prismaClient.anggota.findUnique({
    where: { id_anggota: request.id_anggota },
  });

  return prismaClient.anggota.update({
    where: { id_anggota: request.id_anggota },
    data: {
      hutang: parseInt(anggota.hutang) - request.nominal_bayar,
      updated_at: generateDate(),
    },
  });
};

const listPembayaranHutangAnggota = async (request) => {
  // Apabila request sama dengan {}, maka langsung balikkan semua data anggota
  if (Object.keys(request).length === 0) {
    const hutangAnggota = await prismaClient.historyHutangAnggota.findMany();
    return {
      data_bayar_hutang: hutangAnggota,
      paging: {
        page: 1,
        total_item: hutangAnggota.length,
        total_page: 1,
      },
    };
  }
  request = validate(listPembayaranHutangAnggotaValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.nm_anggota) {
    filters.push({
      nm_anggota: {
        contains: request.nm_anggota,
      },
    });
  }

  if (request.id_anggota) {
    filters.push({
      id_anggota: {
        contains: request.id_anggota,
      },
    });
  }

  const sortBy = request.sort_by || ["nm_anggota"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const hutangAnggota = await prismaClient.historyHutangAnggota.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.historyHutangAnggota.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_bayar_hutang: hutangAnggota,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

const listHutangAnggota = async (request) => {
  // Apabila request sama dengan {}, maka langsung balikkan semua data anggota
  if (Object.keys(request).length === 0) {
    const hutangAnggota = await prismaClient.hutangAnggota.findMany();
    return {
      data_hutang_anggota: hutangAnggota,
      paging: {
        page: 1,
        total_item: hutangAnggota.length,
        total_page: 1,
      },
    };
  }
  request = validate(listHutangAnggotaValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.id_anggota) {
    filters.push({
      id_anggota: {
        contains: request.id_anggota,
      },
    });
  }

  const sortBy = request.sort_by || ["tg_hutang"];
  const sortOrder = request.sort_order || ["desc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const hutangAnggota = await prismaClient.hutangAnggota.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.hutangAnggota.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_hutang_anggota: hutangAnggota,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  pembayaranHutangAnggota,
  listPembayaranHutangAnggota,
  listHutangAnggota,
};
