import Joi from "joi";

const registerUserValidation = Joi.object({
  username: Joi.string().max(100).required(),
  password: Joi.string().max(100).required(),
  name: Joi.string().max(100).required(),
  id_role: Joi.string().max(10).required(),
});

const loginUserValidation = Joi.object({
  username: Joi.string().max(100).required(),
  password: Joi.string().max(100).required(),
});

const getUserValidation = Joi.string().max(100).required();

const updateUserValidation = Joi.object({
  username: Joi.string().max(100).required(),
  password: Joi.string().max(100).optional(),
  name: Joi.string().max(100).optional(),
  id_role: Joi.string().max(10).optional(),
});

const searchUserValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(100).default(10),
  username: Joi.string().optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export {
  registerUserValidation,
  loginUserValidation,
  getUserValidation,
  updateUserValidation,
  searchUserValidation,
};
