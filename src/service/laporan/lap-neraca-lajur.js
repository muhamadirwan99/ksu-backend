import {
  bebanAdmUmum,
  bebanGaji,
  bebanPenyusutanInventaris,
  bebanPerlengkapanToko,
  thrKaryawan,
  uangMakan,
} from "./neraca/account-neraca-lajur.js";
import { setYearMonth } from "./neraca/count-neraca-lajur.js";

async function laporanNeracaLajur(month, year) {
  setYearMonth(year, month);

  // const kasResult = await kas();
  const bebanGajiResult = await bebanGaji();
  const uangMakanResult = await uangMakan();
  const thrResult = await thrKaryawan();
  const bebanAdmUmumResult = await bebanAdmUmum();
  const bebanPerlengkapanResult = await bebanPerlengkapanToko();
  const bebanPenyusutanInventarisResult = await bebanPenyusutanInventaris();

  return {
    data_neraca: {
      kas: dummyData,
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
      beban_gaji: bebanGajiResult,
      uang_makan: uangMakanResult,
      thr_karyawan: thrResult,
      beban_adm_umum: bebanAdmUmumResult,
      beban_perlengkapan: bebanPerlengkapanResult,
      beban_penyusutan_inventaris: bebanPenyusutanInventarisResult,
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
