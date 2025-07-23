const generateDate = () => {
  // Karena Docker sudah di-set ke timezone Asia/Jakarta,
  // tidak perlu manual offset lagi
  return new Date();
};

function getNextMonthDate(year, month) {
  // Buat tanggal 1 bulan ini
  const localMidnight = new Date(year, month - 1, 1, 0, 0, 0);

  // Tambah 1 bulan
  const nextMonth = new Date(localMidnight);
  nextMonth.setMonth(localMidnight.getMonth() + 1);

  return nextMonth;
}

export { generateDate, getNextMonthDate };
