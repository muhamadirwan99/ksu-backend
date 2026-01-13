/**
 * Stocktake V2 Controller
 * HTTP Request Handler untuk advanced inventory counting system
 */

import stocktakeV2Service from "../service/stocktake-v2-service.js";
import {
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
} from "../validation/stocktake-v2-validation.js";
import { ResponseSuccess } from "../utils/response-success.js";

// ========================================
// CONTROLLER: Create Stocktake Session
// POST /api/stocktake/v2/sessions
// ========================================
const createStocktakeSession = async (req, res, next) => {
  try {
    const validated = await createStocktakeSessionValidation.validateAsync(
      req.body
    );
    const user = req.user; // From auth middleware

    const result = await stocktakeV2Service.createStocktakeSession(
      validated,
      user
    );

    const response = new ResponseSuccess(
      "Stocktake session created successfully",
      result
    ).getResponse();
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// CONTROLLER: Get Stocktake Sessions (List with filters)
// GET /api/stocktake/v2/sessions
// ========================================
const getStocktakeSessions = async (req, res, next) => {
  try {
    const validated = await getStocktakeSessionsValidation.validateAsync(
      req.query
    );

    const result = await stocktakeV2Service.getStocktakeSessions(validated);

    const response = new ResponseSuccess(
      "Stocktake sessions retrieved successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// CONTROLLER: Get Stocktake Session Details
// GET /api/stocktake/v2/sessions/:sessionId
// ========================================
const getStocktakeSessionDetails = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    const result = await stocktakeV2Service.getStocktakeSessionDetails(
      sessionId,
      user
    );

    const response = new ResponseSuccess(
      "Stocktake session details retrieved successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// CONTROLLER: Get Stocktake Items
// GET /api/stocktake/v2/sessions/:sessionId/items
// ========================================
const getStocktakeItems = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const query = { ...req.query, id_stocktake_session: sessionId };

    const validated = await getStocktakeItemsValidation.validateAsync(query);

    const result = await stocktakeV2Service.getStocktakeItems(validated);

    const response = new ResponseSuccess(
      "Stocktake items retrieved successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// CONTROLLER: Update Stocktake Item (Single)
// PATCH /api/stocktake/v2/items/:itemId
// ========================================
const updateStocktakeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const requestBody = { ...req.body, id_stocktake_item: parseInt(itemId) };

    const validated =
      await updateStocktakeItemValidation.validateAsync(requestBody);
    const user = req.user;

    const result = await stocktakeV2Service.updateStocktakeItem(
      validated,
      user
    );

    const response = new ResponseSuccess(
      "Stocktake item updated successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// CONTROLLER: Batch Update Stocktake Items
// PATCH /api/stocktake/v2/sessions/:sessionId/items/batch
// ========================================
const batchUpdateStocktakeItems = async (req, res, next) => {
  try {
    const validated = await batchUpdateStocktakeItemsValidation.validateAsync(
      req.body
    );
    const user = req.user;

    const result = await stocktakeV2Service.batchUpdateStocktakeItems(
      validated,
      user
    );

    const response = new ResponseSuccess(
      "Stocktake items batch updated successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// CONTROLLER: Submit Stocktake
// POST /api/stocktake/v2/sessions/:sessionId/submit
// ========================================
const submitStocktake = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const requestBody = { ...req.body, id_stocktake_session: sessionId };

    const validated =
      await submitStocktakeValidation.validateAsync(requestBody);
    const user = req.user;

    const result = await stocktakeV2Service.submitStocktake(validated, user);

    const response = new ResponseSuccess(
      "Stocktake submitted successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// CONTROLLER: Review Stocktake
// POST /api/stocktake/v2/sessions/:sessionId/review
// ========================================
const reviewStocktake = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const requestBody = { ...req.body, id_stocktake_session: sessionId };

    const validated =
      await reviewStocktakeValidation.validateAsync(requestBody);
    const user = req.user;

    const result = await stocktakeV2Service.reviewStocktake(validated, user);

    const response = new ResponseSuccess(
      "Stocktake reviewed successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// CONTROLLER: Finalize Stocktake
// POST /api/stocktake/v2/sessions/:sessionId/finalize
// ========================================
const finalizeStocktake = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const requestBody = { ...req.body, id_stocktake_session: sessionId };

    const validated =
      await finalizeStocktakeValidation.validateAsync(requestBody);
    const user = req.user;

    const result = await stocktakeV2Service.finalizeStocktake(validated, user);

    const response = new ResponseSuccess(
      "Stocktake finalized successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// CONTROLLER: Cancel Stocktake
// POST /api/stocktake/v2/sessions/:sessionId/cancel
// ========================================
const cancelStocktake = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const requestBody = { ...req.body, id_stocktake_session: sessionId };

    const validated =
      await cancelStocktakeValidation.validateAsync(requestBody);
    const user = req.user;

    const result = await stocktakeV2Service.cancelStocktake(validated, user);

    const response = new ResponseSuccess(
      "Stocktake cancelled successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// CONTROLLER: Get Adjustment Logs
// GET /api/stocktake/v2/sessions/:sessionId/adjustments
// ========================================
const getAdjustmentLogs = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const result = await stocktakeV2Service.getAdjustmentLogs(sessionId);

    const response = new ResponseSuccess(
      "Adjustment logs retrieved successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// HIGH RISK PRODUCT MANAGEMENT CONTROLLERS
// ========================================

// Add High Risk Product
// POST /api/stocktake/v2/high-risk-products
const addHighRiskProduct = async (req, res, next) => {
  try {
    const validated = await addHighRiskProductValidation.validateAsync(
      req.body
    );

    const result = await stocktakeV2Service.addHighRiskProduct(validated);

    const response = new ResponseSuccess(
      "High risk product added successfully",
      result
    ).getResponse();
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Update High Risk Product
// PATCH /api/stocktake/v2/high-risk-products/:id
const updateHighRiskProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestBody = { ...req.body, id_high_risk: parseInt(id) };

    const validated =
      await updateHighRiskProductValidation.validateAsync(requestBody);

    const result = await stocktakeV2Service.updateHighRiskProduct(validated);

    const response = new ResponseSuccess(
      "High risk product updated successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Delete High Risk Product
// DELETE /api/stocktake/v2/high-risk-products/:id
const deleteHighRiskProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const validated = await deleteHighRiskProductValidation.validateAsync({
      id_high_risk: parseInt(id),
    });

    const result = await stocktakeV2Service.deleteHighRiskProduct(
      validated.id_high_risk
    );

    const response = new ResponseSuccess(
      "High risk product deleted successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get High Risk Products
// GET /api/stocktake/v2/high-risk-products
const getHighRiskProducts = async (req, res, next) => {
  try {
    const { is_active, category } = req.query;

    const filters = {
      ...(is_active !== undefined && { is_active: is_active === "true" }),
      ...(category && { category }),
    };

    const result = await stocktakeV2Service.getHighRiskProducts(filters);

    const response = new ResponseSuccess(
      "High risk products retrieved successfully",
      result
    ).getResponse();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// EXPORTS
// ========================================
export {
  createStocktakeSession,
  getStocktakeSessions,
  getStocktakeSessionDetails,
  getStocktakeItems,
  updateStocktakeItem,
  batchUpdateStocktakeItems,
  submitStocktake,
  reviewStocktake,
  finalizeStocktake,
  cancelStocktake,
  getAdjustmentLogs,
  addHighRiskProduct,
  updateHighRiskProduct,
  deleteHighRiskProduct,
  getHighRiskProducts,
};
