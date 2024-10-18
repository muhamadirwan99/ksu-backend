import { prismaClient } from "../application/database.js";

const generateBayarHutangAnggotaId = async (tg_bayar_hutang) => {
  const year = tg_bayar_hutang.getFullYear();
  const month = String(tg_bayar_hutang.getMonth() + 1).padStart(2, "0");
  const day = String(tg_bayar_hutang.getDate()).padStart(2, "0");

  const datePrefix = `${day}${month}${year}`;

  let increment;
  let historyHutangAnggotaId;
  let idExists = true;
  let countToday = 0;

  // Coba menghasilkan ID yang unik
  while (idExists) {
    countToday++;
    increment = String(countToday).padStart(3, "0");
    historyHutangAnggotaId = `BHA-${datePrefix}${increment}`;

    // Cek apakah ID sudah ada di database
    const existingPurchase = await prismaClient.historyHutangAnggota.findUnique(
      {
        where: {
          id_history_hutang_anggota: historyHutangAnggotaId,
        },
      },
    );

    if (!existingPurchase) {
      idExists = false; // Jika ID tidak ada, keluar dari loop
    }
  }

  return historyHutangAnggotaId;
};

export { generateBayarHutangAnggotaId };
