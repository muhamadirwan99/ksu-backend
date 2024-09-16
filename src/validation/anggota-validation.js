import Joi from "joi";

const addAnggotaValidation = Joi.object({
  nm_anggota: Joi.string().max(100).required(),
  alamat: Joi.string().max(255).required(),
  no_wa: Joi.string().max(20).required(),
  limit_pinjaman: Joi.number().required(),
  pinjaman: Joi.number().optional(),
});

const getAnggotaValidation = Joi.object({
  id_anggota: Joi.string().max(8).required(),
});

const updateAnggotaValidation = Joi.object({
  id_anggota: Joi.string().max(8).required(),
  nm_anggota: Joi.string().max(100).optional(),
  alamat: Joi.string().max(255).optional(),
  no_wa: Joi.string().max(20).optional(),
  limit_pinjaman: Joi.number().optional(),
  pinjaman: Joi.number().optional(),
});

const searchAnggotaValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(100).default(10),
  nm_anggota: Joi.string().max(100).optional(),
  sort_by: Joi.array().optional(),
  sort_order: Joi.array().optional(),
});

export {
  addAnggotaValidation,
  getAnggotaValidation,
  updateAnggotaValidation,
  searchAnggotaValidation,
};
