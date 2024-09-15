import Joi from "joi";

const addProductValidation = Joi.object({
    kd_product: Joi.string().max(100).required(),
    nm_product: Joi.string().max(100).required(),
    kd_divisi: Joi.string().max(10).required(),
    kd_supplier: Joi.string().max(10).required(),
    harga_jual: Joi.number().required(),
    harga_beli: Joi.number().required(),
    status_product: Joi.boolean().required(),
    jumlah: Joi.number().required(),
    keterangan: Joi.string().max(255).optional()
});

const getProductValidation = Joi.object({
    kd_product: Joi.string().max(100).required(),
});

const updateProductValidation = Joi.object({
    kd_product: Joi.string().max(100).required(),
    nm_product: Joi.string().max(100).optional(),
    kd_divisi: Joi.string().max(10).optional(),
    kd_supplier: Joi.string().max(10).optional(),
    harga_jual: Joi.number().optional(),
    harga_beli: Joi.number().optional(),
    status_product: Joi.boolean().optional(),
    jumlah: Joi.number().optional(),
    keterangan: Joi.string().max(255).optional()
})

const searchProductValidation = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10),
    nm_product: Joi.string().max(100).optional(),
    sort_by: Joi.array().optional(),
    sort_order: Joi.array().optional()
})

export {
    addProductValidation,
    getProductValidation,
    updateProductValidation,
    searchProductValidation
}
