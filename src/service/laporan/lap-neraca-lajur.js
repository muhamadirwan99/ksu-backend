import {
  akumPenyGedung,
  akumPenyInventaris,
  bankBni,
  bankBri,
  bebanAdmUmum,
  bebanGaji,
  bebanPenyusutanGedung,
  bebanPenyusutanInventaris,
  bebanPerlengkapanToko,
  gedung,
  inventaris,
  kas,
  modalDisetor,
  modalTidakTetap,
  modalUnitToko,
  pemeliharaanGedung,
  pemeliharaanInventaris,
  pengeluaranLainLain,
  penghapusanPersediaan,
  persediaan,
  piutangDagang,
  shuTh2023,
  shuTh2024,
  shuTh2025,
  thrKaryawan,
  uangMakan,
  usahaLainLainToko,
  utangDagang,
  utangDariSP,
  utangPihakKetiga,
} from "./neraca/account-neraca-lajur.js";
import { getDate, setYearMonth } from "./neraca/calculate-neraca-lajur.js";

async function laporanNeracaLajur(month, year) {
  setYearMonth(year, month);
  getDate(year, month);

  const kasResult = await kas();
  const bankBriResult = await bankBri();
  const bankBniResult = await bankBni();
  const piutangDagangResult = await piutangDagang();
  const persediaanResult = await persediaan();
  const penghapusanPersediaanResult = await penghapusanPersediaan();
  const inventarisResult = await inventaris();
  const akumPenyInventarisResult = await akumPenyInventaris();
  const gedungResult = await gedung();
  const akumPenyGedungResult = await akumPenyGedung();
  const modalTidakTetapResult = await modalTidakTetap();
  const modalDisetorResult = await modalDisetor();
  const usahaLainLainTokoResult = await usahaLainLainToko();
  const modalUnitTokoResult = await modalUnitToko();
  const shuTh2023Result = await shuTh2023();
  const shuTh2024Result = await shuTh2024();
  const shuTh2025Result = await shuTh2025();
  const utangDagangResult = await utangDagang();
  const utangPihakKetigaResult = await utangPihakKetiga();
  const utangDariSPResult = await utangDariSP();
  const bebanGajiResult = await bebanGaji();
  const uangMakanResult = await uangMakan();
  const thrResult = await thrKaryawan();
  const bebanAdmUmumResult = await bebanAdmUmum();
  const bebanPerlengkapanResult = await bebanPerlengkapanToko();
  const bebanPenyusutanInventarisResult = await bebanPenyusutanInventaris();
  const bebanPenyusutanGedungResult = await bebanPenyusutanGedung();
  const pemeliharaanInventarisResult = await pemeliharaanInventaris();
  const pemeliharaanGedungResult = await pemeliharaanGedung();
  const pengeluaranLainLainResult = await pengeluaranLainLain();

  return {
    data_neraca: {
      kas: kasResult,
      bank_bri: bankBriResult,
      bank_bni: bankBniResult,
      piutang_dagang: piutangDagangResult,
      persediaan: persediaanResult,
      penghapusan_persediaan: penghapusanPersediaanResult,
      inventaris: inventarisResult,
      akumulasi_penyusutan_inventaris: akumPenyInventarisResult,
      gedung: gedungResult,
      akumulasi_penyusutan_gedung: akumPenyGedungResult,
      modal_tidak_tetap: modalTidakTetapResult,
      modal_disetor: modalDisetorResult,
      usaha_lain_toko: usahaLainLainTokoResult,
      modal_unit_toko: modalUnitTokoResult,
      shu_th_2023: shuTh2023Result,
      shu_th_2024: shuTh2024Result,
      shu_th_2025: shuTh2025Result,
      utang_dagang: utangDagangResult,
      utang_dari_pihak_ketiga: utangPihakKetigaResult,
      utang_dari_sp: utangDariSPResult,
      penjualan_tunai: dummyData,
      penjualan_kredit: dummyData,
      penjualan_qris: dummyData,
      harga_pokok_penjualan: dummyData,
      retur_penjualan: dummyData,
      pendapatan_sewa: dummyData,
      pendapatan_lain: dummyData,
      pembelian_tunai: dummyData,
      pembelian_kredit: dummyData,
      harga_pokok_pembelian: dummyData,
      retur_pembelian: dummyData,
      beban_gaji: bebanGajiResult,
      uang_makan: uangMakanResult,
      thr_karyawan: thrResult,
      beban_adm_umum: bebanAdmUmumResult,
      beban_perlengkapan_toko: bebanPerlengkapanResult,
      beban_penyusutan_inventaris: bebanPenyusutanInventarisResult,
      beban_penyusutan_gedung: bebanPenyusutanGedungResult,
      pemeliharaan_inventaris: pemeliharaanInventarisResult,
      pemeliharaan_gedung: pemeliharaanGedungResult,
      pengeluaran_lain: pengeluaranLainLainResult,
      beban_kerugian_persediaan: dummyData,
      honor_pengurus: dummyData,
      honor_pengawas: dummyData,
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
