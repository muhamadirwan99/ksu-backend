import Joi from "joi";

const roleValidation = Joi.object({
    role_name: Joi.string().max(100).required(),
})

const getRoleValidation = Joi.object({
    role_id: Joi.number().required()
});

const updateRoleValidation = Joi.object({
    role_id: Joi.number().required(),
    role_name: Joi.string().max(100).required(),
})

const searchRoleValidation = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10),
    role_name: Joi.string().optional(),
})

export {
    roleValidation,
    getRoleValidation,
    searchRoleValidation,
    updateRoleValidation
}
