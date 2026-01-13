import { prismaClient } from "../../application/database.js";
import { logger } from "../../application/logging.js";

async function hasilUsahaWaserda(tahun) {
  // Ambil total penjualan dan pembelian tiap bulan (Januari - Desember) untuk tahun target
  // Menggunakan Date.UTC untuk konsistensi dengan lap-hasil-usaha.js
  const dataPerBulan = await Promise.all(
    Array.from({ length: 12 }, async (_, index) => {
      // Gunakan UTC untuk memastikan konsistensi dengan lap-hasil-usaha
      const bulanAwal = new Date(Date.UTC(tahun, index, 1)); // Awal bulan
      const bulanAkhir = new Date(Date.UTC(tahun, index + 1, 1)); // Awal bulan berikutnya

      // Hitung bulan sebelumnya untuk persediaan awal
      let bulanSebelumnya, akhirBulanSebelumnya;
      if (index === 0) {
        // Januari: ambil Desember tahun lalu
        bulanSebelumnya = new Date(Date.UTC(tahun - 1, 11, 1));
        akhirBulanSebelumnya = new Date(Date.UTC(tahun, 0, 1));
      } else {
        bulanSebelumnya = new Date(Date.UTC(tahun, index - 1, 1));
        akhirBulanSebelumnya = new Date(Date.UTC(tahun, index, 1));
      }

      // Ambil data penjualan bulan ini (semua jenis pembayaran)
      const penjualan = await prismaClient.penjualan.aggregate({
        where: {
          created_at: {
            gte: bulanAwal,
            lt: bulanAkhir,
          },
        },
        _sum: {
          total_nilai_jual: true,
        },
      });

      // Ambil data pembelian bulan ini (HANYA tunai dan kredit, seperti di lap-hasil-usaha.js)
      const pembelianTunai = await prismaClient.pembelian.aggregate({
        where: {
          created_at: {
            gte: bulanAwal,
            lt: bulanAkhir,
          },
          jenis_pembayaran: "tunai",
        },
        _sum: {
          total_harga_beli: true,
        },
      });

      const pembelianKredit = await prismaClient.pembelian.aggregate({
        where: {
          created_at: {
            gte: bulanAwal,
            lt: bulanAkhir,
          },
          jenis_pembayaran: "kredit",
        },
        _sum: {
          total_harga_beli: true,
        },
      });

      // Ambil data pembelian bulan lalu (untuk persediaan awal)
      const pembelianTunaiBulanLalu = await prismaClient.pembelian.aggregate({
        where: {
          created_at: {
            gte: bulanSebelumnya,
            lt: akhirBulanSebelumnya,
          },
          jenis_pembayaran: "tunai",
        },
        _sum: {
          total_harga_beli: true,
        },
      });

      const pembelianKreditBulanLalu = await prismaClient.pembelian.aggregate({
        where: {
          created_at: {
            gte: bulanSebelumnya,
            lt: akhirBulanSebelumnya,
          },
          jenis_pembayaran: "kredit",
        },
        _sum: {
          total_harga_beli: true,
        },
      });

      // Ambil data retur bulan ini
      const retur = await prismaClient.retur.aggregate({
        where: {
          created_at: {
            gte: bulanAwal,
            lt: bulanAkhir,
          },
        },
        _sum: {
          total_nilai_beli: true,
        },
      });

      return {
        penjualan,
        pembelianTunai,
        pembelianKredit,
        pembelianTunaiBulanLalu,
        pembelianKreditBulanLalu,
        retur,
      };
    })
  );

  // Format hasil penjualan per bulan dengan hasil usaha kotor
  // Menggunakan rumus PERSIS SAMA dengan lap-hasil-usaha.js (line 336-348):
  // persediaanAwal = totalLastMonthCashPurchase + totalLastMonthCreditPurchase
  // netPurchaseCurrent = totalCurrentMonthCashPurchase + totalCurrentMonthCreditPurchase - returCurrent
  // readyToSellCurrent = persediaanAwal + netPurchaseCurrent
  // totalSalesCurrent = readyToSellCurrent - (totalCurrentMonthCashPurchase + totalCurrentMonthCreditPurchase)
  // grossProfitCurrent = totalCurrentMonthSale - totalSalesCurrent
  return dataPerBulan.map((data, index) => {
    const totalNilaiJual =
      parseFloat(data.penjualan._sum.total_nilai_jual) || 0;

    // Hitung total pembelian bulan ini (tunai + kredit) seperti di lap-hasil-usaha.js
    const totalCurrentMonthCashPurchase =
      parseFloat(data.pembelianTunai._sum.total_harga_beli) || 0;
    const totalCurrentMonthCreditPurchase =
      parseFloat(data.pembelianKredit._sum.total_harga_beli) || 0;
    const pembelianBulanIni =
      totalCurrentMonthCashPurchase + totalCurrentMonthCreditPurchase;

    // Hitung persediaan awal (pembelian bulan lalu: tunai + kredit)
    const totalLastMonthCashPurchase =
      parseFloat(data.pembelianTunaiBulanLalu._sum.total_harga_beli) || 0;
    const totalLastMonthCreditPurchase =
      parseFloat(data.pembelianKreditBulanLalu._sum.total_harga_beli) || 0;
    const persediaanAwal =
      totalLastMonthCashPurchase + totalLastMonthCreditPurchase;

    const returBulanIni = parseFloat(data.retur._sum.total_nilai_beli) || 0;

    // Rumus PERSIS dari lap-hasil-usaha.js (line 336-348)
    const netPurchaseCurrent = pembelianBulanIni - returBulanIni;
    const readyToSellCurrent = persediaanAwal + netPurchaseCurrent;
    const totalSalesCurrent = readyToSellCurrent - pembelianBulanIni;
    const hasilUsahaKotor = totalNilaiJual - totalSalesCurrent;

    return {
      bulan: new Date(tahun, index, 1).toLocaleString("id-ID", {
        month: "long",
      }),
      total_nilai_jual: hasilUsahaKotor,
    };
  });
}

