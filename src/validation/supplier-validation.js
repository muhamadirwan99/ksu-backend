import Joi from "joi";

const addSupplierValidation = Joi.object({
    kd_supplier: Joi.string().max(10).required(),
    nm_supplier: Joi.string().max(100).required(),
    nm_pemilik: Joi.string().max(100).required(),
    nm_pic: Joi.string().max(100).required(),
    no_wa: Joi.string().max(20).required(),
    alamat: Joi.string().max(255).required(),
})

const getSupplierValidation = Joi.object({
    kd_supplier: Joi.string().max(10).required(),
});

const updateSupplierValidation = Joi.object({
    kd_supplier: Joi.string().max(10).required(),
    nm_supplier: Joi.string().max(100).optional(),
    nm_pemilik: Joi.string().max(100).optional(),
    nm_pic: Joi.string().max(100).optional(),
    no_wa: Joi.string().max(20).optional(),
    alamat: Joi.string().max(255).optional(),
    hutang_dagang: Joi.number().optional(),
})

const searchSupplierValidation = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10),
    nm_supplier: Joi.string().optional(),
    sort_by: Joi.array().optional(),
    sort_order: Joi.array().optional()
})

export {
    addSupplierValidation,
    getSupplierValidation,
    updateSupplierValidation,
    searchSupplierValidation

}
