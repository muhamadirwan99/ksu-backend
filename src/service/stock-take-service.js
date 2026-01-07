import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../utils/response-error.js";
import { generateDate } from "../utils/generate-date.js";
import {
  addStockTakeValidation,
  detailRekonStockTakeValidation,
  rekonStockTakeValidation,
  searchStockTakeValidation,
  getDailySOProductsValidation,
  batchSaveDailySOValidation,
  checkSOStatusValidation,
} from "../validation/stock-take-harian-validation.js";

// ===== HELPER FUNCTIONS FOR BUSINESS LOGIC VALIDATION =====

/**
 * Check if Tutup Kasir has been done for the given date
 */
const checkTutupKasir = async (tanggal) => {
  const tutupKasir = await prismaClient.tutupKasir.findFirst({
    where: {
      tg_tutup_kasir: {
        contains: tanggal,
      },
    },
  });

  if (!tutupKasir) {
    throw new ResponseError(
      "Harap lakukan Tutup Kasir terlebih dahulu sebelum melakukan Stock Opname"
    );
  }

  return tutupKasir;
};

/**
 * Check if Stock Opname has already been done for the given date
 */
const checkSOStatus = async (tanggal) => {
  const tutupKasir = await checkTutupKasir(tanggal);

  if (tutupKasir.is_stocktake_done) {
    throw new ResponseError(
      "Stock Opname untuk tanggal ini sudah selesai dan dikonfirmasi"
    );
  }

  return tutupKasir;
};

/**
 * Validate that all sold products have been stock-taken
 */
const validateAllProductsDone = async (products, tanggal) => {
  // Get products that were sold on the given date
  const salesToday = await prismaClient.penjualan.findMany({
    where: {
      tg_penjualan: {
        contains: tanggal,
      },
    },
    include: {
      DetailPenjualan: true,
    },
  });

  // Extract unique product IDs that were sold
  const soldProductIds = new Set();
  salesToday.forEach((sale) => {
    sale.DetailPenjualan.forEach((detail) => {
      soldProductIds.add(detail.id_product);
    });
  });

  const soldProductsCount = soldProductIds.size;

  if (products.length !== soldProductsCount) {
    throw new ResponseError(
      `Semua produk yang terjual harus di-stock opname. Total produk terjual: ${soldProductsCount}, produk yang di-SO: ${products.length}`
    );
  }
};

// ===== END HELPER FUNCTIONS =====

const createStockTake = async (request) => {
  request = validate(addStockTakeValidation, request);

  // 1. Extract tanggal from tg_stocktake
  const [tanggal] = request.tg_stocktake.split(", ");

  // 2. Check if Tutup Kasir has been done (will throw error if not)
  const tutupKasir = await checkSOStatus(tanggal);

  // 3. Set created_at
  request.created_at = generateDate();

  // 4. Calculate selisih
  request.selisih = request.stok_akhir - request.stok_awal;

  // 5. Validate product exists
  const product = await prismaClient.product.findUnique({
    where: {
      id_product: request.id_product,
    },
  });

  if (!product) {
    throw new ResponseError("Product is not found");
  }

  // 6. Use transaction to ensure data consistency
  return await prismaClient.$transaction(async (prisma) => {
    // Update product jumlah
    await prisma.product.update({
      where: {
        id_product: request.id_product,
      },
      data: {
        jumlah: request.stok_akhir,
        updated_at: generateDate(),
      },
    });

    // Create stocktake record with id_tutup_kasir
    return prisma.stockTake.create({
      data: {
        ...request,
        id_tutup_kasir: tutupKasir.id_tutup_kasir,
      },
    });
  });
};