async function returPembelian(tahun) {
  // Ambil total retur tiap bulan (Januari - Desember) untuk tahun target
  const returPerBulan = await Promise.all(
    Array.from({ length: 12 }, (_, index) => {
      const bulanAwal = new Date(tahun, index, 1); // Awal bulan
      const bulanAkhir = new Date(tahun, index + 1, 1); // Awal bulan berikutnya

      return prismaClient.retur.aggregate({
        where: {
          created_at: {
            gte: bulanAwal,
            lt: bulanAkhir,
          },
        },
        _sum: {
          total_nilai_beli: true,
        },
      });
    })
  );

  // Format hasil retur per bulan
  // Kembalikan response
  return returPerBulan.map((retur, index) => ({
    bulan: new Date(tahun, index, 1).toLocaleString("id-ID", {
      month: "long",
    }),
    total_nilai_beli: parseFloat(retur._sum.total_nilai_beli) || 0,
  }));
}

async function getCashInOutPerBulan(tahun, id_detail) {
  try {
    const cashInOutPerBulan = await Promise.all(
      Array.from({ length: 12 }, async (_, index) => {
        const bulanAwal = new Date(tahun, index, 1, 0, 0, 0); // 1st day of the month
        const bulanAkhir = new Date(tahun, index + 1, 1, 0, 0, 0); // 1st day of the next month

        const result = await prismaClient.cashInOut.aggregate({
          where: {
            tg_transaksi: {
              gte: bulanAwal,
              lt: bulanAkhir,
            },
            id_detail: id_detail,
          },
          _sum: { nominal: true },
        });

        return parseFloat(result?._sum?.nominal) || 0;
      })
    );

    // Format hasil cash in out per bulan
    return cashInOutPerBulan.map((nominal, index) => ({
      bulan: new Date(tahun, index, 1).toLocaleString("id-ID", {
        month: "long",
      }),
      nominal,
    }));
  } catch (error) {
    logger.error(`Error fetching cashInOut ${id_detail}:`, error);
    throw new Error(`Gagal mengambil data cashInOut ${id_detail}.`);
  }
}

