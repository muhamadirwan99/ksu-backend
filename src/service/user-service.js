import { validate } from "../validation/validation.js";
import {
  getUserValidation,
  loginUserValidation,
  registerUserValidation,
  searchUserValidation,
  updateUserValidation,
} from "../validation/user-validation.js";
import { prismaClient } from "../application/database.js";
import bcrypt from "bcrypt";
import { ResponseError } from "../utils/response-error.js";
import { generateToken } from "../utils/generate-token.js";
import { generateDate } from "../utils/generate-date.js";

const register = async (request) => {
  const user = validate(registerUserValidation, request);

  const countUser = await prismaClient.user.count({
    where: {
      username: user.username,
    },
  });

  if (countUser === 1) {
    throw new ResponseError("Username already exists", {});
  }

  user.password = await bcrypt.hash(user.password, 10);
  user.created_at = generateDate();

  return prismaClient.user.create({
    data: user,
    select: {
      username: true,
      name: true,
    },
  });
};

const login = async (request) => {
  const loginRequest = validate(loginUserValidation, request);

  const user = await prismaClient.user.findUnique({
    where: {
      username: loginRequest.username,
    },
    select: {
      username: true,
      password: true,
      id_role: true,
    },
  });

  const listRole = await prismaClient.role.findUnique({
    where: {
      id_role: user.id_role,
    },
  });

  if (!user) {
    throw new ResponseError("Username or password wrong", {});
  }

  const isPasswordValid = await bcrypt.compare(
    loginRequest.password,
    user.password,
  );
  if (!isPasswordValid) {
    throw new ResponseError("Username or password wrong", {});
  }

  const userData = await prismaClient.user.update({
    data: {
      token: generateToken(user),
    },
    where: {
      username: user.username,
    },
    select: {
      username: true,
      name: true,
      token: true,
    },
  });

  return {
    user_data: userData,
    role_data: listRole,
  };
};

const get = async (username) => {
  username = validate(getUserValidation, username);

  const user = await prismaClient.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    throw new ResponseError("User is not found", {});
  }

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

const update = async (request) => {
  const user = validate(updateUserValidation, request);

  const totalUserInDatabase = await prismaClient.user.count({
    where: {
      username: user.username,
    },
  });

  if (totalUserInDatabase !== 1) {
    throw new ResponseError("User is not found", {});
  }

  const data = {};
  if (user.name) {
    data.name = user.name;
  }

  if (user.id_role) {
    data.role = {
      connect: {
        id: user.id_role,
      },
    };
  }

  if (user.password) {
    data.password = await bcrypt.hash(user.password, 10);
  }

  data.updated_at = generateDate();

  const userUpdate = await prismaClient.user.update({
    where: {
      username: user.username,
    },
    data: data,
  });

  const { token, password, ...userWithoutPassword } = userUpdate;

  return userWithoutPassword;
};

const logout = async (username) => {
  username = validate(getUserValidation, username);

  const user = await prismaClient.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    throw new ResponseError("User is not found", {});
  }

  return prismaClient.user.update({
    where: {
      username: username,
    },
    data: {
      token: null,
    },
    select: {
      username: true,
    },
  });
};

const searchUser = async (request) => {
  request = validate(searchUserValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.username) {
    filters.push({
      username: {
        contains: request.username,
      },
    });
  }

  const sortBy = request.sort_by || ["username"]; // Default sortBy ke 'username'
  const sortOrder = request.sort_order || ["asc"]; // Default sortOrder ke 'asc'

  // Membuat array untuk multiple orderBy
  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const users = await prismaClient.user.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.user.count({
    where: {
      AND: filters,
    },
  });

  const listFilteredUser = [];

  users.map((user) => {
    const { token, password, ...userWithoutPassword } = user;
    listFilteredUser.push(userWithoutPassword);
  });

  return {
    data_users: listFilteredUser,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  register,
  login,
  get,
  update,
  logout,
  searchUser,
};
