import { ResponseSuccess } from "../utils/response-success.js";
import roleService from "../service/role-service.js";

const createRole = async (req, res, next) => {
  try {
    const result = await roleService.createRole(req.body);
    const responses = new ResponseSuccess(
      "Role successfully registered",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getRole = async (req, res, next) => {
  try {
    const result = await roleService.getRole(req.body);
    const responses = new ResponseSuccess(
      "Success get role",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const result = await roleService.updateRole(req.body);
    const responses = new ResponseSuccess(
      "Success update role",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeRole = async (req, res, next) => {
  try {
    const result = await roleService.removeRole(req.body);
    const responses = new ResponseSuccess(
      "Success remove role",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listRole = async (req, res, next) => {
  try {
    const result = await roleService.searchRole(req.body);
    const responses = new ResponseSuccess(
      "Success get list role",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createRole,
  getRole,
  updateRole,
  removeRole,
  listRole,
};
