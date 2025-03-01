import Joi from "joi";

const pembayaranHutangAnggotaValidation = Joi.object({
  id_anggota: Joi.string().max(8).optional(),
  nominal_bayar: Joi.number().required(),
  tg_bayar: Joi.string().max(100).required(),
  keterangan: Joi.string().max(255).optional(),
});

const listHutangAnggotaValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(100).default(10),
  id_anggota: Joi.string().max(8).optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

const listPembayaranHutangAnggotaValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(100).default(10),
  id_anggota: Joi.string().max(8).optional(),
  nm_anggota: Joi.string().max(100).optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export {
  pembayaranHutangAnggotaValidation,
  listHutangAnggotaValidation,
  listPembayaranHutangAnggotaValidation,
};
