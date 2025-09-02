import Joi from "joi";

const pembayaranHutangDagangValidation = Joi.object({
  id_hutang_dagang: Joi.string().max(100).required(),
  nominal_bayar: Joi.number().required(),
  tg_bayar: Joi.string().max(100).required(),
  keterangan: Joi.string().max(255).optional(),
});

const listHutangDagangValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(10000).default(10),
  id_supplier: Joi.string().max(8).optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

const listPembayaranHutangDagangValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(10000).default(10),
  id_supplier: Joi.string().max(8).optional(),
  nm_supplier: Joi.string().max(100).optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export {
  pembayaranHutangDagangValidation,
  listHutangDagangValidation,
  listPembayaranHutangDagangValidation,
};
