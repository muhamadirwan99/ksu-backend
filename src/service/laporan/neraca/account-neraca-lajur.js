import {
  endDate,
  getCurrentMonthPurchase,
  getCurrentMonthSale,
  getNeracaAwalKas,
  getNeracaPercobaan,
  getNeracaSaldo,
  getTotalRetur,
  newYear,
  startDate,
} from "./calculate-neraca-lajur.js";
import { createNeracaModel } from "./neraca-lajur-model.js";
import { prismaClient } from "../../../application/database.js";
import { getTotalCashInOutByDateRange } from "../lap-hasil-usaha.js";

async function kas() {
  const neracaAwalKas = await getNeracaAwalKas("KAS");

  //NERACA MUTASI KREDIT
  //Mendapatkan data pembelian (harga beli)
  let totalCurrentMonthPurchase = 0;
  const currentMonthCashPurchases = await getCurrentMonthPurchase("tunai");

  currentMonthCashPurchases.forEach((purchase) => {
    totalCurrentMonthPurchase += parseFloat(purchase.total_harga_beli);
  });

  //Mendapatkan data dari cash in out
  const bebanGaji = await getTotalCashInOutByDateRange(5, startDate, endDate);
  const uangMakan = await getTotalCashInOutByDateRange(6, startDate, endDate);
  const thrKaryawan = await getTotalCashInOutByDateRange(7, startDate, endDate);
  const bebanAdmUmum = await getTotalCashInOutByDateRange(
    8,
    startDate,
    endDate,
  );
  const bebanPerlengkapanToko = await getTotalCashInOutByDateRange(
    9,
    startDate,
    endDate,
  );
  const pemInventaris = await getTotalCashInOutByDateRange(
    10,
    startDate,
    endDate,
  );
  const pemGedung = await getTotalCashInOutByDateRange(11, startDate, endDate);
  const pengeluaranLain = await getTotalCashInOutByDateRange(
    15,
    startDate,
    endDate,
  );
  const honorPengurus = await getTotalCashInOutByDateRange(
    14,
    startDate,
    endDate,
  );
  const honorPengawas = await getTotalCashInOutByDateRange(
    13,
    startDate,
    endDate,
  );
  const bayarUtangPihakKetiga = await getTotalCashInOutByDateRange(
    18,
    startDate,
    endDate,
  );

  const tagihanListrik = await getTotalCashInOutByDateRange(
    12,
    startDate,
    endDate,
  );

  const neracaMutasiKredit = await Promise.all([
    bebanGaji,
    uangMakan,
    thrKaryawan,
    bebanAdmUmum,
    bebanPerlengkapanToko,
    pemInventaris,
    pemGedung,
    pengeluaranLain,
    honorPengurus,
    honorPengawas,
    bayarUtangPihakKetiga,
    tagihanListrik,
  ]).then((result) => {
    return result.reduce((acc, curr) => acc + curr, 0);
  });
  //END NERACA MUTASI KREDIT

  //NERACA MUTASI DEBIT
  //Mendapatkan data penjualan (harga beli)
  let totalCurrentMonthSale = 0;
  const currentMonthCashSales = await getCurrentMonthSale("tunai");

  currentMonthCashSales.forEach((purchase) => {
    totalCurrentMonthSale += parseFloat(purchase.total_nilai_jual);
  });

  //Mendapatkan data retur
  const totalRetur = await getTotalRetur(startDate, endDate);

  //Mendapatkan data dari cash in out
  const pendapatanLain = await getTotalCashInOutByDateRange(
    4,
    startDate,
    endDate,
  );
  const utangPihakKetiga = await getTotalCashInOutByDateRange(
    19,
    startDate,
    endDate,
  );

  const neracaMutasiDebit = await Promise.all([
    totalCurrentMonthSale,
    totalRetur,
    pendapatanLain,
    utangPihakKetiga,
  ]).then((result) => {
    return result.reduce((acc, curr) => acc + curr, 0);
  });
  //END NERACA MUTASI DEBIT

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const hasilUsaha = {
    debit: 0,
    kredit: 0,
  };

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    hasilUsaha,
    neracaAkhir,
  );
}

async function bankBri() {
  const neracaAwalKas = await getNeracaAwalKas("BANK BRI");

  let neracaMutasiDebit = 0;
  const currentMonthQrisSales = await getCurrentMonthSale("qris");
  currentMonthQrisSales.forEach((purchase) => {
    neracaMutasiDebit += parseFloat(purchase.total_nilai_jual);
  });

  const neracaMutasiKredit = 0;

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const hasilUsaha = {
    debit: 0,
    kredit: 0,
  };

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    hasilUsaha,
    neracaAkhir,
  );
}

async function bankBni() {
  const neracaAwalKas = await getNeracaAwalKas("BANK BNI");

  let neracaMutasiDebit = 0;

  const neracaMutasiKredit = 0;

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const hasilUsaha = {
    debit: 0,
    kredit: 0,
  };

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    hasilUsaha,
    neracaAkhir,
  );
}

async function piutangDagang() {
  const neracaAwalKas = await getNeracaAwalKas("PIUTANG DAGANG");

  let neracaMutasiDebit = 0;
  const currentMonthQrisSales = await getCurrentMonthSale("kredit");
  currentMonthQrisSales.forEach((purchase) => {
    neracaMutasiDebit += parseFloat(purchase.total_nilai_jual);
  });

  const neracaMutasiKredit = 0; //belum ada data

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const hasilUsaha = {
    debit: 0,
    kredit: 0,
  };

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    hasilUsaha,
    neracaAkhir,
  );
}

