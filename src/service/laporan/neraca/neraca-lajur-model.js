function createNeracaModel(
  neracaAwalDebit,
  neracaAwalKredit,
  neracaMutasiDebit,
  neracaMutasiKredit,
  neracaPercobaan,
  neracaSaldo,
  hasilUsaha,
  neracaAkhir,
) {
  return {
    neraca_awal: {
      debit: neracaAwalDebit,
      kredit: neracaAwalKredit,
    },
    neraca_mutasi: {
      debit: neracaMutasiDebit,
      kredit: neracaMutasiKredit,
    },
    neraca_percobaan: neracaPercobaan,
    neraca_saldo: neracaSaldo,
    hasil_usaha: hasilUsaha,
    neraca_akhir: neracaAkhir,
  };
}

export { createNeracaModel };
