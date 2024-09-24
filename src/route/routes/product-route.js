import { userRouter } from "../api.js";
import productController from "../../controller/product-controller.js";

const productRoute = () => {
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
};

export default productRoute;
