import { prismaClient } from "../application/database.js";
import {
  createTutupKasirValidation,
  getListTutupKasirValidation,
  getTotalPenjualanValidation,
  updateTutupKasirValidation,
} from "../validation/tutup-kasir-validation.js";
import { validate } from "../validation/validation.js";
import { generateDate } from "../utils/generate-date.js";
import { ResponseError } from "../utils/response-error.js";
import { updateFields } from "../utils/update-fields.js";

let startDate, tg_tutup_kasir;

async function dataPenjualan(jenis_pembayaran) {
  const result = await prismaClient.penjualan.aggregate({
    where: {
      tg_penjualan: {
        gte: startDate, // Waktu mulai
        lt: tg_tutup_kasir, // Waktu hingga
      },
      jenis_pembayaran: jenis_pembayaran,
    },
    _sum: {
      total_nilai_jual: true,
    },
  });

  return parseFloat(result._sum.total_nilai_jual) || 0;
}

async function dataKeuntungan() {
  const result = await prismaClient.penjualan.aggregate({
    where: {
      tg_penjualan: {
        gte: startDate, // Waktu mulai
        lt: tg_tutup_kasir, // Waktu hingga
      },
    },
    _sum: {
      total_nilai_jual: true,
      total_nilai_beli: true,
    },
  });

  return {
    total_nilai_jual: parseFloat(result._sum.total_nilai_jual) || 0,
    total_nilai_beli: parseFloat(result._sum.total_nilai_beli) || 0,
    total_keuntungan:
      parseFloat(result._sum.total_nilai_jual) -
        parseFloat(result._sum.total_nilai_beli) || 0,
  };
}

const getTotalPenjualan = async (request) => {
  request = validate(getTotalPenjualanValidation, request);

  tg_tutup_kasir = request.tg_tutup_kasir;

  const [tanggal] = tg_tutup_kasir.split(", ");

  // Cek apakah sudah ada tutup kasir untuk hari ini
  const kasirHariIni = await prismaClient.tutupKasir.findFirst({
    where: {
      tg_tutup_kasir: {
        contains: tanggal, // Cari kasir yang tutup di hari yang sama
      },
    },
  });

  let shift;

  if (!kasirHariIni) {
    // Jika belum ada yang tutup kasir, shift pagi
    shift = "pagi";
    startDate = `${tanggal}, 00:00`; // Awal hari
  } else {
    // Jika sudah ada yang tutup kasir, shift siang
    shift = "siang";
    startDate = kasirHariIni.tg_tutup_kasir; // Waktu dari tutup kasir shift pagi
  }

  // Dapatkan total nilai penjualan tunai
  const penjualanTunai = await dataPenjualan("tunai");
  const penjualanQris = await dataPenjualan("qris");
  const penjualanKredit = await dataPenjualan("kredit");

  const totalPenjualan = penjualanTunai + penjualanQris + penjualanKredit;

  return {
    keterangan: `Total penjualan untuk shift ${shift}`,
    penjualan: {
      penjualan_tunai: penjualanTunai,
      penjualan_qris: penjualanQris,
      penjualan_kredit: penjualanKredit,
      total_penjualan: totalPenjualan,
    },
    keuntungan: await dataKeuntungan(),
  };
};

const createTutupKasir = async (request) => {
  request = validate(createTutupKasirValidation, request);

  // const [tanggal] = request.tg_tutup_kasir.split(", ");
  //
  // // Cek apakah sudah ada yang tutup kasir hari ini
  // const kasirHariIni = await prismaClient.tutupKasir.findFirst({
  //   where: {
  //     tg_tutup_kasir: {
  //       contains: tanggal,
  //     },
  //   },
  // });
  //
  // // Tentukan shift berdasarkan data yang ada di tabel tutup kasir
  // const shift = kasirHariIni ? "siang" : "pagi";

  // Simpan data ke tabel TutupKasir
  return prismaClient.tutupKasir.create({
    data: {
      tg_tutup_kasir: request.tg_tutup_kasir,
      shift: request.shift,
      username: request.username,
      tunai: request.tunai,
      qris: request.qris,
      kredit: request.kredit,
      total: request.total,
      uang_tunai: request.uang_tunai,
      total_nilai_jual: request.total_nilai_jual,
      total_nilai_beli: request.total_nilai_beli,
      total_keuntungan: request.total_keuntungan,
      created_at: generateDate(),
    },
  });
};

const getListTutupKasir = async (request) => {
  // Apabila request sama dengan {}, maka langsung balikkan semua data tutupKasir
  if (Object.keys(request).length === 0) {
    const tutupKasir = await prismaClient.tutupKasir.findMany();
    return {
      data_tutupKasir: tutupKasir,
      paging: {
        page: 1,
        total_item: tutupKasir.length,
        total_page: 1,
      },
    };
  }

  request = validate(getListTutupKasirValidation, request);

  const skip = (request.page - 1) * request.size;
  const filters = [];

  // Jika ada username, tambahkan filter
  if (request.username) {
    filters.push({
      username: {
        contains: request.username,
      },
    });
  }

  const sortBy = request.sort_by || ["tg_tutup_kasir"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const tutupKasir = await prismaClient.tutupKasir.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  // Hitung total data
  const totalItems = await prismaClient.tutupKasir.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_tutup_kasir: tutupKasir,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

const updateTutupKasir = async (request, idRole) => {
  request = validate(updateTutupKasirValidation, request);
  let fieldTutupKasir = ["nama_kasir", "username", "uang_tunai", "sesi"];

  // Jika id role = ROLE002 (Kasir), maka hanya boleh update uang tunai

  if (idRole === "ROLE002") {
    if (request.nama_kasir || request.username) {
      throw new ResponseError(
        "Kasir hanya dapat mengubah uang_tunai dan sesi",
        {},
      );
    }

    fieldTutupKasir = ["uang_tunai", "sesi"];
  }

  const totalTutupKasirInDatabase = await prismaClient.tutupKasir.count({
    where: {
      id_tutup_kasir: request.id_tutup_kasir,
    },
  });

  if (totalTutupKasirInDatabase !== 1) {
    throw new ResponseError("TutupKasir is not found", {});
  }

  const data = {};
  updateFields(request, data, fieldTutupKasir);

  data.updated_at = generateDate();

  return prismaClient.tutupKasir.update({
    where: {
      id_tutup_kasir: request.id_tutup_kasir,
    },
    data: data,
  });
};

export default {
  getTotalPenjualan,
  createTutupKasir,
  getListTutupKasir,
  updateTutupKasir,
};
