import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import {
  addPurchaseValidation,
  getDetailPurchaseValidation,
  searchPurchaseValidation,
} from "../validation/purchase-validation.js";
import { generatePurchaseId } from "../utils/generate-purchase-id.js";
import { generateDate } from "../utils/generate-date.js";
import { parse } from "date-fns";
import { ResponseError } from "../utils/response-error.js";
import { generateHutangDagangId } from "../utils/generate-hutang-dagang-id.js";

const createPurchase = async (request) => {
  request = validate(addPurchaseValidation, request);

  const parseDate = parse(request.tg_pembelian, "dd-MM-yyyy", new Date());

  // Validasi tanggal, jika tanggal tidak valid, lempar error
  if (isNaN(parseDate)) {
    throw new Error("Invalid date format. Please use dd-MM-yyyy format.");
  }

  // Simpan ke tabel Purchase
  const newPurchase = await prismaClient.pembelian.create({
    data: {
      id_pembelian: await generatePurchaseId(parseDate),
      tg_pembelian: request.tg_pembelian,
      id_supplier: request.id_supplier,
      nm_supplier: request.nm_supplier,
      jumlah: request.jumlah,
      total_harga_beli: request.total_harga_beli,
      total_harga_jual: request.total_harga_jual,
      jenis_pembayaran: request.jenis_pembayaran,
      keterangan: request.keterangan,
      created_at: generateDate(),
    },
  });

  // tambahkan untuk menambahkan hutang apabila jenis_pembayaran == kredit
  if (request.jenis_pembayaran === "kredit") {
    await prismaClient.hutangDagang.create({
      data: {
        id_hutang_dagang: await generateHutangDagangId(parseDate),
        id_supplier: newPurchase.id_supplier,
        nm_supplier: newPurchase.nm_supplier,
        tg_hutang: request.tg_pembelian,
        nominal: newPurchase.total_harga_beli,
        id_pembelian: newPurchase.id_pembelian,
        created_at: generateDate(),
      },
    });

    // Periksa jika nilai hutang null, ganti dengan 0
    const supplier = await prismaClient.supplier.findUnique({
      where: {
        id_supplier: newPurchase.id_supplier,
      },
      select: {
        hutang_dagang: true,
      },
    });

    // Jika hutang null, set ke 0
    const currentHutang = supplier.hutang_dagang ?? 0; // Jika hutang null, gunakan 0 sebagai nilai awal

    const newHutang =
      parseFloat(currentHutang) + parseFloat(newPurchase.total_harga_beli);

    await prismaClient.supplier.update({
      where: {
        id_supplier: newPurchase.id_supplier,
      },
      data: {
        hutang_dagang: newHutang,
        updated_at: generateDate(),
      },
    });
  }

  // Proses detail pembelian dan update tabel produk
  const purchaseDetails = await Promise.all(
    request.details.map(async (detail) => {
      // Cek apakah produk sudah ada di tabel produk
      let existingProduct = await prismaClient.product.findUnique({
        where: {
          id_product: detail.id_product,
        },
      });

      // Jika produk tidak ada, lempar error (atau Anda bisa buat produk baru tergantung kebutuhan)
      if (!existingProduct) {
        throw new Error(
          `Product with ID ${detail.id_product} does not exist. Please add the product first.`,
        );
      }

      // Jika harga beli baru berbeda dari harga beli lama, hitung rata-rata harga beli
      let hargaBeliBaru = detail.harga_beli;
      if (existingProduct.harga_beli !== detail.harga_beli) {
        const hargaBeliLama = existingProduct.harga_beli;
        const jumlahLama = existingProduct.jumlah;

        const totalQty = jumlahLama + detail.jumlah;
        const totalHarga =
          hargaBeliLama * jumlahLama + hargaBeliBaru * detail.jumlah;

        // Rata-rata harga beli
        hargaBeliBaru = totalHarga / totalQty;
      }

      // Update produk dengan harga beli baru (rata-rata), jumlah baru, dan harga jual baru
      await prismaClient.product.update({
        where: {
          id_product: detail.id_product,
        },
        data: {
          harga_beli: hargaBeliBaru, // Harga beli baru yang sudah di-average
          jumlah: existingProduct.jumlah + detail.jumlah, // Update jumlah produk
          harga_jual: detail.harga_jual, // Update harga jual
          updated_at: generateDate(),
        },
      });

      // Simpan detail pembelian
      return {
        id_pembelian: newPurchase.id_pembelian,
        id_product: detail.id_product,
        nm_divisi: detail.nm_divisi,
        nm_produk: detail.nm_produk,
        harga_beli: hargaBeliBaru, // Harga beli yang sudah di-average
        harga_jual: detail.harga_jual,
        jumlah: detail.jumlah,
        diskon: detail.diskon,
        ppn: detail.ppn,
        total_nilai_beli: hargaBeliBaru * detail.jumlah,
        total_nilai_jual: detail.total_nilai_jual,
        created_at: generateDate(),
      };
    }),
  );

  await prismaClient.detailPembelian.createMany({
    data: purchaseDetails,
  });

  return newPurchase;
};

