import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../utils/response-error.js";
import { generateDate } from "../utils/generate-date.js";
import {
  addAnggotaValidation,
  getAnggotaValidation,
  searchAnggotaValidation,
  updateAnggotaValidation,
} from "../validation/anggota-validation.js";
import { updateFields } from "../utils/update-fields.js";
import { generateShortIdFromUUID } from "../utils/generate-uuid.js";

const createAnggota = async (request) => {
  request = validate(addAnggotaValidation, request);

  const countAnggota = await prismaClient.anggota.count({
    where: {
      nm_anggota: request.nm_anggota,
    },
  });

  if (countAnggota === 1) {
    throw new ResponseError("Anggota already exists");
  }

  request.id_anggota = generateShortIdFromUUID();

  request.created_at = generateDate();

  return prismaClient.anggota.create({
    data: request,
  });
};

const getAnggota = async (request) => {
  request = validate(getAnggotaValidation, request);

  const anggota = await prismaClient.anggota.findUnique({
    where: {
      id_anggota: request.id_anggota,
    },
  });

  if (!anggota) {
    throw new ResponseError("Anggota is not found");
  }

  return anggota;
};

const updateAnggota = async (request) => {
  request = validate(updateAnggotaValidation, request);
  const fieldAnggota = [
    "nm_anggota",
    "alamat",
    "no_telp",
    "limit_pinjaman",
    "pinjaman",
    "hutang",
  ];

  const totalAnggotaInDatabase = await prismaClient.anggota.count({
    where: {
      id_anggota: request.id_anggota,
    },
  });

  if (totalAnggotaInDatabase !== 1) {
    throw new ResponseError("Anggota is not found", {});
  }

  const data = {};
  updateFields(request, data, fieldAnggota);

  data.updated_at = generateDate();

  return prismaClient.anggota.update({
    where: {
      id_anggota: request.id_anggota,
    },
    data: data,
  });
};

const removeAnggota = async (request) => {
  request = validate(getAnggotaValidation, request);

  const totalInDatabase = await prismaClient.anggota.count({
    where: {
      id_anggota: request.id_anggota,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError("Anggota is not found", {});
  }

  return prismaClient.anggota.delete({
    where: {
      id_anggota: request.id_anggota,
    },
  });
};

const searchAnggota = async (request) => {
  // Apabila request sama dengan {}, maka langsung balikkan semua data anggota
  if (Object.keys(request).length === 0) {
    const anggota = await prismaClient.anggota.findMany();
    return {
      data_anggota: anggota,
      paging: {
        page: 1,
        total_item: anggota.length,
        total_page: 1,
      },
    };
  }
  request = validate(searchAnggotaValidation, request);

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

  const sortBy = request.sort_by || ["nm_anggota"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const anggota = await prismaClient.anggota.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  // Ambil id_anggota dari semua anggota
  const anggotaIds = anggota.map((item) => item.id_anggota);

  // Ambil total_nilai_jual per anggota dalam satu query
  const penjualanTotals = await prismaClient.penjualan.groupBy({
    by: ["id_anggota"],
    where: {
      id_anggota: { in: anggotaIds },
    },
    _sum: {
      total_nilai_jual: true,
    },
  });

  // Buat map untuk lookup cepat
  const penjualanMap = {};
  penjualanTotals.forEach((item) => {
    penjualanMap[item.id_anggota] = item._sum.total_nilai_jual || 0;
  });

  // Tambahkan total_nominal_transaksi ke setiap anggota
  anggota.forEach((item) => {
    item.total_nominal_transaksi = penjualanMap[item.id_anggota] || 0;
  });

  const totalItems = await prismaClient.anggota.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_anggota: anggota,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  createAnggota,
  getAnggota,
  updateAnggota,
  removeAnggota,
  searchAnggota,
};
