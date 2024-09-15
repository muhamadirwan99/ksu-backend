import Joi from "joi";

const roleValidation = Joi.object({
  role_name: Joi.string().max(100).required(),
});

const getRoleValidation = Joi.object({
  id_role: Joi.string().max(10).required(),
});

const updateRoleValidation = Joi.object({
  id_role: Joi.string().max(10).required(),
  role_name: Joi.string().max(100).required(),
});

const searchRoleValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(100).default(10),
  role_name: Joi.string().optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export {
  roleValidation,
  getRoleValidation,
  searchRoleValidation,
  updateRoleValidation,
};
