import Joi from "joi";

const roleValidation = Joi.object({
  role_name: Joi.string().max(100).required(),
  sts_anggota: Joi.boolean().optional(),
  sts_pembayaran_pinjaman: Joi.boolean().optional(),
  sts_kartu_piutang: Joi.boolean().optional(),
  sts_supplier: Joi.boolean().optional(),
  sts_divisi: Joi.boolean().optional(),
  sts_produk: Joi.boolean().optional(),
  sts_pembelian: Joi.boolean().optional(),
  sts_penjualan: Joi.boolean().optional(),
  sts_retur: Joi.boolean().optional(),
  sts_pembayaran_hutang: Joi.boolean().optional(),
  sts_estimasi: Joi.boolean().optional(),
  sts_stocktake_harian: Joi.boolean().optional(),
  sts_stock_opname: Joi.boolean().optional(),
  sts_cash_in_cash_out: Joi.boolean().optional(),
  sts_cash_movement: Joi.boolean().optional(),
  sts_user: Joi.boolean().optional(),
  sts_role: Joi.boolean().optional(),
  sts_cetak_label: Joi.boolean().optional(),
  sts_cetak_barcode: Joi.boolean().optional(),
  sts_awal_akhir_hari: Joi.boolean().optional(),
  sts_dashboard: Joi.boolean().optional(),
  sts_laporan: Joi.boolean().optional(),
});

const getRoleValidation = Joi.object({
  id_role: Joi.string().max(10).required(),
});

const updateRoleValidation = Joi.object({
  id_role: Joi.string().max(10).required(),
  role_name: Joi.string().max(100).optional(),
  sts_anggota: Joi.boolean().optional(),
  sts_pembayaran_pinjaman: Joi.boolean().optional(),
  sts_kartu_piutang: Joi.boolean().optional(),
  sts_supplier: Joi.boolean().optional(),
  sts_divisi: Joi.boolean().optional(),
  sts_produk: Joi.boolean().optional(),
  sts_pembelian: Joi.boolean().optional(),
  sts_penjualan: Joi.boolean().optional(),
  sts_retur: Joi.boolean().optional(),
  sts_pembayaran_hutang: Joi.boolean().optional(),
  sts_estimasi: Joi.boolean().optional(),
  sts_stocktake_harian: Joi.boolean().optional(),
  sts_stock_opname: Joi.boolean().optional(),
  sts_cash_in_cash_out: Joi.boolean().optional(),
  sts_cash_movement: Joi.boolean().optional(),
  sts_user: Joi.boolean().optional(),
  sts_role: Joi.boolean().optional(),
  sts_cetak_label: Joi.boolean().optional(),
  sts_cetak_barcode: Joi.boolean().optional(),
  sts_awal_akhir_hari: Joi.boolean().optional(),
  sts_dashboard: Joi.boolean().optional(),
  sts_laporan: Joi.boolean().optional(),
});

const searchRoleValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(1000).default(10),
  role_name: Joi.string().optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export {
  roleValidation,
  getRoleValidation,
  searchRoleValidation,
  updateRoleValidation,
};
