// Import Prisma Client yang sudah di-generate
import { PrismaClient as PrismaOldClient } from "./generated/old-client/index.js";
import { PrismaClient as PrismaNewClient } from "@prisma/client";
import { generateShortIdFromUUID } from "../src/utils/generate-uuid.js";
import { generateDate } from "../src/utils/generate-date.js";
import { generateSupplierId } from "../src/utils/generate-supplier-id.js";

// Inisialisasi Prisma Client untuk masing-masing database
const prismaLama = new PrismaOldClient();
const prismaBaru = new PrismaNewClient();
const batchSize = 100; // Sesuaikan dengan jumlah batch yang Anda inginkan

async function migrateData() {
  try {
    // await migrateAnggota();
    // await migrateDivisi();
    // await migratesSupplier();
    await migrateProducts();
  } catch (error) {
    console.error("Error migrasi data:", error);
  } finally {
    await prismaLama.$disconnect();
    await prismaBaru.$disconnect();
  }
}

async function migrateProducts() {
  const batchSize = 100; // Tentukan ukuran batch
  // Ambil data dari database lama
  const oldData = await prismaLama.produk.findMany();

  // Bagi data menjadi batch untuk mengurangi beban
  for (let i = 0; i < oldData.length; i += batchSize) {
    const batch = oldData.slice(i, i + batchSize);

    const newData = await Promise.all(
      batch.map(async (entry) => {
        // Cari kode_divisi di tabel divisi lama berdasarkan id_divisi dari produk lama
        const divisiLama = await prismaLama.divisi.findUnique({
          where: {
            id: entry.divisi, // id_divisi dari produk lama
          },
        });

        // Jika tidak menemukan divisi yang sesuai, skip entri produk ini
        if (!divisiLama) {
          console.warn(
            `Divisi dengan id_divisi ${entry.divisi} tidak ditemukan untuk produk ${entry.nama}. Skipping...`,
          );
          return null; // Skip produk ini
        }

        // Cari id_supplier di tabel supplier lama berdasarkan id_supplier dari produk lama
        const supplierLama = await prismaLama.supplier.findUnique({
          where: {
            id: entry.supplier, // id_supplier dari produk lama
          },
        });

        // Jika tidak menemukan supplier yang sesuai, skip entri produk ini
        if (!supplierLama) {
          console.warn(
            `Supplier dengan id_supplier ${entry.supplier} tidak ditemukan untuk produk ${entry.nama}. Skipping...`,
          );
          return null; // Skip produk ini
        }

        // Cari id_supplier di tabel supplier baru berdasarkan nama_supplier dari supplier lama
        const supplierBaru = await prismaBaru.supplier.findFirst({
          where: {
            nm_supplier: supplierLama.nama || "", // nama_supplier dari supplier lama
          },
        });

        // Jika tidak menemukan supplier yang sesuai di database baru, skip entri produk ini
        if (!supplierBaru) {
          console.warn(
            `Supplier dengan nama_supplier ${supplierLama.nama} tidak ditemukan untuk produk ${entry.nama}. Skipping...`,
          );
          return null; // Skip produk ini
        }

        return {
          id_product: entry.kode,
          nm_product: entry.nama,
          id_divisi: divisiLama.kode, // Menggunakan kode divisi dari tabel divisi lama
          id_supplier: supplierBaru.id_supplier, // Supplier ID dari tabel supplier baru
          harga_jual: entry.harga_jual,
          harga_beli: entry.harga_beli,
          status_product: entry.status === 1, // Menggunakan boolean untuk status
          jumlah: entry.jumlah,
          keterangan: entry.keterangan,
          created_at: new Date(entry.created), // Menggunakan tanggal dari database lama
          updated_at: new Date(entry.modified), // Menggunakan tanggal dari database lama
        };
      }),
    );

    // Filter out null values (produk yang tidak valid)
    const validNewData = newData.filter((data) => data !== null);

    // Simpan data batch secara paralel menggunakan createMany
    try {
      await prismaBaru.product.createMany({
        data: validNewData,
        skipDuplicates: true, // Agar ID yang duplikat dilewati
      });
      console.log(`Batch ${i / batchSize + 1} successfully migrated.`);
    } catch (error) {
      console.error(
        `Error during migration batch ${i / batchSize + 1}:`,
        error,
      );
    }
  }

  console.log("Migrasi data produk berhasil.");
}

async function migratesSupplier() {
  // Ambil data dari database lama
  const oldData = await prismaLama.supplier.findMany();

  // Bagi data menjadi batch untuk mengurangi beban
  for (let i = 0; i < oldData.length; i += batchSize) {
    const batch = oldData.slice(i, i + batchSize);

    const newData = await Promise.all(
      batch.map(async (entry) => {
        const newId = await generateSupplierId();
        console.log("Generated new ID: ", newId);

        return {
          id_supplier: newId, // Gunakan ID yang sudah di-generate
          nm_supplier: entry.nama,
          nm_pemilik: entry.pemilik,
          nm_pic: entry.kontak,
          no_wa: entry.no_wa || "0", // Menangani no_wa jika null
          alamat: entry.alamat,
          hutang_dagang: entry.kredit,
          created_at: generateDate(), // Gunakan Date() untuk waktu saat ini
        };
      }),
    );

    // Simpan data batch secara paralel menggunakan createMany
    try {
      await prismaBaru.supplier.createMany({
        data: newData,
        skipDuplicates: true, // Agar ID yang duplikat dilewati
      });
      console.log(`Batch ${i / batchSize + 1} successfully migrated.`);
    } catch (error) {
      console.error(
        `Error during migration batch ${i / batchSize + 1}:`,
        error,
      );
    }
  }

  console.log("Migrasi data supplier berhasil.");
}

async function migrateDivisi() {
  // Ambil data dari database lama
  const oldData = await prismaLama.divisi.findMany();

  const newData = oldData.map((entry) => ({
    id_divisi: entry.kode,
    nm_divisi: entry.nama,
    created_at: generateDate(),
  }));

  // Simpan ke database baru
  await prismaBaru.divisi.createMany({
    data: newData,
  });

  console.log("Migrasi data divisi berhasil.");
}

async function migrateAnggota() {
  // Ambil data dari database lama
  const oldData = await prismaLama.anggota.findMany();

  const newData = oldData.map((entry) => ({
    id_anggota: generateShortIdFromUUID(), // Format ID ke varchar(8)
    nm_anggota: entry.nama,
    alamat: entry.alamat,
    no_wa: entry.telp,
    limit_pinjaman: entry.kredit_limit,
    pinjaman: entry.kredit_pinjaman,
    hutang: 0,
    created_at: generateDate(),
  }));

  // Simpan ke database baru
  await prismaBaru.anggota.createMany({
    data: newData,
  });

  console.log("Migrasi data anggota berhasil.");
}

migrateData();