const searchStockTake = async (request) => {
  request = validate(searchStockTakeValidation, request);

  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.nm_product) {
    filters.push({
      nm_product: {
        contains: request.nm_product,
      },
    });
  }

  if (request.month && request.year) {
    // Format: DD-MM-YYYY, HH:MM:SS
    const monthStr = String(request.month).padStart(2, "0");
    const yearStr = String(request.year);

    filters.push({
      tg_stocktake: {
        contains: `-${monthStr}-${yearStr}`,
      },
    });
  } else if (request.year) {
    // Filter hanya berdasarkan tahun
    filters.push({
      tg_stocktake: {
        contains: `-${request.year}`,
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

  // Ambil semua ID produk dari hasil stocktake
  const productIds = stocks.map((stock) => stock.id_product);

  // Ambil data produk terkait
  const products = await prismaClient.product.findMany({
    where: {
      id_product: {
        in: productIds,
      },
    },
  });

  const productMap = products.reduce((acc, product) => {
    acc[product.id_product] = product;
    return acc;
  }, {});

  // Tambahkan informasi harga dan perhitungan ke hasil stocks
  const enrichedStocks = stocks.map((stock) => {
    const product = productMap[stock.id_product];
    const jumlahProduk = stock.stok_awal ?? 0;
    const jumlahStocktake = stock.stok_akhir ?? "";
    const hargaJual = product?.harga_jual ?? 0;

    const totalHargaJualStock = jumlahProduk * hargaJual;
    const totalHargaJualStockTake =
      jumlahStocktake !== "" ? jumlahStocktake * hargaJual : "";
    const selisihHargaJual = totalHargaJualStockTake - totalHargaJualStock;

    return {
      ...stock,
      total_harga_jual_stock: totalHargaJualStock,
      total_harga_jual_stocktake: totalHargaJualStockTake,
      selisih_harga_jual: selisihHargaJual,
    };
  });

  return {
    data_stock: enrichedStocks,
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
  const products = await prismaClient.product.findMany({
    where: {
      status_product: true,
    },
  });

  // Gunakan Promise.all untuk menangani async dalam map
  // Ambil semua data divisi
  const divisions = await prismaClient.divisi.findMany();

  // Buat mapping produk per divisi
  const productsByDivisi = products.reduce((acc, product) => {
    if (!acc[product.id_divisi]) acc[product.id_divisi] = [];
    acc[product.id_divisi].push(product);
    return acc;
  }, {});

  // Untuk setiap divisi, totalkan data produk-produknya
  let listProduct = await Promise.all(
    divisions.map(async (divisi) => {
      const productsInDivisi = productsByDivisi[divisi.id_divisi] || [];

      let stock = 0;
      let stock_take = 0;
      let total_harga_jual_stock = 0;
      let total_harga_jual_stocktake = 0;
      let selisih_harga_jual = 0;
      let selisih = 0;

      productsInDivisi.forEach((product) => {
        const stockTake = latestStockTakes.find(
          (st) => st.id_product === product.id_product
        );
        const jumlahProduk = stockTake?.stok_awal ?? 0;
        const jumlahStocktake = stockTake?.stok_akhir ?? 0;
        const hargaJual = product.harga_jual ?? 0;

        stock += jumlahProduk;
        stock_take += jumlahStocktake;
        total_harga_jual_stock += jumlahProduk * hargaJual;
        total_harga_jual_stocktake += jumlahStocktake * hargaJual;
        selisih_harga_jual += (jumlahStocktake - jumlahProduk) * hargaJual;
      });

      selisih = stock_take - stock;

      return {
        id_divisi: divisi.id_divisi,
        nm_divisi: divisi.nm_divisi,
        stock,
        stock_take,
        total_harga_jual_stock,
        total_harga_jual_stocktake,
        selisih_harga_jual,
        selisih,
      };
    })
  );

  // **Filter berdasarkan isSelisih**
  if (is_selisih !== undefined) {
    listProduct = listProduct.filter(
      (product) => product.is_selisih === is_selisih
    );
  }

  // **Total Stock, Stock Take, dan Selisih**
  const totalStock = listProduct.reduce(
    (acc, product) => acc + product.stock,
    0
  );
  const totalStockTake = listProduct.reduce(
    (acc, product) => acc + product.stock_take,
    0
  );
  const totalSelisih = totalStockTake - totalStock;
  const totalHargaJualStock = listProduct.reduce(
    (acc, product) => acc + product.total_harga_jual_stock,
    0
  );
  const totalHargaJualStockTake = listProduct.reduce(
    (acc, product) => acc + product.total_harga_jual_stocktake,
    0
  );
  const totalSelisihHargaJual = totalHargaJualStockTake - totalHargaJualStock;

  const totalData = {
    total_stock: totalStock,
    total_harga_jual_stock: totalHargaJualStock,
    total_stock_take: totalStockTake,
    total_harga_jual_stocktake: totalHargaJualStockTake,
    total_selisih: totalSelisih,
    total_selisih_harga_jual: totalSelisihHargaJual,
  };

  // **Pagination**
  const totalItems = listProduct.length;
  const totalPages = Math.ceil(totalItems / size);
  const paginatedData = listProduct.slice((page - 1) * size, page * size);

  return {
    data_stock: paginatedData,
    total_data: totalData,
    paging: {
      page: page,
      total_item: totalItems,
      total_page: totalPages,
    },
  };
};

const detailRekonStockTake = async (request) => {
  request = validate(detailRekonStockTakeValidation, request);
  const { page, size, is_selisih, is_done_stocktake } = request;

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
  const products = await prismaClient.product.findMany({
    where: {
      status_product: true,
      id_divisi: request.id_divisi,
    },
  });

  // Gunakan Promise.all untuk menangani async dalam map
  let listProduct = await Promise.all(
    products.map(async (product) => {
      const stockTake = latestStockTakes.find(
        (stockTake) => stockTake.id_product === product.id_product
      );

      const jumlahProduk = stockTake?.stok_awal ?? 0;
      const jumlahStocktake = stockTake?.stok_akhir ?? 0;
      const hargaJual = product?.harga_jual ?? 0;

      const totalHargaJualStock = jumlahProduk * hargaJual;
      const totalHargaJualStockTake =
        jumlahStocktake !== "" ? jumlahStocktake * hargaJual : "";

      const selisih = jumlahStocktake - jumlahProduk;
      const isSelisih = jumlahStocktake != jumlahProduk;

      const selisihHargaJual = totalHargaJualStockTake - totalHargaJualStock;

      const petugas = stockTake ? stockTake.username : "";

      return {
        id_product: product.id_product,
        nm_product: product.nm_product,
        stock: jumlahProduk,
        stock_take: jumlahStocktake,
        total_harga_jual_stock: totalHargaJualStock,
        total_harga_jual_stocktake: totalHargaJualStockTake,
        selisih_harga_jual: selisihHargaJual,
        selisih: selisih,
        petugas: petugas,
        is_done_stocktake: petugas ? true : false,
        is_selisih: isSelisih,
      };
    })
  );

  // **Filter berdasarkan isSelisih**
  if (is_selisih !== undefined) {
    listProduct = listProduct.filter(
      (product) => product.is_selisih === is_selisih
    );
  }

  if (is_done_stocktake !== undefined) {
    listProduct = listProduct.filter(
      (product) => product.is_done_stocktake === is_done_stocktake
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

/**
 * Get list of products for daily stock opname
 * Grouped by divisi with status information
 * Only includes products that were sold on the given date
 */
const getDailySOProducts = async (request) => {
  request = validate(getDailySOProductsValidation, request);

  const [tanggal] = request.tg_stocktake.split(", ");

  // Check if Tutup Kasir has been done
  const tutupKasir = await checkTutupKasir(tanggal);

  // Get products that were sold today by querying sales
  // Get all sales for today
  const salesToday = await prismaClient.penjualan.findMany({
    where: {
      tg_penjualan: {
        contains: tanggal,
      },
    },
    include: {
      DetailPenjualan: {
        include: {
          product: {
            include: {
              divisi: true,
            },
          },
        },
      },
    },
  });

  // Extract unique products that were sold
  const soldProductsMap = new Map();
  salesToday.forEach((sale) => {
    sale.DetailPenjualan.forEach((detail) => {
      if (!soldProductsMap.has(detail.id_product)) {
        soldProductsMap.set(detail.id_product, detail.product);
      }
    });
  });

  // Convert to array
  const soldProducts = Array.from(soldProductsMap.values());

  // If no products sold today, return empty result
  if (soldProducts.length === 0) {
    return {
      id_tutup_kasir: tutupKasir.id_tutup_kasir,
      tg_stocktake: request.tg_stocktake,
      is_stocktake_done: tutupKasir.is_stocktake_done,
      summary: {
        total_products: 0,
        completed: 0,
        remaining: 0,
        progress_percentage: 0,
      },
      divisi_list: [],
    };
  }

  // Get stock take records for today
  const stockTakesToday = await prismaClient.stockTake.findMany({
    where: {
      tg_stocktake: request.tg_stocktake,
    },
  });

  // Create a map for quick lookup
  const stockTakeMap = stockTakesToday.reduce((acc, st) => {
    acc[st.id_product] = st;
    return acc;
  }, {});

  // Group products by divisi
  const productsByDivisi = {};
  soldProducts.forEach((product) => {
    const divisiId = product.id_divisi;
    if (!productsByDivisi[divisiId]) {
      productsByDivisi[divisiId] = {
        id_divisi: divisiId,
        nm_divisi: product.divisi.nm_divisi,
        products: [],
      };
    }

    const stockTake = stockTakeMap[product.id_product];
    productsByDivisi[divisiId].products.push({
      id_product: product.id_product,
      nm_product: product.nm_product,
      stok_sistem: product.jumlah,
      stok_fisik: stockTake ? stockTake.stok_akhir : null,
      selisih: stockTake ? stockTake.selisih : null,
      is_done: !!stockTake,
      petugas: stockTake ? stockTake.username : null,
      keterangan: stockTake ? stockTake.keterangan : null,
    });
  });

  // Convert to array
  const divisiList = Object.values(productsByDivisi);

  // Calculate summary
  const totalProducts = soldProducts.length;
  const completedProducts = stockTakesToday.filter((st) =>
    soldProductsMap.has(st.id_product)
  ).length;
  const remainingProducts = totalProducts - completedProducts;
  const progressPercentage =
    totalProducts > 0
      ? ((completedProducts / totalProducts) * 100).toFixed(2)
      : 0;

  return {
    id_tutup_kasir: tutupKasir.id_tutup_kasir,
    tg_stocktake: request.tg_stocktake,
    is_stocktake_done: tutupKasir.is_stocktake_done,
    summary: {
      total_products: totalProducts,
      completed: completedProducts,
      remaining: remainingProducts,
      progress_percentage: parseFloat(progressPercentage),
    },
    divisi_list: divisiList,
  };
};

/**
 * Batch save daily stock opname for multiple products
 * Updates all products and marks tutup kasir as complete
 */
const batchSaveDailySO = async (request) => {
  request = validate(batchSaveDailySOValidation, request);

  const [tanggal] = request.tg_stocktake.split(", ");

  // 1. Check if Tutup Kasir exists and SO not done yet
  const tutupKasir = await checkSOStatus(tanggal);

  // 2. Validate all sold products must be included
  await validateAllProductsDone(request.products, tanggal);

  // 3. Validate all products exist
  const productIds = request.products.map((p) => p.id_product);
  const existingProducts = await prismaClient.product.findMany({
    where: {
      id_product: {
        in: productIds,
      },
    },
  });

  if (existingProducts.length !== request.products.length) {
    throw new ResponseError("Beberapa produk tidak ditemukan di database");
  }

  // 4. Use transaction to save all stock takes and update products
  const result = await prismaClient.$transaction(async (prisma) => {
    const createdStockTakes = [];
    const updates = [];

    // Process each product
    for (const productData of request.products) {
      const selisih = productData.stok_akhir - productData.stok_awal;

      // Update product jumlah
      const updatePromise = prisma.product.update({
        where: {
          id_product: productData.id_product,
        },
        data: {
          jumlah: productData.stok_akhir,
          updated_at: generateDate(),
        },
      });
      updates.push(updatePromise);

      // Check if stock take already exists for this product today
      const existingStockTake = await prisma.stockTake.findFirst({
        where: {
          id_product: productData.id_product,
          tg_stocktake: request.tg_stocktake,
        },
      });

      let stockTakePromise;
      if (existingStockTake) {
        // Update existing
        stockTakePromise = prisma.stockTake.update({
          where: {
            id_stocktake: existingStockTake.id_stocktake,
          },
          data: {
            stok_awal: productData.stok_awal,
            stok_akhir: productData.stok_akhir,
            selisih: selisih,
            is_confirmed: true,
            keterangan: productData.keterangan || null,
            updated_at: generateDate(),
          },
        });
      } else {
        // Create new
        stockTakePromise = prisma.stockTake.create({
          data: {
            tg_stocktake: request.tg_stocktake,
            id_product: productData.id_product,
            nm_product: productData.nm_product,
            stok_awal: productData.stok_awal,
            stok_akhir: productData.stok_akhir,
            selisih: selisih,
            username: request.username,
            name: request.name,
            id_tutup_kasir: request.id_tutup_kasir,
            is_confirmed: true,
            keterangan: productData.keterangan || null,
            created_at: generateDate(),
          },
        });
      }
      createdStockTakes.push(stockTakePromise);
    }

    // Execute all updates and creates
    await Promise.all(updates);
    const stockTakes = await Promise.all(createdStockTakes);

    // 5. Mark Tutup Kasir as stock opname done
    await prisma.tutupKasir.update({
      where: {
        id_tutup_kasir: request.id_tutup_kasir,
      },
      data: {
        is_stocktake_done: true,
        stocktake_completed_at: generateDate(),
        updated_at: generateDate(),
      },
    });

    return {
      total_products: stockTakes.length,
      id_tutup_kasir: request.id_tutup_kasir,
      completed_at: generateDate(),
    };
  });

  return result;
};

/**
 * Check SO status for a given date
 */
const checkSOStatusOnly = async (request) => {
  request = validate(checkSOStatusValidation, request);

  const [tanggal] = request.tg_stocktake.split(", ");

  // Check if Tutup Kasir exists
  const tutupKasir = await prismaClient.tutupKasir.findFirst({
    where: {
      tg_tutup_kasir: {
        contains: tanggal,
      },
    },
  });

  if (!tutupKasir) {
    return {
      is_tutup_kasir_done: false,
      is_stocktake_done: false,
      message: "Tutup Kasir belum dilakukan untuk tanggal ini",
    };
  }

  // Get products that were sold on the given date
  const salesToday = await prismaClient.penjualan.findMany({
    where: {
      tg_penjualan: {
        contains: tanggal,
      },
    },
    include: {
      DetailPenjualan: true,
    },
  });

  // Extract unique product IDs that were sold
  const soldProductIds = new Set();
  salesToday.forEach((sale) => {
    sale.DetailPenjualan.forEach((detail) => {
      soldProductIds.add(detail.id_product);
    });
  });

  const totalSoldProducts = soldProductIds.size;

  // Count completed stock takes for today (only for sold products)
  const stockTakesToday = await prismaClient.stockTake.findMany({
    where: {
      tg_stocktake: request.tg_stocktake,
    },
  });

  const completedCount = stockTakesToday.filter((st) =>
    soldProductIds.has(st.id_product)
  ).length;

  return {
    is_tutup_kasir_done: true,
    is_stocktake_done: tutupKasir.is_stocktake_done,
    id_tutup_kasir: tutupKasir.id_tutup_kasir,
    tg_tutup_kasir: tutupKasir.tg_tutup_kasir,
    shift: tutupKasir.shift,
    stocktake_completed_at: tutupKasir.stocktake_completed_at,
    progress: {
      completed: completedCount,
      total: totalSoldProducts,
      percentage:
        totalSoldProducts > 0
          ? ((completedCount / totalSoldProducts) * 100).toFixed(2)
          : 0,
    },
  };
};

export default {
  createStockTake,
  searchStockTake,
  rekonStockTake,
  detailRekonStockTake,
  getDailySOProducts,
  batchSaveDailySO,
  checkSOStatusOnly,
};
