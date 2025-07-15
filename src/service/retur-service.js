import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import {
  addReturValidation,
  getDetailReturValidation,
  searchReturValidation,
} from "../validation/retur-validation.js";
import { generateDate } from "../utils/generate-date.js";
import { parse } from "date-fns";
import { ResponseError } from "../utils/response-error.js";
import { generateReturId } from "../utils/generate-retur-id.js";

const createRetur = async (request) => {
  request = validate(addReturValidation, request);

  const parseDate = parse(request.tg_retur, "dd-MM-yyyy", new Date());

  // Validasi apakah tanggal berhasil diparse
  if (isNaN(parseDate)) {
    throw new Error("Invalid date format. Please use dd-MM-yyyy format.");
  }

  // Simpan ke tabel Retur
  request.id_retur = await generateReturId(parseDate);

  request.created_at = generateDate();

  const { details, ...requestWithoutDetails } = request;

  await Promise.all(
    request.details.map(async (detail) => {
      // Cek apakah produk sudah ada di tabel retur
      let existingProduct = await prismaClient.product.findUnique({
        where: {
          id_product: detail.id_product,
        },
      });

      // Jika produk tidak ada, lempar error
      if (!existingProduct) {
        throw new Error(
          `Product with ID ${detail.id_product} does not exist. Please add the retur first.`
        );
      }

      // Kurangi stok produk dengan jumlah retur
      const newStock = existingProduct.jumlah - detail.jumlah;
      if (newStock < 0) {
        throw new Error(
          `Not enough stock for retur ${detail.nm_produk}. Available stock: ${existingProduct.jumlah}`
        );
      }
    })
  );

  const newRetur = await prismaClient.retur.create({
    data: requestWithoutDetails,
  });

  // Mendapatkan jenis pembayaran dari table pembelian berdasarkan id_pembelian
  const jenisPembayaran = await prismaClient.pembelian.findUnique({
    where: {
      id_pembelian: request.id_pembelian,
    },
    select: {
      jenis_pembayaran: true,
    },
  });

  // Jika jenis pembayaran kredit, maka akan mengurangi hutang_dagang di table supplier
  if (jenisPembayaran.jenis_pembayaran === "kredit") {
    // Gunakan transaction untuk memastikan atomicity
    await prismaClient.$transaction(
      async (tx) => {
        // Mengurangi hutang dagang di table supplier
        const supplier = await tx.supplier.findUnique({
          where: {
            id_supplier: request.id_supplier,
          },
          select: {
            hutang_dagang: true,
          },
        });

        if (!supplier) {
          throw new Error(
            `Supplier dengan ID ${request.id_supplier} tidak ditemukan`
          );
        }

        const currentHutang = supplier.hutang_dagang ?? 0;

        const newHutang =
          parseFloat(currentHutang) - parseFloat(request.total_nilai_beli);

        await tx.supplier.update({
          where: {
            id_supplier: request.id_supplier,
          },
          data: {
            hutang_dagang: newHutang,
            updated_at: generateDate(),
          },
        });

        // Mengurangi nominal di table hutang_dagang
        const hutangDagang = await tx.hutangDagang.findUnique({
          where: {
            id_pembelian: request.id_pembelian,
          },
          select: {
            id_hutang_dagang: true,
            nominal: true,
          },
        });

        if (!hutangDagang) {
          throw new Error(
            `Hutang dagang untuk pembelian ${request.id_pembelian} tidak ditemukan`
          );
        }

        const currentNominalHutangDagang = hutangDagang.nominal ?? 0;

        const newNominalHutangDagang =
          parseFloat(currentNominalHutangDagang) -
          parseFloat(request.total_nilai_beli);

        await tx.hutangDagang.update({
          where: {
            id_pembelian: request.id_pembelian,
          },
          data: {
            nominal: newNominalHutangDagang,
            updated_at: generateDate(),
          },
        });
      },
      {
        isolationLevel: "ReadCommitted",
        timeout: 10000,
      }
    );
  }

  // Proses detail retur dan update tabel produk
  const returDetails = await Promise.all(
    request.details.map(async (detail) => {
      // Cek apakah produk sudah ada di tabel produk
      let existingProduct = await prismaClient.product.findUnique({
        where: {
          id_product: detail.id_product,
        },
      });

      // Jika produk tidak ada, lempar error
      if (!existingProduct) {
        throw new Error(
          `Product with ID ${detail.id_product} does not exist. Please add the retur first.`
        );
      }

      // Kurangi stok produk dengan jumlah retur
      const newStock = existingProduct.jumlah - detail.jumlah;
      if (newStock < 0) {
        throw new Error(
          `Not enough stock for retur ${detail.nm_produk}. Available stock: ${existingProduct.jumlah}`
        );
      }

      // Update stok produk di database
      await prismaClient.product.update({
        where: {
          id_product: detail.id_product,
        },
        data: {
          jumlah: newStock, // Mengurangi stok produk
          updated_at: generateDate(),
        },
      });

      // Set detail retur
      detail.id_retur = newRetur.id_retur;
      detail.created_at = generateDate();

      return detail;
    })
  );

  await prismaClient.detailRetur.createMany({
    data: returDetails,
  });

  return newRetur;
};

