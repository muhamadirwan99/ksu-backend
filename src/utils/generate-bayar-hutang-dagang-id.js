import { prismaClient } from "../application/database.js";

const generateBayarHutangDagangId = async (tg_bayar_hutang) => {
  const year = tg_bayar_hutang.getFullYear();
  const month = String(tg_bayar_hutang.getMonth() + 1).padStart(2, "0");
  const day = String(tg_bayar_hutang.getDate()).padStart(2, "0");

  const datePrefix = `${day}${month}${year}`;

  let increment;
  let historyHutangDagangId;
  let idExists = true;
  let countToday = 0;

  // Coba menghasilkan ID yang unik
  while (idExists) {
    countToday++;
    increment = String(countToday).padStart(3, "0");
    historyHutangDagangId = `BHD-${datePrefix}${increment}`;

    // Cek apakah ID sudah ada di database
    const existingPurchase = await prismaClient.historyHutangDagang.findUnique({
      where: {
        id_history_hutang_dagang: historyHutangDagangId,
      },
    });

    if (!existingPurchase) {
      idExists = false; // Jika ID tidak ada, keluar dari loop
    }
  }

  return historyHutangDagangId;
};

export { generateBayarHutangDagangId };
