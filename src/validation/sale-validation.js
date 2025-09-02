import Joi from "joi";

const addSaleValidation = Joi.object({
  tg_penjualan: Joi.string().required(),
  jumlah: Joi.number().required(),
  total_nilai_beli: Joi.number().required(),
  total_nilai_jual: Joi.number().required(),
  id_anggota: Joi.string().max(8),
  nm_anggota: Joi.string().max(100),
  jenis_pembayaran: Joi.string().max(100).required(),
  username: Joi.string().max(100).required(),
  keterangan: Joi.string().max(255).optional(),
  details: Joi.array().items(
    Joi.object({
      id_product: Joi.string().max(100).required(),
      nm_divisi: Joi.string().max(100).required(),
      nm_produk: Joi.string().max(100).required(),
      harga: Joi.number().required(),
      jumlah: Joi.number().required(),
      diskon: Joi.number().required(),
      total: Joi.number().required(),
    })
  ),
});

const getDetailSaleValidation = Joi.object({
  id_penjualan: Joi.string().max(20).required(),
});

const searchSaleValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(10000).default(10),
  id_anggota: Joi.string().max(8).optional(),
  keterangan: Joi.string().optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export { addSaleValidation, getDetailSaleValidation, searchSaleValidation };
