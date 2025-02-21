import { prismaClient } from "../../../application/database.js";

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

export {
  getNeracaPercobaan,
  getNeracaSaldo,
  getNeracaAwalKas,
  setYearMonth,
  yearMonth,
  newYear,
};
