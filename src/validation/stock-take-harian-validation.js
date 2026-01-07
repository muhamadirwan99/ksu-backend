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
  month: Joi.number().min(1).max(12).optional(),
  year: Joi.number().min(2000).max(3000).optional(),
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
  is_done_stocktake: Joi.boolean().optional(),
});

const getDailySOProductsValidation = Joi.object({
  tg_stocktake: Joi.string().required(),
  id_tutup_kasir: Joi.number().optional(),
});

const batchSaveDailySOValidation = Joi.object({
  tg_stocktake: Joi.string().required(),
  id_tutup_kasir: Joi.number().required(),
  username: Joi.string().max(100).required(),
  name: Joi.string().max(100).required(),
  products: Joi.array()
    .items(
      Joi.object({
        id_product: Joi.string().max(100).required(),
        nm_product: Joi.string().max(100).required(),
        stok_awal: Joi.number().required(),
        stok_akhir: Joi.number().required(),
        keterangan: Joi.string().optional().allow(""),
      })
    )
    .min(1)
    .required(),
});

const checkSOStatusValidation = Joi.object({
  tg_stocktake: Joi.string().required(),
});

export {
  addStockTakeValidation,
  searchStockTakeValidation,
  rekonStockTakeValidation,
  detailRekonStockTakeValidation,
  getDailySOProductsValidation,
  batchSaveDailySOValidation,
  checkSOStatusValidation,
};
