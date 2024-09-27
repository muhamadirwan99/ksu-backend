import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import {
  addSaleValidation,
  getDetailSaleValidation,
  searchSaleValidation,
} from "../validation/sale-validation.js";
import { generateDate } from "../utils/generate-date.js";
import { parse } from "date-fns";
import { ResponseError } from "../utils/response-error.js";
import { generateSaleId } from "../utils/generate-sale-id.js";
import { generateHutangAnggotaId } from "../utils/generate-hutang-anggota-id.js";

const createSale = async (request) => {
  request = validate(addSaleValidation, request);

  const parseDate = parse(
    request.tg_penjualan,
    "dd-MM-yyyy, HH:mm",
    new Date(),
  );

  // Validasi apakah tanggal berhasil diparse
  if (isNaN(parseDate)) {
    throw new Error(
      "Invalid date format. Please use dd-MM-yyyy, HH:mm format.",
    );
  }

  // Simpan ke tabel Sale

  request.id_penjualan = await generateSaleId(parseDate);

  request.created_at = generateDate();

  const { details, ...requestWithoutDetails } = request;

  const newSale = await prismaClient.penjualan.create({
    data: requestWithoutDetails,
  });

  // tambahkan untuk menambahkan hutang apabila jenis_pembayaran == kredit
  if (request.jenis_pembayaran === "kredit") {
    await prismaClient.hutangAnggota.create({
      data: {
        id_hutang_anggota: await generateHutangAnggotaId(parseDate),
        id_anggota: newSale.id_anggota,
        nm_anggota: newSale.nm_anggota,
        tg_hutang: request.tg_penjualan,
        nominal: newSale.total_nilai_jual,
        id_penjualan: newSale.id_penjualan,
        created_at: generateDate(),
      },
    });

    // Periksa jika nilai hutang null, ganti dengan 0
    const anggota = await prismaClient.anggota.findUnique({
      where: {
        id_anggota: newSale.id_anggota,
      },
      select: {
        hutang: true,
      },
    });

    // Jika hutang null, set ke 0
    const currentHutang = anggota.hutang ?? 0; // Jika hutang null, gunakan 0 sebagai nilai awal

    const newHutang =
      parseFloat(currentHutang) + parseFloat(newSale.total_nilai_jual);

    await prismaClient.anggota.update({
      where: {
        id_anggota: newSale.id_anggota,
      },
      data: {
        hutang: newHutang,
        updated_at: generateDate(),
      },
    });
  }

  // Proses detail penjualan dan update tabel produk
  const saleDetails = await Promise.all(
    request.details.map(async (detail) => {
      // Cek apakah produk sudah ada di tabel product
      let existingProduct = await prismaClient.product.findUnique({
        where: {
          id_product: detail.id_product,
        },
      });

      // Jika produk tidak ada, lempar error
      if (!existingProduct) {
        throw new Error(
          `Product with ID ${detail.id_product} does not exist. Please add the product first.`,
        );
      }

      // Kurangi stok produk dengan jumlah penjualan
      const newStock = existingProduct.jumlah - detail.jumlah;
      if (newStock < 0) {
        throw new Error(
          `Not enough stock for product ${detail.nm_produk}. Available stock: ${existingProduct.jumlah}`,
        );
      }

      // Update stok produk di database
      await prismaClient.product.update({
        where: {
          id_product: detail.id_product,
        },
        data: {
          jumlah: newStock, // Mengurangi stok produk
        },
      });

      // Set detail penjualan
      detail.id_penjualan = newSale.id_penjualan;
      detail.created_at = generateDate();

      return detail;
    }),
  );

  await prismaClient.detailPenjualan.createMany({
    data: saleDetails,
  });

  return newSale;
};

const getDetailSale = async (request) => {
  request = validate(getDetailSaleValidation, request);

  const detailSale = await prismaClient.detailPenjualan.findMany({
    where: {
      id_penjualan: request.id_penjualan,
    },
  });

  if (!detailSale) {
    throw new ResponseError("Sale is not found");
  }

  return detailSale;
};

const getSaleList = async (request) => {
  request = validate(searchSaleValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.keterangan) {
    filters.push({
      keterangan: {
        contains: request.keterangan,
      },
    });
  }

  const sortBy = request.sort_by || ["tg_penjualan"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const roles = await prismaClient.penjualan.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.penjualan.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_penjualan: roles,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  createSale,
  getDetailSale,
  getSaleList,
};
