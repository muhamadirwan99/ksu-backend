import { validate } from "../../validation/validation.js";
import { prismaClient } from "../../application/database.js";
import { ResponseError } from "../../utils/response-error.js";
import { generateDate } from "../../utils/generate-date.js";
import {
  addJenisCashValidation,
  listJenisCashValidation,
  removeJenisCashValidation,
  updateJenisCashValidation,
} from "../../validation/cash-in-out-validation.js";

const createJenisCash = async (request) => {
  request = validate(addJenisCashValidation, request);

  const countJenisCash = await prismaClient.referenceJenisCashInOut.count({
    where: {
      nm_jenis: request.nm_jenis,
    },
  });

  if (countJenisCash === 1) {
    throw new ResponseError("JenisCash already exists");
  }

  request.created_at = generateDate();

  return prismaClient.referenceJenisCashInOut.create({
    data: request,
  });
};

const updateJenisCash = async (request) => {
  request = validate(updateJenisCashValidation, request);

  const totalRoleInDatabase = await prismaClient.referenceJenisCashInOut.count({
    where: {
      id_jenis: request.id_jenis,
    },
  });

  if (totalRoleInDatabase !== 1) {
    throw new ResponseError("JenisCash is not found", {});
  }

  const data = {};

  if (request.nm_jenis) {
    data.nm_jenis = request.nm_jenis;
  }

  data.updated_at = generateDate();

  return prismaClient.referenceJenisCashInOut.update({
    where: {
      id_jenis: request.id_jenis,
    },
    data: data,
  });
};

const removeJenisCash = async (request) => {
  request = validate(removeJenisCashValidation, request);

  const totalInDatabase = await prismaClient.referenceJenisCashInOut.count({
    where: {
      id_jenis: request.id_jenis,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError("JenisCash is not found", {});
  }

  return prismaClient.referenceJenisCashInOut.delete({
    where: {
      id_jenis: request.id_jenis,
    },
  });
};

const listJenisCash = async (request) => {
  request = validate(listJenisCashValidation, request);

  return prismaClient.referenceJenisCashInOut.findMany({
    where: {
      id_cash: request.id_cash,
    },
  });
};

export default {
  createJenisCash,
  updateJenisCash,
  removeJenisCash,
  listJenisCash,
};
