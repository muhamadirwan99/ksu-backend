import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../utils/response-error.js";
import { generateDate } from "../utils/generate-date.js";
import {
  addSupplierValidation,
  getSupplierValidation,
  searchSupplierValidation,
  updateSupplierValidation,
} from "../validation/supplier-validation.js";
import { updateFields } from "../utils/update-fields.js";

const createSupplier = async (request) => {
  const supplier = validate(addSupplierValidation, request);

  const countSupplier = await prismaClient.supplier.count({
    where: {
      id_supplier: supplier.id_supplier,
    },
  });

  if (countSupplier === 1) {
    throw new ResponseError("Supplier already exists");
  }

  supplier.created_at = generateDate();

  return prismaClient.supplier.create({
    data: supplier,
  });
};

const getSupplier = async (request) => {
  request = validate(getSupplierValidation, request);

  const supplier = await prismaClient.supplier.findUnique({
    where: {
      id_supplier: request.id_supplier,
    },
  });

  if (!supplier) {
    throw new ResponseError("Supplier is not found");
  }

  return supplier;
};

const updateSupplier = async (request) => {
  request = validate(updateSupplierValidation, request);
  const fieldSupplier = [
    "id_supplier",
    "nm_supplier",
    "nm_pemilik",
    "nm_pic",
    "no_wa",
    "alamat",
    "hutang_dagang",
  ];

  const totalSupplierInDatabase = await prismaClient.supplier.count({
    where: {
      id_supplier: request.id_supplier,
    },
  });

  if (totalSupplierInDatabase !== 1) {
    throw new ResponseError("Supplier is not found", {});
  }

  const data = {};
  updateFields(request, data, fieldSupplier);

  data.updated_at = generateDate();

  return prismaClient.supplier.update({
    where: {
      id_supplier: request.id_supplier,
    },
    data: data,
  });
};

const removeSupplier = async (request) => {
  request = validate(getSupplierValidation, request);

  const totalInDatabase = await prismaClient.supplier.count({
    where: {
      id_supplier: request.id_supplier,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError("Supplier is not found", {});
  }

  return prismaClient.supplier.delete({
    where: {
      id_supplier: request.id_supplier,
    },
  });
};

const searchSupplier = async (request) => {
  request = validate(searchSupplierValidation, request);

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

  const sortBy = request.sort_by || ["nm_supplier"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const roles = await prismaClient.supplier.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.supplier.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_supplier: roles,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  createSupplier,
  getSupplier,
  updateSupplier,
  removeSupplier,
  searchSupplier,
};
