import {
  akumPenyGedung,
  akumPenyInventaris,
  bankBni,
  bankBri,
  bebanAdmUmum,
  bebanGaji,
  bebanKerugianPersediaan,
  bebanPenyusutanGedung,
  bebanPenyusutanInventaris,
  bebanPerlengkapanToko,
  gedung,
  hargaPokokPembelian,
  hargaPokokPenjualan,
  honorPengawas,
  honorPengurus,
  inventaris,
  kas,
  modalDisetor,
  modalTidakTetap,
  modalUnitToko,
  pembelianKredit,
  pembelianTunai,
  pemeliharaanGedung,
  pemeliharaanInventaris,
  pendapatanLainLain,
  pendapatanSewa,
  pengeluaranLainLain,
  penghapusanPersediaan,
  penjualanKredit,
  penjualanQris,
  penjualanTunai,
  persediaan,
  piutangDagang,
  returPembelian,
  returPenjualan,
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
import { generateDate, getNextMonthDate } from "../../utils/generate-date.js";
import { prismaClient } from "../../application/database.js";

async function laporanNeracaLajur(month, year) {
  setYearMonth(year, month);
  getDate(year, month);

  const now = generateDate();
  const bulanTahun = getNextMonthDate(year, month);
  bulanTahun.setUTCHours(0, 0, 0, 0);

  // Parallel execution untuk semua fungsi async
  const [
    kasResult,
    bankBriResult,
    bankBniResult,
    piutangDagangResult,
    persediaanResult,
    penghapusanPersediaanResult,
    inventarisResult,
    akumPenyInventarisResult,
    gedungResult,
    akumPenyGedungResult,
    modalTidakTetapResult,
    modalDisetorResult,
    usahaLainLainTokoResult,
    modalUnitTokoResult,
    shuTh2023Result,
    shuTh2024Result,
    shuTh2025Result,
    utangDagangResult,
    utangPihakKetigaResult,
    utangDariSPResult,
  ] = await Promise.all([
    kas(),
    bankBri(),
    bankBni(),
    piutangDagang(),
    persediaan(),
    penghapusanPersediaan(),
    inventaris(),
    akumPenyInventaris(),
    gedung(),
    akumPenyGedung(),
    modalTidakTetap(),
    modalDisetor(),
    usahaLainLainToko(),
    modalUnitToko(),
    shuTh2023(),
    shuTh2024(),
    shuTh2025(),
    utangDagang(),
    utangPihakKetiga(),
    utangDariSP(),
  ]);

  const neracaData = [
    { akun_id: 1, ...kasResult.neraca_akhir },
    { akun_id: 2, ...bankBriResult.neraca_akhir },
    { akun_id: 3, ...bankBniResult.neraca_akhir },
    { akun_id: 4, ...piutangDagangResult.neraca_akhir },
    { akun_id: 5, ...persediaanResult.neraca_akhir },
    { akun_id: 6, ...penghapusanPersediaanResult.neraca_akhir },
    { akun_id: 7, ...inventarisResult.neraca_akhir },
    { akun_id: 8, ...akumPenyInventarisResult.neraca_akhir },
    { akun_id: 9, ...gedungResult.neraca_akhir },
    { akun_id: 10, ...akumPenyGedungResult.neraca_akhir },
    { akun_id: 11, ...modalTidakTetapResult.neraca_akhir },
    { akun_id: 12, ...modalDisetorResult.neraca_akhir },
    { akun_id: 13, ...usahaLainLainTokoResult.neraca_akhir },
    { akun_id: 14, ...modalUnitTokoResult.neraca_akhir },
    { akun_id: 15, ...shuTh2023Result.neraca_akhir },
    { akun_id: 16, ...shuTh2024Result.neraca_akhir },
    { akun_id: 17, ...shuTh2025Result.neraca_akhir },
    { akun_id: 18, ...utangDagangResult.neraca_akhir },
    { akun_id: 19, ...utangPihakKetigaResult.neraca_akhir },
    { akun_id: 20, ...utangDariSPResult.neraca_akhir },
  ].map((item) => ({
    akun_id: item.akun_id,
    debit: parseFloat(item.debit) || 0,
    kredit: parseFloat(item.kredit) || 0,
  }));

  // Optimized upsert with Promise.all (parallel)
  await Promise.all(
    neracaData.map(async (item) => {
      const existing = await prismaClient.neraca.findFirst({
        where: {
          akun_id: item.akun_id,
          bulan_tahun: bulanTahun,
        },
      });

      if (existing) {
        await prismaClient.neraca.update({
          where: {
            id_neraca: existing.id_neraca,
          },
          data: {
            debit: item.debit,
            kredit: item.kredit,
            updated_at: now,
          },
        });
      } else {
        await prismaClient.neraca.create({
          data: {
            akun_id: item.akun_id,
            debit: item.debit,
            kredit: item.kredit,
            bulan_tahun: bulanTahun,
            created_at: now,
          },
        });
      }
    }),
  );

  // Sisanya (beban2 dan dummy) tetap sama
  const [
    penjualanTunaiResult,
    penjualanQrisResult,
    penjualanKreditResult,
    hargaPokokPenjualanResult,
    returPenjualanResult,
    pendapatanSewaResult,
    pendapatanLainLainResult,
    pembelianTunaiResult,
    pembelianKreditResult,
    hargaPokokPembelianResult,
    returPembelianResult,
    bebanGajiResult,
    uangMakanResult,
    thrResult,
    bebanAdmUmumResult,
    bebanPerlengkapanResult,
    bebanPenyusutanInventarisResult,
    bebanPenyusutanGedungResult,
    pemeliharaanInventarisResult,
    pemeliharaanGedungResult,
    pengeluaranLainLainResult,
    bebanKerugianPersediaanResult,
    honorPengurusResult,
    honorPengawasResult,
  ] = await Promise.all([
    penjualanTunai(),
    penjualanQris(),
    penjualanKredit(),
    hargaPokokPenjualan(),
    returPenjualan(),
    pendapatanSewa(),
    pendapatanLainLain(),
    pembelianTunai(),
    pembelianKredit(),
    hargaPokokPembelian(),
    returPembelian(),
    bebanGaji(),
    uangMakan(),
    thrKaryawan(),
    bebanAdmUmum(),
    bebanPerlengkapanToko(),
    bebanPenyusutanInventaris(),
    bebanPenyusutanGedung(),
    pemeliharaanInventaris(),
    pemeliharaanGedung(),
    pengeluaranLainLain(),
    bebanKerugianPersediaan(),
    honorPengurus(),
    honorPengawas(),
  ]);

  const data_neraca = {
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
    penjualan_tunai: penjualanTunaiResult,
    penjualan_qris: penjualanQrisResult,
    penjualan_kredit: penjualanKreditResult,
    harga_pokok_penjualan: hargaPokokPenjualanResult,
    retur_penjualan: returPenjualanResult,
    pendapatan_sewa: pendapatanSewaResult,
    pendapatan_lain: pendapatanLainLainResult,
    pembelian_tunai: pembelianTunaiResult,
    pembelian_kredit: pembelianKreditResult,
    harga_pokok_pembelian: hargaPokokPembelianResult,
    retur_pembelian: returPembelianResult,
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
    beban_kerugian_persediaan: bebanKerugianPersediaanResult,
    honor_pengurus: honorPengurusResult,
    honor_pengawas: honorPengawasResult,
  };

  // Total semua dari data_neraca
  const total_neraca = {
    total_neraca_awal: { debit: 0, kredit: 0 },
    total_neraca_mutasi: { debit: 0, kredit: 0 },
    total_neraca_percobaan: { debit: 0, kredit: 0 },
    total_neraca_saldo: { debit: 0, kredit: 0 },
    total_hasil_usaha: { debit: 0, kredit: 0 },
    total_neraca_akhir: { debit: 0, kredit: 0 },
  };

  for (const item of Object.values(data_neraca)) {
    total_neraca.total_neraca_awal.debit += item.neraca_awal.debit;
    total_neraca.total_neraca_awal.kredit += item.neraca_awal.kredit;

    total_neraca.total_neraca_mutasi.debit += item.neraca_mutasi.debit;
    total_neraca.total_neraca_mutasi.kredit += item.neraca_mutasi.kredit;

    total_neraca.total_neraca_percobaan.debit += item.neraca_percobaan.debit;
    total_neraca.total_neraca_percobaan.kredit += item.neraca_percobaan.kredit;

    total_neraca.total_neraca_saldo.debit += item.neraca_saldo.debit;
    total_neraca.total_neraca_saldo.kredit += item.neraca_saldo.kredit;

    total_neraca.total_hasil_usaha.debit += item.hasil_usaha.debit;
    total_neraca.total_hasil_usaha.kredit += item.hasil_usaha.kredit;

    total_neraca.total_neraca_akhir.debit += item.neraca_akhir.debit;
    total_neraca.total_neraca_akhir.kredit += item.neraca_akhir.kredit;
  }

  return {
    data_neraca,
    total_neraca,
  };
}

export { laporanNeracaLajur };
