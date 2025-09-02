import Joi from "joi";

const addStockTakeValidation = Joi.object({
  tg_stocktake: Joi.string().required(),
  id_product: Joi.string().max(100).required(),
  nm_product: Joi.string().max(100).required(),
  stok_awal: Joi.number().required(),
  stok_akhir: Joi.number().required(),
  username: Joi.string().max(100).required(),
  name: Joi.string().max(100).required(),
});

const searchStockTakeValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(10000).default(10),
  is_selisih: Joi.boolean().optional(),
  nm_product: Joi.string().max(100).optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

const rekonStockTakeValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(10000).default(10),
});

const detailRekonStockTakeValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(10000).default(10),
  id_divisi: Joi.string().max(10).required(),
  is_selisih: Joi.boolean().optional(),
});

export {
  addStockTakeValidation,
  searchStockTakeValidation,
  rekonStockTakeValidation,
  detailRekonStockTakeValidation,
};
