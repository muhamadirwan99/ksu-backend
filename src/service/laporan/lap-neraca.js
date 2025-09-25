import { laporanNeracaLajur } from "./lap-neraca-lajur.js";
import { createNeracaModel } from "./neraca/neraca-model.js";

async function laporanNeraca(month, year) {
  const neracaLajurCurrent = (await laporanNeracaLajur(month, year))
    .data_neraca;
  // If the previous month is less than 1, we assume it to be December of the previous year
  const previousYear = month === 1 ? year - 1 : year;
  const previousMonth = month === 1 ? 12 : month - 1;
  const neracaLajurPrevious = (
    await laporanNeracaLajur(previousMonth.toString(), previousYear.toString())
  ).data_neraca;

  const neracaCurrent = createNeracaModel(
    neracaLajurCurrent.kas.neraca_akhir.debit,
    neracaLajurCurrent.bank_bri.neraca_akhir.debit,
    neracaLajurCurrent.bank_bni.neraca_akhir.debit,
    neracaLajurCurrent.piutang_dagang.neraca_akhir.debit,
    neracaLajurCurrent.persediaan.neraca_akhir.debit,
    neracaLajurCurrent.penghapusan_persediaan.neraca_akhir.debit,
    neracaLajurCurrent.inventaris.neraca_akhir.debit,
    neracaLajurCurrent.gedung.neraca_akhir.debit,
    neracaLajurCurrent.akumulasi_penyusutan_inventaris.neraca_akhir.kredit,
    neracaLajurCurrent.akumulasi_penyusutan_gedung.neraca_akhir.kredit,
    neracaLajurCurrent.utang_dagang.neraca_akhir.kredit,
    neracaLajurCurrent.modal_tidak_tetap.neraca_akhir.kredit,
    neracaLajurCurrent.utang_dari_pihak_ketiga.neraca_akhir.kredit,
    neracaLajurCurrent.utang_dari_sp.neraca_akhir.kredit,
    neracaLajurCurrent.usaha_lain_toko.neraca_akhir.kredit,
    neracaLajurCurrent.modal_disetor.neraca_akhir.kredit,
    neracaLajurCurrent.modal_unit_toko.neraca_akhir.kredit,
    neracaLajurCurrent.shu_th_2023.neraca_akhir.kredit,
    neracaLajurCurrent.shu_th_2024.neraca_akhir.kredit,
    neracaLajurCurrent.shu_th_2025.neraca_akhir.kredit
  );

  const neracaPrevious = createNeracaModel(
    neracaLajurPrevious.kas.neraca_akhir.debit,
    neracaLajurPrevious.bank_bri.neraca_akhir.debit,
    neracaLajurPrevious.bank_bni.neraca_akhir.debit,
    neracaLajurPrevious.piutang_dagang.neraca_akhir.debit,
    neracaLajurPrevious.persediaan.neraca_akhir.debit,
    neracaLajurPrevious.penghapusan_persediaan.neraca_akhir.debit,
    neracaLajurPrevious.inventaris.neraca_akhir.debit,
    neracaLajurPrevious.gedung.neraca_akhir.debit,
    neracaLajurPrevious.akumulasi_penyusutan_inventaris.neraca_akhir.kredit,
    neracaLajurPrevious.akumulasi_penyusutan_gedung.neraca_akhir.kredit,
    neracaLajurPrevious.utang_dagang.neraca_akhir.kredit,
    neracaLajurPrevious.modal_tidak_tetap.neraca_akhir.kredit,
    neracaLajurPrevious.utang_dari_pihak_ketiga.neraca_akhir.kredit,
    neracaLajurPrevious.utang_dari_sp.neraca_akhir.kredit,
    neracaLajurPrevious.usaha_lain_toko.neraca_akhir.kredit,
    neracaLajurPrevious.modal_disetor.neraca_akhir.kredit,
    neracaLajurPrevious.modal_unit_toko.neraca_akhir.kredit,
    neracaLajurPrevious.shu_th_2023.neraca_akhir.kredit,
    neracaLajurPrevious.shu_th_2024.neraca_akhir.kredit,
    neracaLajurPrevious.shu_th_2025.neraca_akhir.kredit
  );

  return {
    current: neracaCurrent,
    previous: neracaPrevious,
  };
}

export { laporanNeraca };
