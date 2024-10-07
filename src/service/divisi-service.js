import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import {
  addDivisiValidation,
  getDivisiValidation,
  searchDivisiValidation,
  updateDivisiValidation,
} from "../validation/divisi-validation.js";
import { generateDate } from "../utils/generate-date.js";
import { ResponseError } from "../utils/response-error.js";

const createDivisi = async (request) => {
  // Validasi input
  request = validate(addDivisiValidation, request);

  // Cek apakah nama divisi sudah ada di database
  const countDivisi = await prismaClient.divisi.count({
    where: {
      nm_divisi: request.nm_divisi,
    },
  });

  if (countDivisi > 0) {
    throw new ResponseError("Divisi already exists");
  }

  // Cari ID divisi terakhir yang sudah ada di database
  const lastDivisi = await prismaClient.divisi.findFirst({
    orderBy: {
      id_divisi: "desc", // Urutkan berdasarkan id_divisi secara descending
    },
  });

  // Generate ID divisi baru dengan format 01, 02, 03, dll.
  let newIdDivisi;
  if (lastDivisi) {
    const lastIdNumber = parseInt(lastDivisi.id_divisi); // Ambil angka dari ID terakhir
    newIdDivisi = String(lastIdNumber + 1).padStart(2, "0"); // Tambahkan 1 dan format jadi 2 digit
  } else {
    newIdDivisi = "01"; // Jika belum ada ID, mulai dari 01
  }

  // Set id_divisi dan created_at
  request.id_divisi = newIdDivisi;
  request.created_at = generateDate();

  return prismaClient.divisi.create({
    data: request,
    select: {
      id_divisi: true,
      nm_divisi: true,
    },
  });
};

const getDivisi = async (request) => {
  request = validate(getDivisiValidation, request);

  const divisi = await prismaClient.divisi.findUnique({
    where: {
      id_divisi: request.id_divisi,
    },
    select: {
      id_divisi: true,
      nm_divisi: true,
    },
  });

  if (!divisi) {
    throw new ResponseError("Divisi is not found");
  }

  return divisi;
};

const updateDivisi = async (request) => {
  request = validate(updateDivisiValidation, request);

  const totalDivisiInDatabase = await prismaClient.divisi.count({
    where: {
      id_divisi: request.id_divisi,
    },
  });

  if (totalDivisiInDatabase !== 1) {
    throw new ResponseError("Divisi is not found", {});
  }

  const data = {};

  if (request.id_divisi) {
    data.nm_divisi = request.nm_divisi;
  }

  data.updated_at = generateDate();

  return prismaClient.divisi.update({
    where: {
      id_divisi: request.id_divisi,
    },
    data: data,
    select: {
      nm_divisi: true,
    },
  });
};

const removeDivisi = async (request) => {
  request = validate(getDivisiValidation, request);

  const totalInDatabase = await prismaClient.divisi.count({
    where: {
      id_divisi: request.id_divisi,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError("Divisi is not found", {});
  }

  return prismaClient.divisi.delete({
    where: {
      id_divisi: request.id_divisi,
    },
  });
};

const searchDivisi = async (request) => {
  request = validate(searchDivisiValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.nm_divisi) {
    filters.push({
      nm_divisi: {
        contains: request.nm_divisi,
      },
    });
  }

  const sortBy = request.sort_by || ["nm_divisi"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const roles = await prismaClient.divisi.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.divisi.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_divisi: roles,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  createDivisi,
  getDivisi,
  updateDivisi,
  removeDivisi,
  searchDivisi,
};
