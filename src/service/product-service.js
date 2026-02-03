import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../utils/response-error.js";
import { generateDate } from "../utils/generate-date.js";
import {
  addProductValidation,
  aktivitasStockValidation,
  getProductValidation,
  searchProductValidation,
  updateProductValidation,
  getProductHistoryValidation,
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
  request.jumlah = 0;

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

const updateProduct = async (request, username) => {
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

  // Ambil data product yang lama untuk membandingkan jumlah
  const oldProduct = await prismaClient.product.findUnique({
    where: {
      id_product: request.id_product,
    },
  });

  const data = {};
  updateFields(request, data, fieldProduct);

  data.updated_at = generateDate();

  // Update product
  const updatedProduct = await prismaClient.product.update({
    where: {
      id_product: request.id_product,
      updated_at: request.updated_at,
    },
    data: data,
  });

  // Jika jumlah berubah, tambahkan log ke ProductHistoryLog
  if (request.jumlah !== undefined && oldProduct.jumlah !== request.jumlah) {
    const nm_divisi = await prismaClient.divisi
      .findUnique({
        where: {
          id_divisi: updatedProduct.id_divisi,
        },
      })
      .then((divisi) => (divisi ? divisi.nm_divisi : "Unknown"));

    await prismaClient.productHistoryLog.create({
      data: {
        id_product: request.id_product,
        nm_product: updatedProduct.nm_product,
        nm_divisi: nm_divisi,
        jumlah_sebelum: oldProduct.jumlah,
        jumlah_sesudah: request.jumlah,
        selisih: request.jumlah - oldProduct.jumlah,
        username: username || "system",
        keterangan: request.keterangan_log || "Update jumlah product manual",
        created_at: generateDate(),
      },
    });
  }

  return updatedProduct;
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

const aktivitasStock = async (request) => {
  request = validate(aktivitasStockValidation, request);
  const skip = (request.page - 1) * request.size;

  const productConditions = [];
  if (request.id_product) {
    productConditions.push({ id_product: { equals: request.id_product } });
  }
  if (request.nm_produk) {
    productConditions.push({ nm_produk: { contains: request.nm_produk } });
  }

  const filterPenjualan =
    productConditions.length > 0
      ? {
          DetailPenjualan: {
            some: {
              AND: productConditions,
            },
          },
        }
      : {};

  const filterPembelian =
    productConditions.length > 0
      ? {
          DetailPembelian: {
            some: {
              AND: productConditions,
            },
          },
        }
      : {};

  const filterStockTake = {};
  if (request.id_product) {
    filterStockTake.id_product = { contains: request.id_product };
  }
  if (request.nm_produk) {
    filterStockTake.nm_product = { contains: request.nm_produk };
  }

  const penjualanList = await prismaClient.penjualan.findMany({
    where: filterPenjualan,
    include: { DetailPenjualan: true },
    orderBy: { id_penjualan: "desc" },
  });

  const pembelianList = await prismaClient.pembelian.findMany({
    where: filterPembelian,
    include: { DetailPembelian: true },
    orderBy: { id_pembelian: "desc" },
  });

  const stockTake = await prismaClient.stocktakeItem.findMany({
    where: filterStockTake,
    orderBy: { id_stocktake_item: "desc" },
  });

  const productUpdateHistory = await prismaClient.productHistoryLog.findMany({
    where: filterStockTake,
    orderBy: { created_at: "desc" },
  });

  const aktivitas = penjualanList.flatMap((penjualanItem) =>
    penjualanItem.DetailPenjualan.filter((detail) => {
      const matchId = request.id_product
        ? detail.id_product.includes(request.id_product)
        : true;
      const matchName = request.nm_produk
        ? detail.nm_produk.includes(request.nm_produk)
        : true;
      return matchId && matchName;
    }).map((detail) => ({
      tg_aktivitas: detail.created_at,
      tg_update_aktivitas: detail.updated_at || detail.created_at,
      id_product: detail.id_product,
      nm_product: detail.nm_produk,
      divisi: detail.nm_divisi,
      jumlah_transaksi: -detail.jumlah, // nilai negatif untuk penjualan
      jumlah_display: "-" + detail.jumlah, // untuk display
      aktivitas: "Penjualan",
      id_aktivitas: detail.id_penjualan,
      user: penjualanItem.username || "",
    })),
  );

  aktivitas.push(
    ...pembelianList.flatMap((pembelianItem) =>
      pembelianItem.DetailPembelian.filter((detail) => {
        const matchId = request.id_product
          ? detail.id_product.includes(request.id_product)
          : true;
        const matchName = request.nm_produk
          ? detail.nm_produk.includes(request.nm_produk)
          : true;
        return matchId && matchName;
      }).map((detail) => ({
        tg_aktivitas: detail.created_at,
        tg_update_aktivitas: detail.updated_at || detail.created_at,
        id_product: detail.id_product,
        nm_product: detail.nm_produk,
        divisi: detail.nm_divisi,
        jumlah_transaksi: detail.jumlah, // nilai positif untuk pembelian
        jumlah_display: detail.jumlah, // untuk display
        aktivitas: "Pembelian",
        id_aktivitas: detail.id_pembelian,
        user: pembelianItem.username || "",
      })),
    ),
  );

  aktivitas.push(
    ...stockTake.map((stockItem) => ({
      tg_aktivitas: stockItem.counted_at,
      tg_update_aktivitas: stockItem.counted_at || stockItem.counted_at,
      id_product: stockItem.id_product,
      nm_product: stockItem.nm_product,
      divisi: stockItem.nm_divisi,
      stok_fisik: stockItem.stok_fisik, // nilai benar untuk checkpoint
      stok_sistem: stockItem.stok_sistem, // nilai sistem sebelum koreksi
      jumlah_transaksi: stockItem.selisih, // selisih untuk display dan perhitungan
      jumlah_display:
        stockItem.selisih === 0
          ? "0"
          : (stockItem.selisih > 0 ? "+" : "") + stockItem.selisih, // tampilkan selisih
      aktivitas: "Stock Take",
      id_aktivitas: stockItem.id_stocktake_item.toString(),
      user: stockItem.username || "",
      is_checkpoint: true, // marker bahwa ini adalah checkpoint
    })),
  );

  aktivitas.push(
    ...productUpdateHistory.map((historyItem) => ({
      tg_aktivitas: historyItem.created_at,
      tg_update_aktivitas: historyItem.created_at || historyItem.created_at,
      id_product: historyItem.id_product,
      nm_product: historyItem.nm_product,
      divisi: historyItem.nm_divisi,
      stok_fisik: historyItem.jumlah_sesudah, // nilai benar untuk checkpoint
      stok_sistem: historyItem.jumlah_sebelum, // nilai sistem sebelum koreksi
      jumlah_transaksi: historyItem.selisih, // selisih untuk display dan perhitungan
      jumlah_display:
        historyItem.selisih === 0
          ? "0"
          : (historyItem.selisih > 0 ? "+" : "") + historyItem.selisih, // tampilkan selisih
      aktivitas: "Product Update",
      id_aktivitas: historyItem.id_log.toString(),
      user: historyItem.username || "",
      is_checkpoint: true, // marker bahwa ini adalah checkpoint
    })),
  );

  // Sort aktivitas dari yang paling lama ke yang paling baru untuk menghitung running balance
  aktivitas.sort((a, b) => new Date(a.tg_aktivitas) - new Date(b.tg_aktivitas));

  // Hitung running balance per produk dengan checkpoint dari stocktake
  const stockBalance = {}; // Menyimpan stock per id_product

  aktivitas.forEach((item) => {
    // Inisialisasi stock jika belum ada
    if (!stockBalance[item.id_product]) {
      stockBalance[item.id_product] = 0;
    }

    // Jika ini adalah stocktake (checkpoint), reset balance ke nilai yang benar
    if (item.is_checkpoint) {
      // Stock sebelumnya adalah stok_sistem (nilai sebelum koreksi)
      item.stock_sebelumnya = item.stok_sistem;

      // Stock setelahnya adalah stok_fisik (nilai yang benar setelah stocktake)
      item.stock_setelahnya = item.stok_fisik;

      // Reset balance ke nilai yang benar dari stocktake
      stockBalance[item.id_product] = item.stok_fisik;

      // Cleanup field sementara
      delete item.stok_fisik;
      delete item.stok_sistem;
      delete item.is_checkpoint;
    } else {
      // Untuk transaksi biasa (pembelian/penjualan)
      // Simpan stock sebelum transaksi
      item.stock_sebelumnya = stockBalance[item.id_product];

      // Update stock setelah transaksi
      stockBalance[item.id_product] += item.jumlah_transaksi;

      // Simpan stock setelah transaksi
      item.stock_setelahnya = stockBalance[item.id_product];
    }

    // Rename jumlah_display kembali ke jumlah untuk response
    item.jumlah = item.jumlah_display;
    delete item.jumlah_display;
    delete item.jumlah_transaksi;
  });

  // Sort kembali dari yang terbaru ke yang terlama untuk display
  aktivitas.sort((a, b) => new Date(b.tg_aktivitas) - new Date(a.tg_aktivitas));

  // PAGINATION secara manual di array hasil akhir
  const page = Number(request.page) || 1;
  const size = Number(request.size) || 10;
  const start = (page - 1) * size;
  const end = start + size;

  const paginatedAktivitas = aktivitas.slice(start, end);

  return {
    data_aktivitas: paginatedAktivitas,
    paging: {
      page: page,
      total_item: aktivitas.length,
      total_page: Math.ceil(aktivitas.length / size),
    },
  };
};

const getProductHistory = async (request) => {
  // Jika request kosong, ambil semua data
  if (Object.keys(request).length === 0) {
    const historyLogs = await prismaClient.productHistoryLog.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
    return {
      data_history: historyLogs,
      paging: {
        page: 1,
        total_item: historyLogs.length,
        total_page: 1,
      },
    };
  }

  request = validate(getProductHistoryValidation, request);
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.id_product) {
    filters.push({
      id_product: {
        contains: request.id_product,
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

  if (request.username) {
    filters.push({
      username: {
        contains: request.username,
      },
    });
  }

  const historyLogs = await prismaClient.productHistoryLog.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: {
      created_at: "desc",
    },
  });

  const totalItems = await prismaClient.productHistoryLog.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_history: historyLogs,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  createProduct,
  getProduct,
  updateProduct,
  removeProduct,
  searchProduct,
  aktivitasStock,
  getProductHistory,
};
