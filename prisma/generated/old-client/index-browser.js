
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.19.1
 * Query Engine version: 69d742ee20b815d88e17e54db4a2a7a3b30324e3
 */
Prisma.prismaVersion = {
  client: "5.19.1",
  engine: "69d742ee20b815d88e17e54db4a2a7a3b30324e3"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  bagian: 'bagian',
  username: 'username',
  password: 'password',
  nama: 'nama',
  type: 'type',
  level: 'level'
};

exports.Prisma.AnggotaScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  nama: 'nama',
  alamat: 'alamat',
  telp: 'telp',
  kredit_limit: 'kredit_limit',
  kredit_pinjaman: 'kredit_pinjaman',
  status: 'status',
  created: 'created',
  modified: 'modified'
};

exports.Prisma.Anggota_kreditScalarFieldEnum = {
  id: 'id',
  id_anggota: 'id_anggota',
  id_transaksi: 'id_transaksi',
  ex_bukti: 'ex_bukti',
  tanggal: 'tanggal',
  debet: 'debet',
  kredit: 'kredit',
  keterangan: 'keterangan'
};

exports.Prisma.BagianScalarFieldEnum = {
  id: 'id',
  nama: 'nama'
};

exports.Prisma.BankScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  nama: 'nama',
  saldo: 'saldo'
};

exports.Prisma.Bank_mutasiScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  id_bank: 'id_bank',
  debet: 'debet',
  kredit: 'kredit',
  debet2: 'debet2',
  kredit2: 'kredit2',
  adm: 'adm',
  pajak: 'pajak',
  jasa: 'jasa',
  keterangan: 'keterangan'
};

exports.Prisma.BayarScalarFieldEnum = {
  id: 'id',
  nama: 'nama'
};

exports.Prisma.Beban_operasionalScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  keterangan: 'keterangan',
  jumlah: 'jumlah'
};

exports.Prisma.Cash_in_outScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  jenis: 'jenis',
  detail: 'detail',
  input: 'input',
  output: 'output',
  keterangan: 'keterangan'
};

exports.Prisma.Cash_jenisScalarFieldEnum = {
  id: 'id',
  parent: 'parent',
  nama: 'nama',
  nilai: 'nilai'
};

exports.Prisma.ConfigScalarFieldEnum = {
  id: 'id',
  nama: 'nama',
  alamat: 'alamat',
  telp: 'telp',
  bulat: 'bulat',
  versi: 'versi',
  shortcut: 'shortcut',
  modified: 'modified'
};

exports.Prisma.DanaScalarFieldEnum = {
  id: 'id',
  jenis: 'jenis',
  kode: 'kode',
  nama: 'nama',
  jumlah: 'jumlah'
};

exports.Prisma.Dana_testScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  nilai: 'nilai',
  nilai2: 'nilai2'
};

exports.Prisma.DivisiScalarFieldEnum = {
  id: 'id',
  jenis: 'jenis',
  kode: 'kode',
  nama: 'nama',
  created: 'created',
  modified: 'modified'
};

exports.Prisma.EstimasiScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  tanggal: 'tanggal',
  jumlah: 'jumlah',
  produk: 'produk',
  total_beli: 'total_beli',
  total_jual: 'total_jual',
  keterangan: 'keterangan',
  admin: 'admin',
  created: 'created',
  modified: 'modified'
};

exports.Prisma.Estimasi_itemScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  id_estimasi: 'id_estimasi',
  id_produk: 'id_produk',
  id_supplier: 'id_supplier',
  harga_beli: 'harga_beli',
  harga_jual: 'harga_jual',
  jumlah: 'jumlah'
};

exports.Prisma.InventarisScalarFieldEnum = {
  id: 'id',
  jenis: 'jenis',
  nama: 'nama',
  tanggal: 'tanggal',
  nilai: 'nilai',
  persen: 'persen',
  sisa_2023: 'sisa_2023',
  created: 'created',
  modified: 'modified'
};

exports.Prisma.Pelunasan_pembelianScalarFieldEnum = {
  id: 'id',
  id_supplier: 'id_supplier',
  id_transaksi: 'id_transaksi',
  tanggal: 'tanggal',
  jumlah: 'jumlah',
  keterangan: 'keterangan'
};

exports.Prisma.PemusnahanScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  jumlah: 'jumlah',
  jumlah_fix: 'jumlah_fix',
  jangka: 'jangka',
  keterangan: 'keterangan'
};

exports.Prisma.ProdukScalarFieldEnum = {
  id: 'id',
  divisi: 'divisi',
  supplier: 'supplier',
  kode: 'kode',
  nama: 'nama',
  harga_beli: 'harga_beli',
  harga_jual: 'harga_jual',
  jumlah: 'jumlah',
  diskon: 'diskon',
  keterangan: 'keterangan',
  status: 'status',
  created: 'created',
  modified: 'modified'
};

exports.Prisma.Produk_hargaScalarFieldEnum = {
  id: 'id',
  id_produk: 'id_produk',
  tanggal: 'tanggal',
  harga_beli: 'harga_beli',
  harga_jual: 'harga_jual'
};

