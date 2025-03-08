import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../utils/response-error.js";
import { generateDate } from "../utils/generate-date.js";
import {
  addStockTakeValidation,
  rekonStockTakeValidation,
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
      updated_at: generateDate(),
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

  if (request?.is_selisih !== undefined) {
    filters.push({
      selisih: request.is_selisih ? { not: 0 } : { equals: 0 },
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

const rekonStockTake = async (request) => {
  request = validate(rekonStockTakeValidation, request);
  const { page, size, is_selisih } = request;

  // Ambil semua data stock take terbaru per id_product
  const latestStockTakes = await prismaClient.$queryRaw`
        SELECT s1.*
        FROM stocktake s1
                 JOIN (SELECT id_product, MAX(created_at) AS latest_created_at
                       FROM stocktake
                       GROUP BY id_product) s2
                      ON s1.id_product = s2.id_product AND s1.created_at = s2.latest_created_at
    `;

  // Ambil semua data product
  const products = await prismaClient.product.findMany();

  // Ambil semua data divisi untuk mengurangi query individual
  const divisiList = await prismaClient.divisi.findMany();
  const divisiMap = divisiList.reduce((acc, divisi) => {
    acc[divisi.id_divisi] = divisi.nm_divisi;
    return acc;
  }, {});

  // Gunakan Promise.all untuk menangani async dalam map
  let listProduct = await Promise.all(
    products.map(async (product) => {
      const divisiNama = divisiMap[product.id_divisi] || "Tidak Diketahui";

      const stockTake = latestStockTakes.find(
        (stockTake) => stockTake.id_product === product.id_product,
      );

      return {
        id_product: product.id_product,
        nm_product: product.nm_product,
        divisi: divisiNama,
        sisa: product.jumlah,
        stock: stockTake ? stockTake.stok_akhir : "",
        selisih: stockTake ? stockTake.selisih : "",
        petugas: stockTake ? stockTake.username : "",
        is_selisih: stockTake ? stockTake.selisih !== 0 : true,
      };
    }),
  );

  // **Filter berdasarkan isSelisih**
  if (is_selisih !== undefined) {
    listProduct = listProduct.filter(
      (product) => product.is_selisih === is_selisih,
    );
  }

  // **Pagination**
  const totalItems = listProduct.length;
  const totalPages = Math.ceil(totalItems / size);
  const paginatedData = listProduct.slice((page - 1) * size, page * size);

  return {
    data_stock: paginatedData,
    paging: {
      page: page,
      total_item: totalItems,
      total_page: totalPages,
    },
  };
};

export default {
  createStockTake,
  searchStockTake,
  rekonStockTake,
};
