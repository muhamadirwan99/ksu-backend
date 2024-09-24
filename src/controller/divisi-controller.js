import { ResponseSuccess } from "../utils/response-success.js";
import divisiService from "../service/divisi-service.js";

const createDivisi = async (req, res, next) => {
  try {
    const result = await divisiService.createDivisi(req.body);
    const responses = new ResponseSuccess(
      "Divisi registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getDivisi = async (req, res, next) => {
  try {
    const result = await divisiService.getDivisi(req.body);
    const responses = new ResponseSuccess(
      "Success get divisi",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const updateDivisi = async (req, res, next) => {
  try {
    const result = await divisiService.updateDivisi(req.body);
    const responses = new ResponseSuccess(
      "Success update divisi",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeDivisi = async (req, res, next) => {
  try {
    const result = await divisiService.removeDivisi(req.body);
    const responses = new ResponseSuccess(
      "Success remove divisi",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listDivisi = async (req, res, next) => {
  try {
    const result = await divisiService.searchDivisi(req.body);
    const responses = new ResponseSuccess(
      "Success get list divisi",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createDivisi,
  getDivisi,
  updateDivisi,
  removeDivisi,
  listDivisi,
};
