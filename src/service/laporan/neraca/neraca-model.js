function createNeracaModel(
  kas,
  bankBri,
  bankBni,
  piutangAnggota,
  persediaan,
  penghapusanPersediaan,
  inventaris,
  gedung,
  akumPenyusutanInventaris,
  akumPenyusutanGedung,
  hutangDagang,
  modalTidakTetap,
  utangDariSp,
  usahaLainToko,
  modalDisetor,
  modalUnitToko,
  shuTh2023,
  shuTh2024,
  shuTh2025
) {
  const jumlahAktivaLancar =
    kas +
    bankBri +
    bankBni +
    piutangAnggota +
    persediaan +
    penghapusanPersediaan;

  const jumlahAktivaTetap = inventaris + gedung;
  const jumlahAkumPenyusutan = akumPenyusutanInventaris + akumPenyusutanGedung;
  const nilaiBukuAktiva = jumlahAktivaTetap - jumlahAkumPenyusutan;
  const jumlahAktivaLain = 0;

  const jumlahHutangLancar = hutangDagang + modalTidakTetap;

  const jumlahDanaModalShu =
    usahaLainToko +
    modalDisetor +
    modalUnitToko +
    shuTh2023 +
    shuTh2024 +
    shuTh2025;

  return {
    aktiva_lancar: {
      kas: kas,
      bank_bri: bankBri,
      bank_bni: bankBni,
      piutang_anggota: piutangAnggota,
      persediaan: persediaan,
      penghapusan_persediaan: penghapusanPersediaan,
      jumlah: jumlahAktivaLancar,
    },
    aktiva_tetap: {
      inventaris: inventaris,
      gedung: gedung,
      jumlah: jumlahAktivaTetap,
    },
    akum_penyusutan: {
      inventaris: akumPenyusutanInventaris,
      gedung: akumPenyusutanGedung,
      jumlah: jumlahAkumPenyusutan,
    },
    nilai_buku_aktiva: nilaiBukuAktiva,
    aktiva_lain: {
      jumlah: jumlahAktivaLain,
    },
    total_aktiva: jumlahAktivaLancar + nilaiBukuAktiva + jumlahAktivaLain,
    hutang_lancar: {
      hutang_dagang: hutangDagang,
      modal_tidak_tetap: modalTidakTetap,
      jumlah: jumlahHutangLancar,
    },
    utang_dari_sp: {
      utang_dari_sp: utangDariSp,
      jumlah: utangDariSp,
    },
    dana_modal_shu: {
      usaha_lain_toko: usahaLainToko,
      modal_disetor: modalDisetor,
      modal_unit_toko: modalUnitToko,
      shu_th_2023: shuTh2023,
      shu_th_2024: shuTh2024,
      shu_th_2025: shuTh2025,
      jumlah: jumlahDanaModalShu,
    },
    total_pasiva: jumlahHutangLancar + utangDariSp + jumlahDanaModalShu,
  };
}

export { createNeracaModel };
