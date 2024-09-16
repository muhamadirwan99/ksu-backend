import { validate } from "../../validation/validation.js";
import { prismaClient } from "../../application/database.js";
import { ResponseError } from "../../utils/response-error.js";
import { generateDate } from "../../utils/generate-date.js";
import {
  addDetailCashValidation,
  listDetailCashValidation,
  removeDetailCashValidation,
  updateDetailCashValidation,
} from "../../validation/cash-in-out-validation.js";

const createDetailCash = async (request) => {
  request = validate(addDetailCashValidation, request);

  const countDetailCash = await prismaClient.referenceDetailCashInOut.count({
    where: {
      nm_detail: request.nm_detail,
    },
  });

  if (countDetailCash === 1) {
    throw new ResponseError("DetailCash already exists");
  }

  request.created_at = generateDate();

  return prismaClient.referenceDetailCashInOut.create({
    data: request,
  });
};

const updateDetailCash = async (request) => {
  request = validate(updateDetailCashValidation, request);

  const totalRoleInDatabase = await prismaClient.referenceDetailCashInOut.count(
    {
      where: {
        id_detail: request.id_detail,
      },
    },
  );

  if (totalRoleInDatabase !== 1) {
    throw new ResponseError("DetailCash is not found", {});
  }

  const data = {};

  if (request.nm_detail) {
    data.nm_detail = request.nm_detail;
  }

  data.updated_at = generateDate();

  return prismaClient.referenceDetailCashInOut.update({
    where: {
      id_detail: request.id_detail,
    },
    data: data,
  });
};

const removeDetailCash = async (request) => {
  request = validate(removeDetailCashValidation, request);

  const totalInDatabase = await prismaClient.referenceDetailCashInOut.count({
    where: {
      id_detail: request.id_detail,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError("DetailCash is not found", {});
  }

  return prismaClient.referenceDetailCashInOut.delete({
    where: {
      id_detail: request.id_detail,
    },
  });
};

const listDetailCash = async (request) => {
  request = validate(listDetailCashValidation, request);

  return prismaClient.referenceDetailCashInOut.findMany({
    where: {
      id_cash: request.id_cash,
      id_jenis: request.id_jenis,
    },
  });
};

export default {
  createDetailCash,
  updateDetailCash,
  removeDetailCash,
  listDetailCash,
};
