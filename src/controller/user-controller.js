import userService from "../service/user-service.js";
import { ResponseSuccess } from "../utils/response-success.js";

const register = async (req, res, next) => {
  try {
    const result = await userService.register(req.body);
    const responses = new ResponseSuccess(
      "User registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    const responses = new ResponseSuccess(
      "Login success",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const get = async (req, res, next) => {
  try {
    const username = req.body.username;
    const result = await userService.get(username);
    const responses = new ResponseSuccess("success", result).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const username = req.body.username;
    const request = req.body;
    request.username = username;

    const result = await userService.update(request);
    const responses = new ResponseSuccess("success", result).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeUser = async (req, res, next) => {
  try {
    const username = req.body.username;
    const result = await userService.removeUser(username);
    const responses = new ResponseSuccess("success", result).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  try {
    await userService.logout(req.user.username);
    res
      .status(200)
      .json(new ResponseSuccess("Logout success", {}).getResponse());
  } catch (e) {
    next(e);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const result = await userService.searchUser(req.body);
    const responses = new ResponseSuccess(
      "Success get list users",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  register,
  login,
  get,
  update,
  removeUser,
  logout,
  listUsers,
};
