import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../utils/response-error.js";
import { generateDate } from "../utils/generate-date.js";
import {
  addStockTakeValidation,
  searchStockTakeValidation,
} from "../validation/stock-take-harian-validation.js";

const createStockTake = async (request) => {
  request = validate(addStockTakeValidation, request);

  request.created_at = generateDate();

  request.selisih = request.stok_akhir - request.stok_awal;

  //Update jumlah di table product
  const product = await prismaClient.product.findUnique({
    where: {
      id_product: request.id_product,
    },
  });

  if (!product) {
    throw new ResponseError("Product is not found");
  }

  await prismaClient.product.update({
    where: {
      id_product: request.id_product,
    },
    data: {
      jumlah: request.stok_akhir,
    },
  });

  return prismaClient.stockTake.create({
    data: request,
  });
};

const searchStockTake = async (request) => {
  request = validate(searchStockTakeValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.nm_product) {
    filters.push({
      nm_product: {
        contains: request.nm_product,
      },
    });
  }

  const sortBy = request.sort_by || ["created_at"];
  const sortOrder = request.sort_order || ["desc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const stocks = await prismaClient.stockTake.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.stockTake.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_stock: stocks,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  createStockTake,
  searchStockTake,
};
