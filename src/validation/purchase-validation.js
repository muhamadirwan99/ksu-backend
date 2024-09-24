import Joi from "joi";

const addPurchaseValidation = Joi.object({
  tg_pembelian: Joi.string().required(),
  id_supplier: Joi.string().max(10).required(),
  nm_supplier: Joi.string().max(255).required(),
  jumlah: Joi.number().required(),
  total_harga_beli: Joi.number().required(),
  total_harga_jual: Joi.number().required(),
  jenis_pembayaran: Joi.string().max(100).required(),
  keterangan: Joi.string().max(255).optional(),
  details: Joi.array().items(
    Joi.object({
      id_product: Joi.string().max(100).required(),
      nm_divisi: Joi.string().max(100).required(),
      nm_produk: Joi.string().max(100).required(),
      harga_beli: Joi.number().required(),
      harga_jual: Joi.number().required(),
      jumlah: Joi.number().required(),
      diskon: Joi.number().required(),
      ppn: Joi.number().required(),
      total_nilai_beli: Joi.number().required(),
      total_nilai_jual: Joi.number().required(),
    }),
  ),
});

const getDetailPurchaseValidation = Joi.object({
  id_pembelian: Joi.string().max(20).required(),
});

const searchPurchaseValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(100).default(10),
  keterangan: Joi.string().optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export {
  addPurchaseValidation,
  getDetailPurchaseValidation,
  searchPurchaseValidation,
};