async function getPenyusutanPerBulan(tahun, jenisAsset) {
  try {
    const penyusutanPerBulan = await Promise.all(
      Array.from({ length: 12 }, async (_, index) => {
        const result = await prismaClient.penyusutanAset.aggregate({
          where: {
            jenis_aset: jenisAsset,
          },
          _sum: { penyusutan_bulan: true },
        });

        return parseFloat(result?._sum?.penyusutan_bulan) || 0;
      })
    );

    // Format hasil cash in out per bulan
    return penyusutanPerBulan.map((nominal, index) => ({
      bulan: new Date(tahun, index, 1).toLocaleString("id-ID", {
        month: "long",
      }),
      nominal,
    }));
  } catch (error) {
    logger.error(`Error fetching penyusutan ${jenisAsset}:`, error);
    throw new Error(`Gagal mengambil data penyusutan ${jenisAsset}.`);
  }
}

async function laporanPendapatan(tahun) {
  const hasilUsahaWaserdaResult = await hasilUsahaWaserda(tahun);
  const returPembelianResult = await returPembelian(tahun);
  const pendapatanLainlainResult = await getCashInOutPerBulan(tahun, 4);

  // Jumlahkan total penjualan, retur, dan pendapatan lain-lain per bulan
  const totalPendapatanPerBulan = hasilUsahaWaserdaResult.map(
    (hasilUsaha, index) => ({
      bulan: hasilUsaha.bulan,
      total_pendapatan:
        hasilUsaha.total_nilai_jual -
        returPembelianResult[index].total_nilai_beli +
        pendapatanLainlainResult[index].nominal,
    })
  );

  // Jumlahkan hasil usaha kotor dari bulan Januari - Desember (BUKAN total_nilai_jual!)
  const totalHasilUsahaWaserda = hasilUsahaWaserdaResult.reduce(
    (acc, curr) => acc + curr.total_nilai_jual,
    0
  );

  // Jumlahkan retur pembelian dari bulan Januari - Desember
  const totalReturPembelian = returPembelianResult.reduce(
    (acc, curr) => acc + curr.total_nilai_beli,
    0
  );

  // Jumlahkan pendapatan lain-lain dari bulan Januari - Desember
  const totalPendapatanLainlain = pendapatanLainlainResult.reduce(
    (acc, curr) => acc + curr.nominal,
    0
  );

  // Totalkan totalhasilusaha, totalretur, dan totalpendapatanlainlain
  const totalPendapatan =
    totalHasilUsahaWaserda - totalReturPembelian + totalPendapatanLainlain;

  return {
    hasil_usaha_waserda: {
      jumlah: totalHasilUsahaWaserda,
      data: hasilUsahaWaserdaResult,
    },
    retur_pembelian: {
      jumlah: totalReturPembelian,
      data: returPembelianResult,
    },
    pendapatan_lainlain: {
      jumlah: totalPendapatanLainlain,
      data: pendapatanLainlainResult,
    },
    total_pendapatan_per_bulan: {
      jumlah: totalPendapatan,
      data: totalPendapatanPerBulan,
    },
  };
}

