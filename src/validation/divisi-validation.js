import Joi from "joi";

const addDivisiValidation = Joi.object({
  id_divisi: Joi.string().max(10).required(),
  nm_divisi: Joi.string().max(100).required(),
});

const getDivisiValidation = Joi.object({
  id_divisi: Joi.string().max(10).required(),
});

const searchDivisiValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(100).default(10),
  nm_divisi: Joi.string().optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export { addDivisiValidation, getDivisiValidation, searchDivisiValidation };
