import { validate } from "../../validation/validation.js";
import { prismaClient } from "../../application/database.js";
import { ResponseError } from "../../utils/response-error.js";
import { generateDate } from "../../utils/generate-date.js";
import {
  addCashValidation,
  removeCashValidation,
  updateCashValidation,
} from "../../validation/cash-in-out-validation.js";

const createCash = async (request) => {
  request = validate(addCashValidation, request);

  const countCash = await prismaClient.referenceCashInOut.count({
    where: {
      nm_jenis: request.nm_jenis,
    },
  });

  if (countCash === 1) {
    throw new ResponseError("Cash already exists");
  }

  request.created_at = generateDate();

  return prismaClient.referenceCashInOut.create({
    data: request,
    select: {
      id_cash: true,
      nm_jenis: true,
    },
  });
};

const updateCash = async (request) => {
  request = validate(updateCashValidation, request);

  const totalRoleInDatabase = await prismaClient.referenceCashInOut.count({
    where: {
      id_cash: request.id_cash,
    },
  });

  if (totalRoleInDatabase !== 1) {
    throw new ResponseError("Cash is not found", {});
  }

  const data = {};

  if (request.nm_jenis) {
    data.nm_jenis = request.nm_jenis;
  }

  data.updated_at = generateDate();

  return prismaClient.referenceCashInOut.update({
    where: {
      id_cash: request.id_cash,
    },
    data: data,
  });
};

const removeCash = async (request) => {
  request = validate(removeCashValidation, request);

  const totalInDatabase = await prismaClient.referenceCashInOut.count({
    where: {
      id_cash: request.id_cash,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError("Cash is not found", {});
  }

  return prismaClient.referenceCashInOut.delete({
    where: {
      id_cash: request.id_cash,
    },
  });
};

const listCash = async () => {
  return prismaClient.referenceCashInOut.findMany();
};

export default {
  createCash,
  updateCash,
  removeCash,
  listCash,
};
