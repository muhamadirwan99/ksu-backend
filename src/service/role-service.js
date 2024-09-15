import {validate} from "../validation/validation.js";
import {prismaClient} from "../application/database.js";
import {
  getRoleValidation,
  roleValidation,
  searchRoleValidation,
  updateRoleValidation,
} from "../validation/role-validation.js";
import {ResponseError} from "../utils/response-error.js";
import {generateDate} from "../utils/generate-date.js";

const createRole = async (request) => {
  const role = validate(roleValidation, request);

  // Cek apakah role dengan nama yang sama sudah ada
  const countUser = await prismaClient.role.count({
    where: {
      role_name: role.role_name,
    },
  });

  if (countUser === 1) {
    throw new ResponseError("Role already exists");
  }

  // Ambil ID terakhir dari tabel role
  const lastRole = await prismaClient.role.findFirst({
    orderBy: {
      id_role: 'desc', // Urutkan berdasarkan ID role secara descending
    },
  });

  // Generate ID role baru
  let newId;
  if (lastRole) {
    const lastIdNumber = parseInt(lastRole.id_role.replace('ROLE', ''), 10); // Ambil angka dari ID terakhir
    newId = `ROLE${String(lastIdNumber + 1).padStart(3, '0')}`; // Tambahkan 1 dan pastikan 3 digit
  } else {
    newId = 'ROLE001'; // Jika belum ada ID, mulai dari ROLE001
  }

  // Set id_role dan created_at
  role.id_role = newId;
  role.created_at = generateDate();

  // Buat role baru di database
  return prismaClient.role.create({
    data: role,
    select: {
      role_name: true,
      id_role: true, // Tambahkan id_role agar bisa melihat hasil ID yang digenerate
    },
  });
};


const getRole = async (request) => {
  request = validate(getRoleValidation, request);

  const role = await prismaClient.role.findUnique({
    where: {
      id_role: request.id_role,
    },
    select: {
      id_role: true,
      role_name: true,
    },
  });

  if (!role) {
    throw new ResponseError("Role is not found");
  }

  return role;
};

const updateRole = async (request) => {
  const role = validate(updateRoleValidation, request);

  const totalRoleInDatabase = await prismaClient.role.count({
    where: {
      id_role: role.id_role,
    },
  });

  if (totalRoleInDatabase !== 1) {
    throw new ResponseError("Role is not found", {});
  }

  const data = {};

  if (role.role_name) {
    data.role_name = role.role_name;
  }

  data.updated_at = generateDate();

  return prismaClient.role.update({
    where: {
      id_role: role.id_role,
    },
    data: data,
    select: {
      role_name: true,
    },
  });
};

const removeRole = async (request) => {
  request = validate(getRoleValidation, request);

  const totalInDatabase = await prismaClient.role.count({
    where: {
      id_role: request.id_role,
    },
  });

  if (totalInDatabase !== 1) {
    throw new ResponseError("Role is not found", {});
  }

  return prismaClient.role.delete({
    where: {
      id_role: request.id_role,
    },
  });
};

const searchRole = async (request) => {
  request = validate(searchRoleValidation, request);

  // 1 ((page - 1) * size) = 0
  // 2 ((page - 1) * size) = 10
  const skip = (request.page - 1) * request.size;

  const filters = [];

  if (request.role_name) {
    filters.push({
      role_name: {
        contains: request.role_name,
      },
    });
  }

  const sortBy = request.sort_by || ["role_name"];
  const sortOrder = request.sort_order || ["asc"];

  const orderBy = sortBy.map((column, index) => ({
    [column]: sortOrder[index] === "desc" ? "desc" : "asc",
  }));

  const roles = await prismaClient.role.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    orderBy: orderBy,
  });

  const totalItems = await prismaClient.role.count({
    where: {
      AND: filters,
    },
  });

  return {
    data_roles: roles,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default {
  createRole,
  getRole,
  updateRole,
  removeRole,
  searchRole,
};
