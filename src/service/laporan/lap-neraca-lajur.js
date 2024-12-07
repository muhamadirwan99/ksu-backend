import { prismaClient } from "../../application/database.js";
import { getTotalCashInOutByDateRange } from "./lap-hasil-usaha.js";

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

async function getNeracaAwalKas(namaUraian, startOfMonth, endOfMonth) {
  let result = await prismaClient.neraca.findFirst({
    where: {
      nama_uraian: namaUraian,
      bulan_tahun: {
        gte: startOfMonth, // >= awal bulan sebelumnya
        lte: endOfMonth, // <= akhir bulan sebelumnya
      },
    },
    select: {
      akhir_debit: true,
      akhir_kredit: true,
    },
  });

  return {
    akhir_debit: parseFloat(result.akhir_debit) || 0,
    akhir_kredit: parseFloat(result.akhir_kredit) || 0,
  };
}

async function kas(bulan, tahun) {
  // Ambil data akhir_debit dan akhir_kredit dari tabel neraca bulan lalu format datetime berdasarkan bulan_tahun apabila nama_uraian == "kas" dan bulan sekarang januari maka ambil desember dari tahun lalu
  bulan = bulan - 1;
  if (bulan === 0) {
    bulan = 12;
    tahun = tahun - 1;
  }

  const startOfMonth = new Date(tahun, bulan - 1, 1, 0, 0, 0); // Awal bulan sebelumnya
  const endOfMonth = new Date(tahun, bulan, 0, 23, 59, 59); // Akhir bulan sebelumnya

  const neracaAwalKas = await getNeracaAwalKas("kas", startOfMonth, endOfMonth);

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    getTotalCashInOutByDateRange(16, startOfMonth, endOfMonth),
    getTotalCashInOutByDateRange(1, startOfMonth, endOfMonth),
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

  return {
    neraca_awal: {
      debit: neracaAwalKas.akhir_debit,
      kredit: neracaAwalKas.akhir_kredit,
    },
    neraca_mutasi: {
      debit: neracaMutasiDebit,
      kredit: neracaMutasiKredit,
    },
    neraca_percobaan: neracaPercobaan,
    neraca_saldo: neracaSaldo,
    hasil_usaha: {
      debit: 0,
      kredit: 0,
    },
    neraca_akhir: neracaAkhir,
  };
}

async function bankBri(bulan, tahun) {
  // Ambil data akhir_debit dan akhir_kredit dari tabel neraca bulan lalu format datetime berdasarkan bulan_tahun apabila nama_uraian == "kas" dan bulan sekarang januari maka ambil desember dari tahun lalu
  bulan = bulan - 1;
  if (bulan === 0) {
    bulan = 12;
    tahun = tahun - 1;
  }

  const startOfMonth = new Date(tahun, bulan - 1, 1, 0, 0, 0); // Awal bulan sebelumnya
  const endOfMonth = new Date(tahun, bulan, 0, 23, 59, 59); // Akhir bulan sebelumnya

  const neracaAwalKas = await getNeracaAwalKas("kas", startOfMonth, endOfMonth);

  const [neracaMutasiDebit, neracaMutasiKredit] = await Promise.all([
    getTotalCashInOutByDateRange(16, startOfMonth, endOfMonth),
    getTotalCashInOutByDateRange(1, startOfMonth, endOfMonth),
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

  return {
    neraca_awal: {
      debit: neracaAwalKas.akhir_debit,
      kredit: neracaAwalKas.akhir_kredit,
    },
    neraca_mutasi: {
      debit: neracaMutasiDebit,
      kredit: neracaMutasiKredit,
    },
    neraca_percobaan: neracaPercobaan,
    neraca_saldo: neracaSaldo,
    hasil_usaha: {
      debit: 0,
      kredit: 0,
    },
    neraca_akhir: neracaAkhir,
  };
}

async function laporanNeracaLajur(bulan, tahun) {
  const kasResult = await kas(bulan, tahun);
  const bankBriResult = await bankBri(bulan, tahun);

  return {
    data_neraca: {
      kas: kasResult,
      bank_bri: dummyData,
      piutang_dagang: dummyData,
      persediaan: dummyData,
      penghapusan_persediaan: dummyData,
      inventaris: dummyData,
      akumulasi_penyusutan_inventaris: dummyData,
      gedung: dummyData,
      akumulasi_penyusutan_gedung: dummyData,
      utang_dagang: dummyData,
      utang_sp: dummyData,
      modal_tidak_tetap: dummyData,
      modal_disetor: dummyData,
      usaha_lain_toko: dummyData,
      modal_unit_toko: dummyData,
      shu_th_2023: dummyData,
      shu_th_2024: dummyData,
      penjualan_tunai: dummyData,
      penjualan_kredit: dummyData,
      penjualan_qris: dummyData,
      pendapatan_sewa: dummyData,
      pendapatan_lain: dummyData,
      pembelian_tunai: dummyData,
      pembelian_kredit: dummyData,
      retur_pembelian: dummyData,
      beban_gaji: dummyData,
      uang_makan: dummyData,
      thr_karyawan: dummyData,
      beban_adm_umum: dummyData,
      beban_perlengkapan: dummyData,
      beban_penyusutan_inventaris: dummyData,
      beban_penyusutan_gedung: dummyData,
      pemeliharaan_inventaris: dummyData,
      pemeliharaan_gedung: dummyData,
      pengeluaran_lain: dummyData,
      pengeluaran_pusat_lain: dummyData,
    },
    total_neraca: {
      total_neraca_awal: {
        debit: 0,
        kredit: 0,
      },
      total_neraca_mutasi: {
        debit: 0,
        kredit: 0,
      },
      total_neraca_percobaan: {
        debit: 0,
        kredit: 0,
      },
      total_neraca_saldo: {
        debit: 0,
        kredit: 0,
      },
      total_hasil_usaha: {
        debit: 0,
        kredit: 0,
      },
      total_neraca_akhir: {
        debit: 0,
        kredit: 0,
      },
    },
  };
}

const dummyData = {
  neraca_awal: {
    debit: 0,
    kredit: 0,
  },
  neraca_mutasi: {
    debit: 0,
    kredit: 0,
  },
  neraca_percobaan: {
    debit: 0,
    kredit: 0,
  },
  neraca_saldo: {
    debit: 0,
    kredit: 0,
  },
  hasil_usaha: {
    debit: 0,
    kredit: 0,
  },
  neraca_akhir: {
    debit: 0,
    kredit: 0,
  },
};

export { laporanNeracaLajur };
