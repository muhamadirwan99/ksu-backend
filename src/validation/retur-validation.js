import Joi from "joi";

const addReturValidation = Joi.object({
  tg_retur: Joi.string().required(),
  id_pembelian: Joi.string().max(20).required(),
  id_supplier: Joi.string().max(8),
  nm_supplier: Joi.string().max(100),
  jumlah: Joi.number().required(),
  total_nilai_beli: Joi.number().required(),
  keterangan: Joi.string().max(255).optional(),
  details: Joi.array().items(
    Joi.object({
      nm_divisi: Joi.string().max(100).required(),
      id_product: Joi.string().max(100).required(),
      nm_produk: Joi.string().max(100).required(),
      harga_beli: Joi.number().required(),
      jumlah: Joi.number().required(),
      total_nilai_beli: Joi.number().required(),
    }),
  ),
});

const getDetailReturValidation = Joi.object({
  id_retur: Joi.string().max(20).required(),
});

const searchReturValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(1000).default(10),
  keterangan: Joi.string().optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export { addReturValidation, getDetailReturValidation, searchReturValidation };
