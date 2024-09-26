import { ResponseSuccess } from "../utils/response-success.js";
import productService from "../service/product-service.js";

const createProduct = async (req, res, next) => {
  try {
    const result = await productService.createProduct(req.body);
    const responses = new ResponseSuccess(
      "Product successfully registered",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const result = await productService.getProduct(req.body);
    const responses = new ResponseSuccess(
      "Success get product",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const result = await productService.updateProduct(req.body);
    const responses = new ResponseSuccess(
      "Success update product",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeProduct = async (req, res, next) => {
  try {
    const result = await productService.removeProduct(req.body);
    const responses = new ResponseSuccess(
      "Success remove product",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listProduct = async (req, res, next) => {
  try {
    const result = await productService.searchProduct(req.body);
    const responses = new ResponseSuccess(
      "Success get list product",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createProduct,
  getProduct,
  updateProduct,
  removeProduct,
  listProduct,
};
