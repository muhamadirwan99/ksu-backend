import { prismaClient } from "../../../application/database.js";

let startDate, endDate;

async function getNeracaPercobaan(
  neracaAwalDebit,
  neracaAwalKredit,
  neracaMutasiDebit,
  neracaMutasiKredit,
) {
  const debit = neracaAwalDebit + neracaMutasiDebit;
  const kredit = neracaAwalKredit + neracaMutasiKredit;

  return {
    debit: debit,
    kredit: kredit,
  };
}

async function getNeracaSaldo(
  kdNeracaSaldo,
  neracaPercobaanDebit,
  neracaPercobaanKredit,
) {
  switch (kdNeracaSaldo) {
    case 1:
      return {
        debit: neracaPercobaanDebit - neracaPercobaanKredit,
        kredit: 0,
      };
    case 2:
      return {
        debit: 0,
        kredit: neracaPercobaanKredit - neracaPercobaanDebit,
      };
    default:
      return {
        debit: 0,
        kredit: 0,
      };
  }
}

async function getHasilUsaha(
  kdHasilUsaha,
  neracaSaldoDebit,
  neracaSaldoKredit,
) {
  switch (kdHasilUsaha) {
    case 1:
      return {
        debit: neracaSaldoDebit - neracaSaldoKredit,
        kredit: 0,
      };
    case 2:
      return {
        debit: 0,
        kredit: neracaSaldoKredit - neracaSaldoDebit,
      };
    default:
      return {
        debit: 0,
        kredit: 0,
      };
  }
}

async function getNeracaAwalKas(namaUraian) {
  let result = await prismaClient.neraca.findFirst({
    where: {
      akun: {
        nama_akun: namaUraian,
      },
      bulan_tahun: {
        gte: yearMonth,
        lte: yearMonth,
      },
    },
    select: {
      debit: true,
      kredit: true,
    },
  });

  if (!result) {
    return {
      akhir_debit: 0,
      akhir_kredit: 0,
    };
  }

  return {
    akhir_debit: parseFloat(result.debit) || 0,
    akhir_kredit: parseFloat(result.kredit) || 0,
  };
}

let yearMonth, newYear;

function setYearMonth(year, month) {
  yearMonth = new Date(year + "-" + month);
  newYear = parseInt(year, 10);
}

function getCurrentMonthSale(jenisPembayaran) {
  return prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: startDate,
        lt: endDate,
      },
      jenis_pembayaran: jenisPembayaran,
    },
  });
}

function getCurrentMonthPurchase(jenisPembayaran) {
  return prismaClient.pembelian.findMany({
    where: {
      created_at: {
        gte: startDate,
        lt: endDate,
      },
      jenis_pembayaran: jenisPembayaran,
    },
  });
}

function getDate(year, month) {
  // Tanggal awal dan akhir bulan ini dalam UTC
  startDate = new Date(Date.UTC(year, month - 1, 1));
  endDate = new Date(Date.UTC(year, month, 1)); // Awal bulan berikutnya
}

async function getTotalRetur(jenisPembayaran, startDate, endDate) {
  // Cari semua pembelian dengan jenis pembayaran tunai
  const pembelianTunai = await prismaClient.pembelian.findMany({
    where: {
      jenis_pembayaran: jenisPembayaran,
    },
    select: {
      id_pembelian: true,
    },
  });

  // Ambil semua retur yang terkait dengan pembelian tunai dalam rentang tanggal
  const resultRetur = await prismaClient.retur.aggregate({
    where: {
      id_pembelian: {
        in: pembelianTunai.map((pembelian) => pembelian.id_pembelian),
      },
      created_at: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: {
      total_nilai_beli: true,
    },
  });

  return parseFloat(resultRetur._sum.total_nilai_beli) || 0;
}

export {
  getNeracaPercobaan,
  getNeracaSaldo,
  getNeracaAwalKas,
  setYearMonth,
  getCurrentMonthSale,
  getCurrentMonthPurchase,
  getDate,
  getTotalRetur,
  getHasilUsaha,
  yearMonth,
  newYear,
  startDate,
  endDate,
};
