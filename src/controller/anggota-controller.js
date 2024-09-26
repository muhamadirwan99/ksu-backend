import { ResponseSuccess } from "../utils/response-success.js";
import anggotaService from "../service/anggota-service.js";

const createAnggota = async (req, res, next) => {
  try {
    const result = await anggotaService.createAnggota(req.body);
    const responses = new ResponseSuccess(
      "Anggota successfully registered",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getAnggota = async (req, res, next) => {
  try {
    const result = await anggotaService.getAnggota(req.body);
    const responses = new ResponseSuccess(
      "Success get anggota",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const updateAnggota = async (req, res, next) => {
  try {
    const result = await anggotaService.updateAnggota(req.body);
    const responses = new ResponseSuccess(
      "Success update anggota",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeAnggota = async (req, res, next) => {
  try {
    const result = await anggotaService.removeAnggota(req.body);
    const responses = new ResponseSuccess(
      "Success remove anggota",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listAnggota = async (req, res, next) => {
  try {
    const result = await anggotaService.searchAnggota(req.body);
    const responses = new ResponseSuccess(
      "Success get list anggota",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createAnggota,
  getAnggota,
  updateAnggota,
  removeAnggota,
  listAnggota,
};
