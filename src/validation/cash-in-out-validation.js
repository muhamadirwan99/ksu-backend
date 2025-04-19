import Joi from "joi";

// Cash In Out API
const addCashInOutValidation = Joi.object({
  tg_transaksi: Joi.string().required(),
  id_cash: Joi.string().max(10).required(),
  id_jenis: Joi.number().required(),
  id_detail: Joi.number().required(),
  nominal: Joi.number().required(),
  keterangan: Joi.string().max(255).optional(),
});

const getDetailCashInOutValidation = Joi.object({
  id_cash_in_out: Joi.string().max(3).required(),
});

const updateCashInOutValidation = Joi.object({
  id_cash_in_out: Joi.string().max(3).required(),
  tg_transaksi: Joi.string().required(),
  id_cash: Joi.string().max(10).optional(),
  id_jenis: Joi.number().optional(),
  id_detail: Joi.number().optional(),
  nominal: Joi.number().optional(),
  keterangan: Joi.string().max(255).optional(),
});

const searchCashInOutValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(1000).default(10),
  id_cash: Joi.string().max(10).optional(),
  keterangan: Joi.string().optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

// Reference Cash In Out API
const addCashValidation = Joi.object({
  id_cash: Joi.string().max(10).required(),
  nm_cash: Joi.string().max(100).required(),
});

const updateCashValidation = Joi.object({
  id_cash: Joi.string().max(10).required(),
  nm_cash: Joi.string().max(100).optional(),
});

const removeCashValidation = Joi.object({
  id_cash: Joi.string().max(10).required(),
});

// Reference Jenis Cash In Out API
const addJenisCashValidation = Joi.object({
  id_cash: Joi.string().max(10).required(),
  nm_jenis: Joi.string().max(100).required(),
});

const updateJenisCashValidation = Joi.object({
  id_jenis: Joi.number().required(),
  id_cash: Joi.string().max(10).optional(),
  nm_jenis: Joi.string().max(100).optional(),
});

const removeJenisCashValidation = Joi.object({
  id_jenis: Joi.number().required(),
});

const listJenisCashValidation = Joi.object({
  id_cash: Joi.string().max(10).required(),
});

// Reference Detail Cash In Out API
const addDetailCashValidation = Joi.object({
  id_cash: Joi.string().max(10).required(),
  id_jenis: Joi.number().required(),
  nm_detail: Joi.string().max(100).required(),
});

const updateDetailCashValidation = Joi.object({
  id_detail: Joi.number().required(),
  id_cash: Joi.string().max(10).optional(),
  id_jenis: Joi.number().optional(),
  nm_detail: Joi.string().max(100).optional(),
});

const removeDetailCashValidation = Joi.object({
  id_detail: Joi.number().required(),
});

const listDetailCashValidation = Joi.object({
  id_jenis: Joi.number().required(),
  id_cash: Joi.string().max(10).required(),
});

export {
  addCashInOutValidation,
  getDetailCashInOutValidation,
  updateCashInOutValidation,
  searchCashInOutValidation,
  addCashValidation,
  updateCashValidation,
  removeCashValidation,
  addJenisCashValidation,
  updateJenisCashValidation,
  removeJenisCashValidation,
  listJenisCashValidation,
  addDetailCashValidation,
  updateDetailCashValidation,
  removeDetailCashValidation,
  listDetailCashValidation,
};
