/**
 * Stocktake V2 Validation Schema
 * Comprehensive validation for advanced inventory counting system
 */

import Joi from "joi";

// ========================================
// VALIDATION: Create Stocktake Session
// ========================================
const createStocktakeSessionValidation = Joi.object({
  stocktake_type: Joi.string().valid("HARIAN", "BULANAN").required().messages({
    "any.required": "Tipe stocktake wajib diisi",
    "any.only": "Tipe stocktake hanya boleh HARIAN atau BULANAN",
  }),
  id_tutup_kasir: Joi.number().integer().positive().optional().messages({
    "number.base": "ID Tutup Kasir harus berupa angka",
    "number.positive": "ID Tutup Kasir harus positif",
  }),
  notes_kasir: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Catatan kasir maksimal 500 karakter",
  }),
});

// ========================================
// VALIDATION: Update Stocktake Item (Blind Count by Kasir)
// ========================================
const updateStocktakeItemValidation = Joi.object({
  id_stocktake_item: Joi.number().integer().positive().required().messages({
    "any.required": "ID Stocktake Item wajib diisi",
    "number.base": "ID Stocktake Item harus berupa angka",
  }),
  stok_fisik: Joi.number().integer().min(0).required().messages({
    "any.required": "Stok fisik wajib diisi",
    "number.base": "Stok fisik harus berupa angka",
    "number.min": "Stok fisik tidak boleh negatif",
  }),
  notes: Joi.string().max(255).optional().allow("").messages({
    "string.max": "Catatan maksimal 255 karakter",
  }),
});

// ========================================
// VALIDATION: Batch Update Multiple Items
// ========================================
const batchUpdateStocktakeItemsValidation = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        id_stocktake_item: Joi.number().integer().positive().required(),
        stok_fisik: Joi.number().integer().min(0).required(),
        notes: Joi.string().max(255).optional().allow(""),
      })
    )
    .min(1)
    .max(100) // Limit batch size
    .required()
    .messages({
      "array.min": "Minimal harus ada 1 item",
      "array.max": "Maksimal 100 item per batch",
      "any.required": "Items wajib diisi",
    }),
});

// ========================================
// VALIDATION: Submit Stocktake (Kasir -> Reviewer)
// ========================================
const submitStocktakeValidation = Joi.object({
  id_stocktake_session: Joi.string()
    .pattern(/^ST-\d{8}-\d{6}$/)
    .required()
    .messages({
      "any.required": "ID Stocktake Session wajib diisi",
      "string.pattern.base":
        "Format ID Stocktake Session tidak valid (harus ST-YYYYMMDD-HHMMSS)",
    }),
  notes_kasir: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Catatan kasir maksimal 500 karakter",
  }),
});

// ========================================
// VALIDATION: Review Stocktake (Manajer)
// ========================================
const reviewStocktakeValidation = Joi.object({
  id_stocktake_session: Joi.string()
    .pattern(/^ST-\d{8}-\d{6}$/)
    .required()
    .messages({
      "any.required": "ID Stocktake Session wajib diisi",
      "string.pattern.base": "Format ID Stocktake Session tidak valid",
    }),
  action: Joi.string()
    .valid("APPROVE", "REQUEST_REVISION")
    .required()
    .messages({
      "any.required": "Action wajib diisi",
      "any.only": "Action hanya boleh APPROVE atau REQUEST_REVISION",
    }),
  notes_reviewer: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Catatan reviewer maksimal 500 karakter",
  }),
  // Untuk request revision, bisa specify item mana yang perlu dihitung ulang
  revision_items: Joi.when("action", {
    is: "REQUEST_REVISION",
    then: Joi.array()
      .items(
        Joi.object({
          id_stocktake_item: Joi.number().integer().positive().required(),
          flag_reason: Joi.string().max(255).required(),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "Minimal harus ada 1 item untuk revision",
        "any.required":
          "Revision items wajib diisi jika action adalah REQUEST_REVISION",
      }),
    otherwise: Joi.array()
      .items(
        Joi.object({
          id_stocktake_item: Joi.number().integer().positive().required(),
          flag_reason: Joi.string().max(255).required(),
        })
      )
      .optional(),
  }),
});