exports.Prisma.RapbScalarFieldEnum = {
  no: 'no',
  tahun: 'tahun',
  hasil_usaha: 'hasil_usaha',
  jasa_bank: 'jasa_bank',
  pendapatan_lain: 'pendapatan_lain',
  beban_gaji: 'beban_gaji',
  uang_makan: 'uang_makan',
  thr_karyawan: 'thr_karyawan',
  tunjangan_pangan: 'tunjangan_pangan',
  beban_adm: 'beban_adm',
  beban_perlengkapan: 'beban_perlengkapan',
  tunjangan_kesehatan: 'tunjangan_kesehatan',
  peny_inventaris: 'peny_inventaris',
  peny_gedung: 'peny_gedung',
  pemeliharaan_inventaris: 'pemeliharaan_inventaris',
  pemeliharaan_gedung: 'pemeliharaan_gedung',
  beban_pensiun: 'beban_pensiun',
  kerugian_persediaan: 'kerugian_persediaan',
  sisa_hasil_usaha: 'sisa_hasil_usaha'
};

exports.Prisma.Saldo_tokoScalarFieldEnum = {
  id: 'id',
  jenis: 'jenis',
  id_transaksi: 'id_transaksi',
  tanggal: 'tanggal',
  debet: 'debet',
  kredit: 'kredit',
  saldo: 'saldo',
  keterangan: 'keterangan'
};

exports.Prisma.Shu_mutasiScalarFieldEnum = {
  id: 'id',
  tahun_shu: 'tahun_shu',
  tanggal: 'tanggal',
  debet: 'debet',
  kredit: 'kredit',
  keterangan: 'keterangan'
};

exports.Prisma.SupplierScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  nama: 'nama',
  alamat: 'alamat',
  pemilik: 'pemilik',
  kontak: 'kontak',
  kredit: 'kredit',
  created: 'created',
  modified: 'modified'
};

exports.Prisma.Supplier_kreditScalarFieldEnum = {
  id: 'id',
  id_supplier: 'id_supplier',
  id_transaksi: 'id_transaksi',
  ex_bukti: 'ex_bukti',
  tanggal: 'tanggal',
  debet: 'debet',
  kredit: 'kredit',
  keterangan: 'keterangan'
};

exports.Prisma.TransaksiScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  kode_ex: 'kode_ex',
  kode_2: 'kode_2',
  tanggal: 'tanggal',
  jenis: 'jenis',
  sumber: 'sumber',
  jumlah: 'jumlah',
  produk: 'produk',
  total_beli: 'total_beli',
  total_jual: 'total_jual',
  diskon_item: 'diskon_item',
  diskon_persen: 'diskon_persen',
  diskon_total: 'diskon_total',
  bayar: 'bayar',
  kredit: 'kredit',
  keterangan: 'keterangan',
  anggota: 'anggota',
  admin: 'admin',
  status: 'status',
  created: 'created',
  modified: 'modified'
};

exports.Prisma.Transaksi_itemScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  jenis: 'jenis',
  id_transaksi: 'id_transaksi',
  id_produk: 'id_produk',
  harga_beli: 'harga_beli',
  harga_jual: 'harga_jual',
  jumlah: 'jumlah',
  diskon: 'diskon'
};

exports.Prisma.Transaksi_jenisScalarFieldEnum = {
  id: 'id',
  nama: 'nama',
  tipe: 'tipe',
  fix: 'fix'
};

exports.Prisma.TujuanScalarFieldEnum = {
  id: 'id',
  nama: 'nama'
};

exports.Prisma.Tutup_kasirScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  shift: 'shift',
  kasir: 'kasir',
  tunai: 'tunai',
  bon: 'bon',
  struk: 'struk'
};

exports.Prisma.Utang_spScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  debet: 'debet',
  kredit: 'kredit',
  keterangan: 'keterangan'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  admin: 'admin',
  anggota: 'anggota',
  anggota_kredit: 'anggota_kredit',
  bagian: 'bagian',
  bank: 'bank',
  bank_mutasi: 'bank_mutasi',
  bayar: 'bayar',
  beban_operasional: 'beban_operasional',
  cash_in_out: 'cash_in_out',
  cash_jenis: 'cash_jenis',
  config: 'config',
  dana: 'dana',
  dana_test: 'dana_test',
  divisi: 'divisi',
  estimasi: 'estimasi',
  estimasi_item: 'estimasi_item',
  inventaris: 'inventaris',
  pelunasan_pembelian: 'pelunasan_pembelian',
  pemusnahan: 'pemusnahan',
  produk: 'produk',
  produk_harga: 'produk_harga',
  rapb: 'rapb',
  saldo_toko: 'saldo_toko',
  shu_mutasi: 'shu_mutasi',
  supplier: 'supplier',
  supplier_kredit: 'supplier_kredit',
  transaksi: 'transaksi',
  transaksi_item: 'transaksi_item',
  transaksi_jenis: 'transaksi_jenis',
  tujuan: 'tujuan',
  tutup_kasir: 'tutup_kasir',
  utang_sp: 'utang_sp'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
