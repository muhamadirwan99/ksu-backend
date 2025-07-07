import Joi from "joi";

const monthlyIncomeValidation = Joi.object({
  month: Joi.string().max(5).required(),
  year: Joi.string().max(5).required(),
});

const dateValidation = Joi.object({
  start_date: Joi.string().max(10).required(),
  end_date: Joi.string().max(10).required(),
  metode_pembayaran: Joi.string().max(20).optional(),
});

const yearlyIncomeValidation = Joi.object({
  year: Joi.string().max(5).required(),
});

export { monthlyIncomeValidation, yearlyIncomeValidation, dateValidation };
