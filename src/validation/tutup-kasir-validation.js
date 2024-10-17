import Joi from "joi";

const getTotalPenjualanValidation = Joi.object({
  tg_tutup_kasir: Joi.string().max(100).required(),
});

const createTutupKasirValidation = Joi.object({
  tg_tutup_kasir: Joi.string().max(100).required(),
  shift: Joi.string().max(20).required(),
  nama_kasir: Joi.string().max(100).required(),
  username: Joi.string().max(100).required(),
  tunai: Joi.number().required(),
  qris: Joi.number().required(),
  kredit: Joi.number().required(),
  total: Joi.number().required(),
  uang_tunai: Joi.number().required(),
  total_nilai_jual: Joi.number().required(),
  total_nilai_beli: Joi.number().required(),
  total_keuntungan: Joi.number().required(),
});

const updateTutupKasirValidation = Joi.object({
  id_tutup_kasir: Joi.number().required(),
  nama_kasir: Joi.string().max(100).optional(),
  username: Joi.string().max(100).optional(),
  sesi: Joi.string().max(20).optional(),
  uang_tunai: Joi.number().optional(),
});

const getListTutupKasirValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(1000).default(10),
  username: Joi.string().optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export {
  getTotalPenjualanValidation,
  createTutupKasirValidation,
  getListTutupKasirValidation,
  updateTutupKasirValidation,
};