const getDetailRetur = async (request) => {
  request = validate(getDetailReturValidation, request);

  const detailRetur = await prismaClient.detailRetur.findMany({
    where: {
      id_retur: request.id_retur,
    },
  });

  if (!detailRetur) {
    throw new ResponseError("Retur is not found");
  }

  return detailRetur;
};

const getReturList = async (request) => {
  request = validate(searchReturValidation, request);

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

  const sortBy = request.sort_by || ["tg_retur"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const retur = await prismaClient.retur.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.retur.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_retur: retur,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

const removeRetur = async (request) => {
  request = validate(getDetailReturValidation, request);

  const detailRetur = await prismaClient.detailRetur.count({
    where: {
      id_retur: request.id_retur,
    },
  });

  if (detailRetur === 0) {
    throw new ResponseError("Retur is not found");
  }

  const existingDetailRetur = await prismaClient.detailRetur.findMany({
    where: {
      id_retur: request.id_retur,
    },
  });

  // Mendapatkan jenis pembayaran dari table pembelian berdasarkan id_pembelian
  const returClient = await prismaClient.retur.findUnique({
    where: {
      id_retur: request.id_retur,
    },
  });

  const jenisPembayaran = await prismaClient.pembelian.findUnique({
    where: {
      id_pembelian: returClient.id_pembelian,
    },
    select: {
      jenis_pembayaran: true,
    },
  });

  // Jika jenis pembayaran kredit, maka akan mengembalikan hutang_dagang di table supplier
  if (jenisPembayaran.jenis_pembayaran === "kredit") {
    // Gunakan transaction untuk memastikan atomicity
    await prismaClient.$transaction(
      async (tx) => {
        // Mengembalikan hutang dagang di table supplier
        const supplier = await tx.supplier.findUnique({
          where: {
            id_supplier: returClient.id_supplier,
          },
          select: {
            hutang_dagang: true,
          },
        });

        if (!supplier) {
          throw new Error(
            `Supplier dengan ID ${returClient.id_supplier} tidak ditemukan`
          );
        }

        const currentHutang = supplier.hutang_dagang ?? 0;

        const newHutang =
          parseFloat(currentHutang) + parseFloat(returClient.total_nilai_beli);

        await tx.supplier.update({
          where: {
            id_supplier: returClient.id_supplier,
          },
          data: {
            hutang_dagang: newHutang,
            updated_at: generateDate(),
          },
        });

        // Mengembalikan nominal di table hutang_dagang
        const hutangDagang = await tx.hutangDagang.findUnique({
          where: {
            id_pembelian: returClient.id_pembelian,
          },
          select: {
            id_hutang_dagang: true,
            nominal: true,
          },
        });

        if (!hutangDagang) {
          throw new Error(
            `Hutang dagang untuk pembelian ${returClient.id_pembelian} tidak ditemukan`
          );
        }

        const currentNominalHutangDagang = hutangDagang.nominal ?? 0;

        const newNominalHutangDagang =
          parseFloat(currentNominalHutangDagang) +
          parseFloat(returClient.total_nilai_beli);

        await tx.hutangDagang.update({
          where: {
            id_pembelian: returClient.id_pembelian,
          },
          data: {
            nominal: newNominalHutangDagang,
            updated_at: generateDate(),
          },
        });
      },
      {
        isolationLevel: "ReadCommitted",
        timeout: 10000,
      }
    );
  }

  // Mengembalikan jumlah produk ke jumlah sebelum retur
  await Promise.all(
    existingDetailRetur.map(async (detail) => {
      const existingProduct = await prismaClient.product.findUnique({
        where: {
          id_product: detail.id_product,
        },
      });

      const newQty = existingProduct.jumlah + detail.jumlah;

      await prismaClient.product.update({
        where: {
          id_product: detail.id_product,
        },
        data: {
          jumlah: newQty,
          updated_at: generateDate(),
        },
      });
    })
  );

  await prismaClient.detailRetur.deleteMany({
    where: {
      id_retur: request.id_retur,
    },
  });

  return prismaClient.retur.delete({
    where: {
      id_retur: request.id_retur,
    },
  });
};

export default {
  createRetur,
  getDetailRetur,
  getReturList,
  removeRetur,
};