const getDetailPurchase = async (request) => {
  request = validate(getDetailPurchaseValidation, request);

  const countPurchase = await prismaClient.detailPembelian.count({
    where: {
      id_pembelian: request.id_pembelian,
    },
  });

  if (countPurchase === 0) {
    throw new ResponseError("Purchase is not found");
  }

  const existingPurchase = await prismaClient.pembelian.findUnique({
    where: {
      id_pembelian: request.id_pembelian,
    },
  });
  if (!existingPurchase) {
    throw new ResponseError("Purchase is not found");
  }

  const detailPurchase = await prismaClient.detailPembelian.findMany({
    where: {
      id_pembelian: request.id_pembelian,
    },
  });

  if (!detailPurchase) {
    throw new ResponseError("Purchase is not found");
  }

  return {
    existing_purchase: existingPurchase,
    detail_purchase: detailPurchase,
  };
};

const getPurchaseList = async (request) => {
  request = validate(searchPurchaseValidation, request);

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

  if (request.id_supplier) {
    filters.push({
      id_supplier: {
        contains: request.id_supplier,
      },
    });
  }

  const sortBy = request.sort_by || ["tg_pembelian"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const roles = await prismaClient.pembelian.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.pembelian.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_pembelian: roles,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

const removePurchase = async (request) => {
  request = validate(getDetailPurchaseValidation, request);

  const detailPurchase = await prismaClient.detailPembelian.count({
    where: {
      id_pembelian: request.id_pembelian,
    },
  });

  if (detailPurchase === 0) {
    throw new ResponseError("Purchase is not found");
  }

  const existingDetailPurchase = await prismaClient.detailPembelian.findMany({
    where: {
      id_pembelian: request.id_pembelian,
    },
  });

  //menghapus data di table hutang dagang
  await prismaClient.hutangDagang.deleteMany({
    where: {
      id_pembelian: request.id_pembelian,
    },
  });

  //mengurangi hutang supplier
  const existingPurchase = await prismaClient.pembelian.findUnique({
    where: {
      id_pembelian: request.id_pembelian,
    },
  });
  if (existingPurchase.jenis_pembayaran === "kredit") {
    const supplier = await prismaClient.supplier.findUnique({
      where: {
        id_supplier: existingPurchase.id_supplier,
      },
      select: {
        hutang_dagang: true,
      },
    });

    const currentHutang = supplier.hutang_dagang ?? 0;

    const newHutang =
      parseFloat(currentHutang) - parseFloat(existingPurchase.total_harga_beli);

    await prismaClient.supplier.update({
      where: {
        id_supplier: existingPurchase.id_supplier,
      },
      data: {
        hutang_dagang: newHutang,
        updated_at: generateDate(),
      },
    });
  }

  //mengembalikan jumlah produk ke jumlah sebelum pembelian
  await Promise.all(
    existingDetailPurchase.map(async (detail) => {
      const existingProduct = await prismaClient.product.findUnique({
        where: {
          id_product: detail.id_product,
        },
      });

      const newQty = existingProduct.jumlah - detail.jumlah;

      try {
        await prismaClient.product.update({
          where: {
            id_product: detail.id_product,
          },
          data: {
            jumlah: newQty,
            updated_at: generateDate(),
          },
        });
      } catch (e) {
        throw new ResponseError(`Product ${detail.id_product} is not found`);
      }
    }),
  );

  await prismaClient.detailPembelian.deleteMany({
    where: {
      id_pembelian: request.id_pembelian,
    },
  });

  return prismaClient.pembelian.delete({
    where: {
      id_pembelian: request.id_pembelian,
    },
  });
};

export default {
  createPurchase,
  getDetailPurchase,
  getPurchaseList,
  removePurchase,
};
