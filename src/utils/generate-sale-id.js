import { prismaClient } from "../application/database.js";

const generateSaleId = async (tg_pembelian) => {
  const year = tg_pembelian.getFullYear();
  const month = String(tg_pembelian.getMonth() + 1).padStart(2, "0");
  const day = String(tg_pembelian.getDate()).padStart(2, "0");

  const datePrefix = `${day}${month}${year}`;

  let increment;
  let saleId;
  let idExists = true;
  let countToday = 0;

  // Coba menghasilkan ID yang unik
  while (idExists) {
    countToday++;
    increment = String(countToday).padStart(3, "0");
    saleId = `JL-${datePrefix}${increment}`;

    // Cek apakah ID sudah ada di database
    const existingPurchase = await prismaClient.penjualan.findUnique({
      where: {
        id_penjualan: saleId,
      },
    });

    if (!existingPurchase) {
      idExists = false; // Jika ID tidak ada, keluar dari loop
    }
  }

  return saleId;
};

export { generateSaleId };
