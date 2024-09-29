import { prismaClient } from "../application/database.js";

const generatePurchaseId = async (tg_pembelian) => {
  const year = tg_pembelian.getFullYear();
  const month = String(tg_pembelian.getMonth() + 1).padStart(2, "0");
  const day = String(tg_pembelian.getDate()).padStart(2, "0");

  const datePrefix = `${year}${month}${day}`;

  let increment;
  let purchaseId;
  let idExists = true;
  let countToday = 0;

  // Coba menghasilkan ID yang unik
  while (idExists) {
    countToday++;
    increment = String(countToday).padStart(3, "0");
    purchaseId = `BL-${datePrefix}${increment}`;

    // Cek apakah ID sudah ada di database
    const existingPurchase = await prismaClient.pembelian.findUnique({
      where: {
        id_pembelian: purchaseId,
      },
    });

    if (!existingPurchase) {
      idExists = false; // Jika ID tidak ada, keluar dari loop
    }
  }

  return purchaseId;
};

export { generatePurchaseId };