// ========================================
// VALIDATION: Finalize Stocktake (Update Stock Master)
// ========================================
const finalizeStocktakeValidation = Joi.object({
  id_stocktake_session: Joi.string()
    .pattern(/^ST-\d{8}-\d{6}$/)
    .required()
    .messages({
      "any.required": "ID Stocktake Session wajib diisi",
      "string.pattern.base": "Format ID Stocktake Session tidak valid",
    }),
  confirmation: Joi.boolean().valid(true).required().messages({
    "any.required": "Konfirmasi finalize wajib diisi",
    "any.only": "Konfirmasi harus true untuk finalize",
  }),
  notes_reviewer: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Catatan reviewer maksimal 500 karakter",
  }),
});

// ========================================
// VALIDATION: Cancel Stocktake
// ========================================
const cancelStocktakeValidation = Joi.object({
  id_stocktake_session: Joi.string()
    .pattern(/^ST-\d{8}-\d{6}$/)
    .required()
    .messages({
      "any.required": "ID Stocktake Session wajib diisi",
      "string.pattern.base": "Format ID Stocktake Session tidak valid",
    }),
  cancel_reason: Joi.string().min(10).max(500).required().messages({
    "any.required": "Alasan pembatalan wajib diisi",
    "string.min": "Alasan pembatalan minimal 10 karakter",
    "string.max": "Alasan pembatalan maksimal 500 karakter",
  }),
});

// ========================================
// VALIDATION: High Risk Product Management
// ========================================
const addHighRiskProductValidation = Joi.object({
  id_product: Joi.string().max(100).required().messages({
    "any.required": "ID Product wajib diisi",
    "string.max": "ID Product maksimal 100 karakter",
  }),
  category: Joi.string().max(100).optional().allow("").messages({
    "string.max": "Category maksimal 100 karakter",
  }),
  reason: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Reason maksimal 500 karakter",
  }),
});

const updateHighRiskProductValidation = Joi.object({
  id_high_risk: Joi.number().integer().positive().required().messages({
    "any.required": "ID High Risk wajib diisi",
    "number.base": "ID High Risk harus berupa angka",
  }),
  category: Joi.string().max(100).optional().allow("").messages({
    "string.max": "Category maksimal 100 karakter",
  }),
  reason: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Reason maksimal 500 karakter",
  }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "is_active harus berupa boolean",
  }),
});

const deleteHighRiskProductValidation = Joi.object({
  id_high_risk: Joi.number().integer().positive().required().messages({
    "any.required": "ID High Risk wajib diisi",
    "number.base": "ID High Risk harus berupa angka",
  }),
});

// ========================================
// VALIDATION: Query Parameters
// ========================================
const getStocktakeSessionsValidation = Joi.object({
  stocktake_type: Joi.string().valid("HARIAN", "BULANAN").optional(),
  status: Joi.string()
    .valid("DRAFT", "SUBMITTED", "REVISION", "COMPLETED", "CANCELLED")
    .optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().min(Joi.ref("start_date")).optional(),
  shift: Joi.string().max(20).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const getStocktakeItemsValidation = Joi.object({
  id_stocktake_session: Joi.string()
    .pattern(/^ST-\d{8}-\d{6}$/)
    .required()
    .messages({
      "any.required": "ID Stocktake Session wajib diisi",
      "string.pattern.base": "Format ID Stocktake Session tidak valid",
    }),
  is_counted: Joi.boolean().optional(),
  is_flagged: Joi.boolean().optional(),
  is_high_risk: Joi.boolean().optional(),
  has_variance: Joi.boolean().optional(), // Filter yang ada selisih
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(500).default(50),
});

// ========================================
// EXPORTS
// ========================================
export {
  createStocktakeSessionValidation,
  updateStocktakeItemValidation,
  batchUpdateStocktakeItemsValidation,
  submitStocktakeValidation,
  reviewStocktakeValidation,
  finalizeStocktakeValidation,
  cancelStocktakeValidation,
  addHighRiskProductValidation,
  updateHighRiskProductValidation,
  deleteHighRiskProductValidation,
  getStocktakeSessionsValidation,
  getStocktakeItemsValidation,
};
