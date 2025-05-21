import { prismaClient } from "../application/database.js";
import { generateDate } from "../utils/generate-date.js";

const calculateDepreciation = async (year) => {
  // year = 2024; // Hardcoded to 2025 for the sake of the example
  const previousYear = year - 1;

  // Check if there's a record for the previous year's depreciation
  const lastYearInventaris = await prismaClient.penyusutanAset.findFirst({
    where: {
      jenis_aset: "inventaris",
      tahun: previousYear,
    },
  });

  const lastYearGedung = await prismaClient.penyusutanAset.findFirst({
    where: {
      jenis_aset: "gedung",
      tahun: previousYear,
    },
  });

  // If no record exists for the previous year, use the 2024 default values
  const bebanPenyusutanInventaris = lastYearInventaris
    ? parseFloat(lastYearInventaris.nilai_aset_akhir)
    : 149185956; // Default for 2024

  const persenBerkurangInventaris = 1.55846 / 100; // Persentase berkurang inventaris

  const bebanPenyusutanGedung = lastYearGedung
    ? parseFloat(lastYearGedung.nilai_aset_akhir)
    : 154878130; // Default for 2024

  const persenBertambahGedung = 3.379 / 100; // Persentase bertambah gedung

  // Calculate the depreciation values
  const totalPenyusutanInventaris =
    bebanPenyusutanInventaris * persenBerkurangInventaris;
  const totalPenyusutanGedung = bebanPenyusutanGedung * persenBertambahGedung;

  // Final values for the year
  const nilaiAsetAkhirInventaris =
    bebanPenyusutanInventaris - totalPenyusutanInventaris;
  const nilaiAsetAkhirGedung = bebanPenyusutanGedung + totalPenyusutanGedung;

  const penyusutanInventarisPerBulan = totalPenyusutanInventaris / 12;
  const penyusutanGedungPerBulan = totalPenyusutanGedung / 12;

  // Check if records for this year already exist, and skip storing new records if they do
  const existingInventaris = await prismaClient.penyusutanAset.findFirst({
    where: {
      jenis_aset: "inventaris",
      tahun: year,
    },
  });

  const existingGedung = await prismaClient.penyusutanAset.findFirst({
    where: {
      jenis_aset: "gedung",
      tahun: year,
    },
  });

  if (existingInventaris && existingGedung) {
    throw new Error(
      `Depreciation records for this year (${year}) already exist`,
    );
  }

  if (!existingInventaris) {
    // Store yearly depreciation for inventaris
    await prismaClient.penyusutanAset.create({
      data: {
        jenis_aset: "inventaris",
        nilai_aset_awal: bebanPenyusutanInventaris,
        persentase_penyusutan: persenBerkurangInventaris * 100, // Store percentage as a whole number
        nilai_penyusutan: totalPenyusutanInventaris,
        nilai_aset_akhir: nilaiAsetAkhirInventaris,
        penyusutan_bulan: penyusutanInventarisPerBulan, // Store monthly depreciation
        tahun: year,
        created_at: generateDate(),
      },
    });
  }

  if (!existingGedung) {
    // Store yearly depreciation for gedung
    await prismaClient.penyusutanAset.create({
      data: {
        jenis_aset: "gedung",
        nilai_aset_awal: bebanPenyusutanGedung,
        persentase_penyusutan: persenBertambahGedung * 100, // Store percentage as a whole number
        nilai_penyusutan: totalPenyusutanGedung,
        nilai_aset_akhir: nilaiAsetAkhirGedung,
        penyusutan_bulan: penyusutanGedungPerBulan, // Store monthly depreciation
        tahun: year,
        created_at: generateDate(),
      },
    });
  }

  // Return the monthly values to be used in reports
  return {
    penyusutan_inventaris: {
      jenis_aset: "inventaris",
      nilai_aset_awal: bebanPenyusutanInventaris,
      persentase_penyusutan: persenBerkurangInventaris * 100, // Store percentage as a whole number
      nilai_penyusutan: totalPenyusutanInventaris,
      nilai_aset_akhir: nilaiAsetAkhirInventaris,
      penyusutan_bulan: penyusutanInventarisPerBulan, // Store monthly depreciation
      tahun: year,
      created_at: generateDate(),
    },
    penyusutan_gedung: {
      jenis_aset: "gedung",
      nilai_aset_awal: bebanPenyusutanGedung,
      persentase_penyusutan: persenBertambahGedung * 100, // Store percentage as a whole number
      nilai_penyusutan: totalPenyusutanGedung,
      nilai_aset_akhir: nilaiAsetAkhirGedung,
      penyusutan_bulan: penyusutanGedungPerBulan, // Store monthly depreciation
      tahun: year,
      created_at: generateDate(),
    },
  };
};

export default { calculateDepreciation };
