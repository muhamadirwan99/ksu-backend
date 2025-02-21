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

export { getNeracaPercobaan };
