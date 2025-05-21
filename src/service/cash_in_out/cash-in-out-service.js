import { validate } from "../../validation/validation.js";
import { prismaClient } from "../../application/database.js";
import { generateDate } from "../../utils/generate-date.js";
import { ResponseError } from "../../utils/response-error.js";
import {
  addCashInOutValidation,
  getDetailCashInOutValidation,
  searchCashInOutValidation,
  updateCashInOutValidation,
} from "../../validation/cash-in-out-validation.js";
import { updateFields } from "../../utils/update-fields.js";
import { parse } from "date-fns";

const createCashInOut = async (request) => {
  // Validasi input
  request = validate(addCashInOutValidation, request);

  const lastCashInOut = await prismaClient.cashInOut.findFirst({
    orderBy: {
      id_cash_in_out: "desc",
    },
  });

  let newIdCashInOut;
  if (lastCashInOut) {
    const lastIdNumber = parseInt(lastCashInOut.id_cash_in_out); // Ambil angka dari ID terakhir
    newIdCashInOut = String(lastIdNumber + 1).padStart(3, "0"); // Tambahkan 1 dan format jadi 3 digit
  } else {
    newIdCashInOut = "001"; // Jika belum ada ID, mulai dari 001
  }

  request.id_cash_in_out = newIdCashInOut;

  // ubah request.tg_transaksi ke format date
  request.tg_transaksi = parse(
    request.tg_transaksi,
    "dd-MM-yyyy, HH:mm",
    new Date()
  );

  request.created_at = generateDate();

  return prismaClient.cashInOut.create({
    data: request,
  });
};

const getCashInOut = async (request) => {
  request = validate(getDetailCashInOutValidation, request);

  const cashInOut = await prismaClient.cashInOut.findUnique({
    where: {
      id_cash_in_out: request.id_cash_in_out,
    },
  });

  if (!cashInOut) {
    throw new ResponseError("CashInOut is not found");
  }

  return cashInOut;
};

const updateCashInOut = async (request) => {
  request = validate(updateCashInOutValidation, request);

  const fieldCashInOut = [
    "tg_transaksi",
    "id_cash",
    "id_jenis",
    "id_detail",
    "nominal",
    "keterangan",
  ];

  const totalInDatabase = await prismaClient.cashInOut.count({
    where: {
      id_cash_in_out: request.id_cash_in_out,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError("CashInOut is not found", {});
  }

  const data = {};
  updateFields(request, data, fieldCashInOut);

  // if (request.tg_transaksi) {
  //   data.tg_transaksi = parse(request.tg_transaksi);
  // }

  data.updated_at = generateDate();

  return prismaClient.cashInOut.update({
    where: {
      id_cash_in_out: request.id_cash_in_out,
    },
    data: data,
  });
};

const removeCashInOut = async (request) => {
  request = validate(getDetailCashInOutValidation, request);

  const totalInDatabase = await prismaClient.cashInOut.count({
    where: {
      id_cash_in_out: request.id_cash_in_out,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError("CashInOut is not found", {});
  }

  return prismaClient.cashInOut.delete({
    where: {
      id_cash_in_out: request.id_cash_in_out,
    },
  });
};

const searchCashInOut = async (request) => {
  request = validate(searchCashInOutValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.keterangan) {
    filters.push({
      keterangan: {
        contains: request.keterangan,
      },
    });
  }

  if (request.id_cash) {
    filters.push({
      id_cash: {
        contains: request.id_cash,
      },
    });
  }

  const sortBy = request.sort_by || ["tg_transaksi"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const dataCashInOut = await prismaClient.cashInOut.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  //mendapatkan nama jenis cash
  for (let i = 0; i < dataCashInOut.length; i++) {
    const jenisCash = await prismaClient.referenceJenisCashInOut.findUnique({
      where: {
        id_jenis: dataCashInOut[i].id_jenis,
      },
    });

    dataCashInOut[i].nm_jenis = jenisCash.nm_jenis;
  }

  //mendapatkan nama detail cash
  for (let i = 0; i < dataCashInOut.length; i++) {
    const detailCash = await prismaClient.referenceDetailCashInOut.findUnique({
      where: {
        id_detail: dataCashInOut[i].id_detail,
      },
    });

    dataCashInOut[i].nm_detail = detailCash.nm_detail;
  }

  const totalItems = await prismaClient.cashInOut.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_cash_in_out: dataCashInOut,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  createCashInOut,
  getCashInOut,
  updateCashInOut,
  removeCashInOut,
  searchCashInOut,
};
