import { ResponseSuccess } from "../utils/response-success.js";
import tutupKasirService from "../service/tutup-kasir-service.js";

const getTotalPenjualan = async (req, res, next) => {
  try {
    const result = await tutupKasirService.getTotalPenjualan(req.body);
    const responses = new ResponseSuccess(
      "Total penjualan successfully retrieved",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const createTutupKasir = async (req, res, next) => {
  try {
    const result = await tutupKasirService.createTutupKasir(req.body);
    const responses = new ResponseSuccess(
      "Tutup kasir successfully created",
      result,
    ).getResponse();
    res.status(201).json(responses);
  } catch (e) {
    next(e);
  }
};

const getListTutupKasir = async (req, res, next) => {
  try {
    const result = await tutupKasirService.getListTutupKasir(req.body);
    const responses = new ResponseSuccess(
      "List tutup kasir successfully retrieved",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const updateTutupKasir = async (req, res, next) => {
  try {
    const idRole = req.user.id_role;
    const result = await tutupKasirService.updateTutupKasir(req.body, idRole);
    const responses = new ResponseSuccess(
      "Tutup kasir successfully updated",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeTutupKasir = async (req, res, next) => {
  try {
    const result = await tutupKasirService.removeTutupKasir(req.body);
    const responses = new ResponseSuccess(
      "Tutup kasir successfully deleted",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};
const refreshTutupKasir = async (req, res, next) => {
  try {
    const result = await tutupKasirService.refreshTutupKasir(req.body);
    const responses = new ResponseSuccess(
      "Tutup kasir successfully refreshed",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  getTotalPenjualan,
  createTutupKasir,
  getListTutupKasir,
  updateTutupKasir,
  removeTutupKasir,
  refreshTutupKasir,
};
