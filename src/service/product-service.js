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
  // Apabila request sama dengan {}, maka langsung balikkan semua data supplier
  if (Object.keys(request).length === 0) {
    const products = await prismaClient.product.findMany();
    return {
      data_product: products,
      paging: {
        page: 1,
        total_item: products.length,
        total_page: 1,
      },
    };
  }

  request = validate(searchProductValidation, request);
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.id_supplier) {
    filters.push({
      id_supplier: {
        contains: request.id_supplier,
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

  // Jika status_product ada dalam request, tambahkan filter, termasuk jika bernilai false
  if (typeof request.status_product === "boolean") {
    filters.push({
      status_product: {
        equals: request.status_product,
      },
    });
  }

  const sortBy = request.sort_by || ["nm_product"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const products = await prismaClient.product.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  // Hitung total_jual dan total_beli secara manual
  const productsWithTotals = products.map((product) => ({
    ...product,
    total_jual: product.harga_jual * product.jumlah,
    total_beli: product.harga_beli * product.jumlah,
  }));

  const totalItems = await prismaClient.product.count({
    where: {
      AND: filters,
    },
  });

  const allProductsByFilter = await prismaClient.product.findMany({
    where: {
      AND: filters,
    },
  });

  // Lakukan perhitungan total keseluruhan secara manual
  let totalBeliKeseluruhan = 0;
  let totalJualKeseluruhan = 0;
  let totalJumlahKeseluruhan = 0;

  allProductsByFilter.forEach((product) => {
    totalBeliKeseluruhan += product.harga_beli * product.jumlah;
    totalJualKeseluruhan += product.harga_jual * product.jumlah;
  });

  totalJumlahKeseluruhan = allProductsByFilter.reduce(
    (acc, product) => acc + product.jumlah,
    0,
  );

  return {
    data_product: productsWithTotals,
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
