import Joi from "joi";

const monthlyIncomeValidation = Joi.object({
  month: Joi.string().max(5).required(),
  year: Joi.string().max(5).required(),
});

export { monthlyIncomeValidation };
