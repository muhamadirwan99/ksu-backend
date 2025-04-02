const generateDate = () => {
  const date = new Date();
  const gmtPlus7Offset = 7 * 60;
  return new Date(date.getTime() + gmtPlus7Offset * 60 * 1000);
};

function getNextMonthDate(year, month) {
  // Buat tanggal 1 bulan ini
  const localMidnight = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));

  // Tambah 1 bulan (dalam konteks UTC, biar aman timezone)
  const nextMonthUTC = new Date(localMidnight);
  nextMonthUTC.setUTCMonth(localMidnight.getUTCMonth() + 1);

  // Tambah offset 7 jam (GMT+7) supaya pas masuk DB tetap 00:00:00 WIB
  const gmtPlus7Offset = 7 * 60 * 60 * 1000;

  return new Date(nextMonthUTC.getTime() + gmtPlus7Offset);
}

export { generateDate, getNextMonthDate };
