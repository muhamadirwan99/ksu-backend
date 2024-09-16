import express from "express";
import userController from "../controller/user-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";
import roleController from "../controller/role-controller.js";
import divisiController from "../controller/divisi-controller.js";
import supplierController from "../controller/supplier-controller.js";
import productController from "../controller/product-controller.js";
import anggotaController from "../controller/anggota-controller.js";
import cashinoutController from "../controller/cash_in_out/cash-in-out-controller.js";
import jenisCashInOutController from "../controller/cash_in_out/jenis-cash-in-out-controller.js";
import detailCashInOutController from "../controller/cash_in_out/detail-cash-in-out-controller.js";

const userRouter = new express.Router();
userRouter.use(authMiddleware);

// User API
userRouter.post("/api/users/detail-user", userController.get);
userRouter.post("/api/users/update-user", userController.update);
userRouter.post("/api/users/logout", userController.logout);
userRouter.post("/api/users/list-users", userController.listUsers);

// Role API
userRouter.post("/api/roles/detail-role", roleController.getRole);
userRouter.post("/api/roles/update-role", roleController.updateRole);
userRouter.post("/api/roles/remove-role", roleController.removeRole);
userRouter.post("/api/roles/list-roles", roleController.listRole);

// Divisi API
userRouter.post("/api/divisi/create-divisi", divisiController.createDivisi);
userRouter.post("/api/divisi/detail-divisi", divisiController.getDivisi);
userRouter.post("/api/divisi/update-divisi", divisiController.updateDivisi);
userRouter.post("/api/divisi/remove-divisi", divisiController.removeDivisi);
userRouter.post("/api/divisi/list-divisi", divisiController.listDivisi);

// Supplier API
userRouter.post(
  "/api/suppliers/create-supplier",
  supplierController.createSupplier,
);
userRouter.post(
  "/api/suppliers/detail-supplier",
  supplierController.getSupplier,
);
userRouter.post(
  "/api/suppliers/update-supplier",
  supplierController.updateSupplier,
);
userRouter.post(
  "/api/suppliers/remove-supplier",
  supplierController.removeSupplier,
);
userRouter.post(
  "/api/suppliers/list-suppliers",
  supplierController.listSupplier,
);

// Product API
userRouter.post(
  "/api/products/create-product",
  productController.createProduct,
);
userRouter.post("/api/products/detail-product", productController.getProduct);
userRouter.post(
  "/api/products/update-product",
  productController.updateProduct,
);
userRouter.post(
  "/api/products/remove-product",
  productController.removeProduct,
);
userRouter.post("/api/products/list-products", productController.listProduct);

// Product API
userRouter.post("/api/anggota/create-anggota", anggotaController.createAnggota);
userRouter.post("/api/anggota/detail-anggota", anggotaController.getAnggota);
userRouter.post("/api/anggota/update-anggota", anggotaController.updateAnggota);
userRouter.post("/api/anggota/remove-anggota", anggotaController.removeAnggota);
userRouter.post("/api/anggota/list-anggota", anggotaController.listAnggota);

// Reference Cash In Out API
userRouter.post("/api/cash-in-out/create-cash", cashinoutController.createCash);
userRouter.post("/api/cash-in-out/update-cash", cashinoutController.updateCash);
userRouter.post("/api/cash-in-out/remove-cash", cashinoutController.removeCash);
userRouter.post("/api/cash-in-out/list-cash", cashinoutController.listCash);
userRouter.post(
  "/api/cash-in-out/create-jenis-cash",
  jenisCashInOutController.createJenisCash,
);
userRouter.post(
  "/api/cash-in-out/update-jenis-cash",
  jenisCashInOutController.updateJenisCash,
);
userRouter.post(
  "/api/cash-in-out/remove-jenis-cash",
  jenisCashInOutController.removeJenisCash,
);
userRouter.post(
  "/api/cash-in-out/list-jenis-cash",
  jenisCashInOutController.listJenisCash,
);
userRouter.post(
  "/api/cash-in-out/create-detail-cash",
  detailCashInOutController.createDetailCash,
);
userRouter.post(
  "/api/cash-in-out/update-detail-cash",
  detailCashInOutController.updateDetailCash,
);
userRouter.post(
  "/api/cash-in-out/remove-detail-cash",
  detailCashInOutController.removeDetailCash,
);
userRouter.post(
  "/api/cash-in-out/list-detail-cash",
  detailCashInOutController.listDetailCash,
);

export { userRouter };
