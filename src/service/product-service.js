import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../utils/response-error.js";
import { generateDate } from "../utils/generate-date.js";
import {
  addProductValidation,
  getProductValidation,
  searchProductValidation,
  updateProductValidation,
} from "../validation/product-validation.js";
import { updateFields } from "../utils/update-fields.js";

const createProduct = async (request) => {
  request = validate(addProductValidation, request);

  const countProduct = await prismaClient.product.count({
    where: {
      id_product: request.id_product,
    },
  });

  if (countProduct === 1) {
    throw new ResponseError("Product already exists");
  }

  request.created_at = generateDate();

  return prismaClient.product.create({
    data: request,
  });
};

const getProduct = async (request) => {
  request = validate(getProductValidation, request);

  const product = await prismaClient.product.findUnique({
    where: {
      id_product: request.id_product,
    },
  });

  if (!product) {
    throw new ResponseError("Product is not found");
  }

  return product;
};

const updateProduct = async (request) => {
  request = validate(updateProductValidation, request);
  const fieldProduct = [
    "nm_product",
    "id_divisi",
    "id_supplier",
    "harga_jual",
    "harga_beli",
    "status_product",
    "jumlah",
    "keterangan",
  ];

  const totalProductInDatabase = await prismaClient.product.count({
    where: {
      id_product: request.id_product,
    },
  });

  if (totalProductInDatabase !== 1) {
    throw new ResponseError("Product is not found", {});
  }

  const data = {};
  updateFields(request, data, fieldProduct);

  data.updated_at = generateDate();

  return prismaClient.product.update({
    where: {
      id_product: request.id_product,
      updated_at: request.updated_at,
    },
    data: data,
  });
};

const removeProduct = async (request) => {
  request = validate(getProductValidation, request);

  const totalInDatabase = await prismaClient.product.count({
    where: {
      id_product: request.id_product,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError("Product is not found", {});
  }

  return prismaClient.product.delete({
    where: {
      id_product: request.id_product,
    },
  });
};

const searchProduct = async (request) => {
  request = validate(searchProductValidation, request);

  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.status_product) {
    filters.push({
      status_product: {
        equals: request.status_product,
      },
    });
  }

  if (request.nm_product) {
    filters.push({
      nm_product: {
        contains: request.nm_product,
      },
    });
  }

  const sortBy = request.sort_by || ["nm_product"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const roles = await prismaClient.product.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  // Hitung total_jual dan total_beli secara manual
  const rolesWithTotals = roles.map((product) => ({
    ...product,
    total_jual: product.harga_jual * product.jumlah,
    total_beli: product.harga_beli * product.jumlah,
  }));

  const totalItems = await prismaClient.product.count({
    where: {
      AND: filters,
    },
  });

  // Lakukan perhitungan total keseluruhan secara manual
  let totalBeliKeseluruhan = 0;
  let totalJualKeseluruhan = 0;
  let totalJumlahKeseluruhan = 0;

  rolesWithTotals.forEach((product) => {
    totalBeliKeseluruhan += product.total_beli;
    totalJualKeseluruhan += product.total_jual;
    totalJumlahKeseluruhan += product.jumlah;
  });

  return {
    data_product: rolesWithTotals,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
    total_keseluruhan: {
      total_jumlah: totalJumlahKeseluruhan,
      total_jual: totalJualKeseluruhan,
      total_beli: totalBeliKeseluruhan,
    },
  };
};

export default {
  createProduct,
  getProduct,
  updateProduct,
  removeProduct,
  searchProduct,
};
