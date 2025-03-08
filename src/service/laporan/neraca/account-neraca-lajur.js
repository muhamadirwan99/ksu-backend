import {
  getNeracaAwalKas,
  getNeracaPercobaan,
  getNeracaSaldo,
  newYear,
} from "./count-neraca-lajur.js";
import { createNeracaModel } from "./neraca-lajur-model.js";
import { prismaClient } from "../../../application/database.js";
import { getTotalCashInOutByDateRange } from "../lap-hasil-usaha.js";

// async function kas() {
//
//
//   const neracaAwalKas = await getNeracaAwalKas("KAS", new Date(newYear, 0, 1), new Date(newYear + 1, 0, 1));
//
//   const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
//     getTotalCashInOutByDateRange(16, new Date(newYear, 0, 1), new Date(newYear + 1, 0, 1)),
//     getTotalCashInOutByDateRange(1, new Date(newYear, 0, 1), new Date(newYear + 1, 0, 1)),
//   ]);
//
//   const neracaPercobaan = await getNeracaPercobaan(
//     neracaAwalKas.akhir_debit,
//     neracaAwalKas.akhir_kredit,
//     neracaMutasiDebit,
//     neracaMutasiKredit,
//   );
//
//   const neracaSaldo = await getNeracaSaldo(
//     1,
//     neracaPercobaan.debit,
//     neracaPercobaan.kredit,
//   );
//
//   const neracaAkhir = {
//     debit: 0,
//     kredit: 0,
//   };
//
//   return createNeracaModel(
//     neracaAwalKas.akhir_debit,
//     neracaAwalKas.akhir_kredit,
//     neracaMutasiDebit,
//     neracaMutasiKredit,
//     neracaPercobaan,
//     neracaSaldo,
//     neracaAkhir,
//   );
// }

async function bankBri() {
  const neracaAwalKas = await getNeracaAwalKas("BANK BRI");

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    getTotalCashInOutByDateRange(
      16,
      new Date(newYear, 0, 1),
      new Date(newYear + 1, 0, 1),
    ),
    getTotalCashInOutByDateRange(
      1,
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
