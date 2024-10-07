import { prismaClient } from "../application/database.js";

const generateSupplierId = async () => {
  // Increment counter di tabel 'counters' untuk supplier
  const counter = await prismaClient.counter.update({
    where: { name: "supplier" },
    data: {
      value: {
        increment: 1, // Tambahkan 1 ke value counter
      },
    },
  });

  // Generate ID supplier baru berdasarkan nilai counter
  return "SUP" + String(counter.value).padStart(3, "0");
};

export { generateSupplierId };
