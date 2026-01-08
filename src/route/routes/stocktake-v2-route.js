/**
 * Stocktake V2 Routes
 * RESTful API routes untuk advanced inventory counting system
 */

import { userRouter } from "../api.js";
import {
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
} from "../../controller/stocktake-v2-controller.js";

const stocktakeV2Route = () => {
  // ========================================
  // STOCKTAKE SESSION ROUTES
  // ========================================

  // Create new stocktake session
  userRouter.post("/api/stocktake/v2/sessions", createStocktakeSession);

  // Get stocktake sessions with filters (list)
  userRouter.get("/api/stocktake/v2/sessions", getStocktakeSessions);

  // Get specific session details
  userRouter.get(
    "/api/stocktake/v2/sessions/:sessionId",
    getStocktakeSessionDetails
  );

  // Get items for a session
  userRouter.get(
    "/api/stocktake/v2/sessions/:sessionId/items",
    getStocktakeItems
  );

  // Batch update multiple items
  userRouter.patch(
    "/api/stocktake/v2/sessions/:sessionId/items/batch",
    batchUpdateStocktakeItems
  );

  // Submit stocktake (Kasir -> Reviewer)
  userRouter.post(
    "/api/stocktake/v2/sessions/:sessionId/submit",
    submitStocktake
  );

  // Review stocktake (Manajer)
  userRouter.post(
    "/api/stocktake/v2/sessions/:sessionId/review",
    reviewStocktake
  );

  // Finalize stocktake (Update stock master)
  userRouter.post(
    "/api/stocktake/v2/sessions/:sessionId/finalize",
    finalizeStocktake
  );

  // Cancel stocktake
  userRouter.post(
    "/api/stocktake/v2/sessions/:sessionId/cancel",
    cancelStocktake
  );

  // Get adjustment logs for a session
  userRouter.get(
    "/api/stocktake/v2/sessions/:sessionId/adjustments",
    getAdjustmentLogs
  );

  // ========================================
  // STOCKTAKE ITEM ROUTES
  // ========================================

  // Update single item (blind count)
  userRouter.patch("/api/stocktake/v2/items/:itemId", updateStocktakeItem);

  // ========================================
  // HIGH RISK PRODUCT ROUTES
  // ========================================

  // Get high risk products
  userRouter.get("/api/stocktake/v2/high-risk-products", getHighRiskProducts);

  // Add new high risk product
  userRouter.post("/api/stocktake/v2/high-risk-products", addHighRiskProduct);

  // Update high risk product
  userRouter.patch(
    "/api/stocktake/v2/high-risk-products/:id",
    updateHighRiskProduct
  );

  // Delete high risk product
  userRouter.delete(
    "/api/stocktake/v2/high-risk-products/:id",
    deleteHighRiskProduct
  );
};

export default stocktakeV2Route;