// Pengeluaran
async function laporanPengeluaran(tahun) {
  const bebanGajiResult = await getCashInOutPerBulan(tahun, 5);
  const totalBebanGaji = bebanGajiResult.reduce(
    (acc, curr) => acc + curr.nominal,
    0
  );

  const uangMakanResult = await getCashInOutPerBulan(tahun, 6);
  const totalUangMakan = uangMakanResult.reduce(
    (acc, curr) => acc + curr.nominal,
    0
  );

  const thrResult = await getCashInOutPerBulan(tahun, 7);
  const totalThr = thrResult.reduce((acc, curr) => acc + curr.nominal, 0);

  const bebanAdmUmumResult = await getCashInOutPerBulan(tahun, 8);
  const totalBebanAdmUmum = bebanAdmUmumResult.reduce(
    (acc, curr) => acc + curr.nominal,
    0
  );

  const bebanPerlengkapanResult = await getCashInOutPerBulan(tahun, 9);
  const totalBebanPerlengkapan = bebanPerlengkapanResult.reduce(
    (acc, curr) => acc + curr.nominal,
    0
  );

  const bebanPenyusutanInventarisResult = await getPenyusutanPerBulan(
    tahun,
    "inventaris"
  );
  const totalBebanPenyusutanInventaris = bebanPenyusutanInventarisResult.reduce(
    (acc, curr) => acc + curr.nominal,
    0
  );

  const bebanPenyusutanGedungResult = await getPenyusutanPerBulan(
    tahun,
    "gedung"
  );
  const totalBebanPenyusutanGedung = bebanPenyusutanGedungResult.reduce(
    (acc, curr) => acc + curr.nominal,
    0
  );

  const pemeliharaanInventarisResult = await getCashInOutPerBulan(tahun, 10);
  const totalPemeliharaanInventaris = pemeliharaanInventarisResult.reduce(
    (acc, curr) => acc + curr.nominal,
    0
  );

  const pemeliharaanGedungResult = await getCashInOutPerBulan(tahun, 11);
  const totalPemeliharaanGedung = pemeliharaanGedungResult.reduce(
    (acc, curr) => acc + curr.nominal,
    0
  );

  // Totalkan total pengeluaran perbulan
  const totalPengeluaranPerBulan = bebanGajiResult.map((bebanGaji, index) => ({
    bulan: bebanGaji.bulan,
    total_pengeluaran:
      bebanGaji.nominal +
      uangMakanResult[index].nominal +
      thrResult[index].nominal +
      bebanAdmUmumResult[index].nominal +
      bebanPerlengkapanResult[index].nominal +
      bebanPenyusutanInventarisResult[index].nominal +
      bebanPenyusutanGedungResult[index].nominal +
      pemeliharaanInventarisResult[index].nominal +
      pemeliharaanGedungResult[index].nominal,
  }));

  // Totalkan total pengeluaran
  const totalPengeluaran = totalPengeluaranPerBulan.reduce(
    (acc, curr) => acc + curr.total_pengeluaran,
    0
  );

  return {
    beban_gaji: {
      jumlah: totalBebanGaji,
      data: bebanGajiResult,
    },
    uang_makan: {
      jumlah: totalUangMakan,
      data: uangMakanResult,
    },
    thr: {
      jumlah: totalThr,
      data: thrResult,
    },
    beban_adm_umum: {
      jumlah: totalBebanAdmUmum,
      data: bebanAdmUmumResult,
    },
    beban_perlengkapan: {
      jumlah: totalBebanPerlengkapan,
      data: bebanPerlengkapanResult,
    },
    beban_penyusutan_inventaris: {
      jumlah: totalBebanPenyusutanInventaris,
      data: bebanPenyusutanInventarisResult,
    },
    beban_penyusutan_gedung: {
      jumlah: totalBebanPenyusutanGedung,
      data: bebanPenyusutanGedungResult,
    },
    pemeliharaan_inventaris: {
      jumlah: totalPemeliharaanInventaris,
      data: pemeliharaanInventarisResult,
    },
    pemeliharaan_gedung: {
      jumlah: totalPemeliharaanGedung,
      data: pemeliharaanGedungResult,
    },
    total_pengeluaraan_per_bulan: {
      jumlah: totalPengeluaran,
      data: totalPengeluaranPerBulan,
    },
  };
}

export { laporanPendapatan, laporanPengeluaran };
