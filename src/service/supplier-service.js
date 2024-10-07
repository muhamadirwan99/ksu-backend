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
import { generateSupplierId } from "../utils/generate-supplier-id.js";

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
  supplier.id_supplier = generateSupplierId();
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

  const filters = [];

  // Jika ada nm_supplier, tambahkan filter
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

  // Ambil semua data supplier dengan atau tanpa filter
  const roles = await prismaClient.supplier.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    orderBy: orderBy,
  });

  // Hitung total data
  const totalItems = roles.length;

  return {
    data_supplier: roles,
    paging: {
      total_item: totalItems,
      // Karena mengambil semua data, tidak ada konsep "page" atau "total_page"
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
