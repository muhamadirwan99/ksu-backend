import {validate} from "../validation/validation.js";
import {prismaClient} from "../application/database.js";
import {
    getRoleValidation,
    roleValidation,
    searchRoleValidation,
    updateRoleValidation
} from "../validation/role-validation.js";
import {ResponseError} from "../utils/response-error.js";
import {generateDate} from "../utils/generate-date.js";

const createRole = async (request) => {
    const role = validate(roleValidation, request);

    const countUser = await prismaClient.role.count({
        where: {
            role_name: role.role_name
        }
    });

    if (countUser === 1) {
        throw new ResponseError("Role already exists");
    }

    role.created_at = generateDate();

    return prismaClient.role.create({
        data: role,
        select: {
            role_name: true,
        }
    });
}
const getRole = async (request) => {
    request = validate(getRoleValidation, request);

    const role = await prismaClient.role.findUnique({
        where: {
            id: request.role_id,
        },
        select: {
            id: true,
            role_name: true,
        }
    });

    if (!role) {
        throw new ResponseError("Role is not found");
    }

    return role;
}

const updateRole = async (request) => {
    const role = validate(updateRoleValidation, request);

    const totalRoleInDatabase = await prismaClient.role.count({
        where: {
            id: role.role_id
        }
    });

    if (totalRoleInDatabase !== 1){
        throw new ResponseError("Role is not found", {});
    }

    const data = {};

    if (role.role_name) {
        data.role_name = role.role_name;
    }

    data.updated_at = generateDate();

    return prismaClient.role.update({
        where: {
            id: role.role_id
        },
        data: data,
        select: {
            role_name: true,
        }
    })
}

const removeRole = async (request) => {
    request = validate(getRoleValidation, request);

    const totalInDatabase = await prismaClient.role.count({
        where: {
            id: request.role_id
        }
    });

    if (totalInDatabase !== 1) {
        throw new ResponseError("Role is not found", {});
    }

    return prismaClient.role.delete({
        where: {
            id: request.role_id
        }
    });
}

const searchRole = async (request) => {
    request = validate(searchRoleValidation, request);

    // 1 ((page - 1) * size) = 0
    // 2 ((page - 1) * size) = 10
    const skip = (request.page - 1) * request.size;

    const filters = [];

    if (request.role_name) {
        filters.push({
            role_name: {
                contains: request.role_name
            }
        });
    }

    const sortBy = request.sort_by || ['role_name'];
    const sortOrder = request.sort_order || ['asc'];

    const orderBy = sortBy.map((column, index) => ({
        [column]: sortOrder[index] === 'desc' ? 'desc' : 'asc'
    }));

    const roles = await prismaClient.role.findMany({
        where: {
            AND: filters
        },
        take: request.size,
        skip: skip,
        orderBy: orderBy
    });

    const totalItems = await prismaClient.role.count({
        where: {
            AND: filters
        }
    });

    return {
        data_roles: roles,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

export default {
    createRole,
    getRole,
    updateRole,
    removeRole,
    searchRole
}