async function bebanGaji() {
  const neracaAwalKas = await getNeracaAwalKas("BEBAN GAJI");

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    0,
    getTotalCashInOutByDateRange(
      5,
      new Date(newYear, 0, 1),
      new Date(newYear + 1, 0, 1),
    ),
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

async function uangMakan() {
  const neracaAwalKas = await getNeracaAwalKas("UANG MAKAN");

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    0,
    getTotalCashInOutByDateRange(
      6,
      new Date(newYear, 0, 1),
      new Date(newYear + 1, 0, 1),
    ),
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

async function thrKaryawan() {
  const neracaAwalKas = await getNeracaAwalKas("THR KARYAWAN");

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    0,
    getTotalCashInOutByDateRange(
      7,
      new Date(newYear, 0, 1),
      new Date(newYear + 1, 0, 1),
    ),
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

async function bebanAdmUmum() {
  const neracaAwalKas = await getNeracaAwalKas("BEBAN ADM. & UMUM");

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    0,
    getTotalCashInOutByDateRange(
      8,
      new Date(newYear, 0, 1),
      new Date(newYear + 1, 0, 1),
    ),
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

async function bebanPerlengkapanToko() {
  const neracaAwalKas = await getNeracaAwalKas("BEBAN PERLENGKAPAN TOKO");

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    0,
    getTotalCashInOutByDateRange(
      9,
      new Date(newYear, 0, 1),
      new Date(newYear + 1, 0, 1),
    ),
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

async function bebanPenyusutanInventaris() {
  const neracaAwalKas = await getNeracaAwalKas("BEBAN PENY. INVENTARIS");

  const akumPenyusutanInventaris = await getNeracaAwalKas(
    "AKUM. PENY. INVENTARIS",
  );

  const bebanPenyusutanInventaris = await prismaClient.penyusutanAset.findFirst(
    {
      where: {
        jenis_aset: "inventaris",
        tahun: newYear,
      },
      select: {
        penyusutan_bulan: true,
      },
    },
  );

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    parseFloat(bebanPenyusutanInventaris.penyusutan_bulan) || 0,
    parseFloat(akumPenyusutanInventaris.akhir_kredit) || 0,
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

async function bebanPenyusutanGedung() {
  const neracaAwalKas = await getNeracaAwalKas("BEBAN PENY. GEDUNG");

  const akumPenyusutanGedung = await getNeracaAwalKas("AKUM. PENY. GEDUNG");

  const bebanPenyusutanGedung = await prismaClient.penyusutanAset.findFirst({
    where: {
      jenis_aset: "gedung",
      tahun: newYear,
    },
    select: {
      penyusutan_bulan: true,
    },
  });

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    parseFloat(bebanPenyusutanGedung.penyusutan_bulan) || 0,
    parseFloat(akumPenyusutanGedung.akhir_kredit) || 0,
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

async function pemeliharaanInventaris() {
  const neracaAwalKas = await getNeracaAwalKas("PEMELIHARAAN INVENTARIS");

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    getTotalCashInOutByDateRange(
      10,
      new Date(newYear, 0, 1),
      new Date(newYear + 1, 0, 1),
    ),
    0,
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

async function pemeliharaanGedung() {
  const neracaAwalKas = await getNeracaAwalKas("PEMELIHARAAN GEDUNG");

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    getTotalCashInOutByDateRange(
      11,
      new Date(newYear, 0, 1),
      new Date(newYear + 1, 0, 1),
    ),
    0,
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

async function pengeluaranLainLain() {
  const neracaAwalKas = await getNeracaAwalKas("PENGELUARAN LAIN-LAIN");

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    getTotalCashInOutByDateRange(
      15,
      new Date(newYear, 0, 1),
      new Date(newYear + 1, 0, 1),
    ),
    0,
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

async function honorPengurus() {
  const neracaAwalKas = await getNeracaAwalKas("PENGELUARAN LAIN-LAIN");

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    getTotalCashInOutByDateRange(
      14,
      new Date(newYear, 0, 1),
      new Date(newYear + 1, 0, 1),
    ),
    0,
  ]);

  const neracaPercobaan = await getNeracaPercobaan(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
  );

  const neracaSaldo = await getNeracaSaldo(
    1,
    neracaPercobaan.debit,
    neracaPercobaan.kredit,
  );

  const neracaAkhir = {
    debit: 0,
    kredit: 0,
  };

  return createNeracaModel(
    neracaAwalKas.akhir_debit,
    neracaAwalKas.akhir_kredit,
    neracaMutasiDebit,
    neracaMutasiKredit,
    neracaPercobaan,
    neracaSaldo,
    neracaAkhir,
  );
}

export {
  kas,
  bankBri,
  bankBni,
  piutangDagang,
  bebanGaji,
  uangMakan,
  thrKaryawan,
  bebanAdmUmum,
  bebanPerlengkapanToko,
  bebanPenyusutanInventaris,
  bebanPenyusutanGedung,
  pemeliharaanInventaris,
  pemeliharaanGedung,
  pengeluaranLainLain,
};
