import {validate} from "../validation/validation.js";
import {prismaClient} from "../application/database.js";
import {
    getRoleValidation,
    roleValidation,
    searchRoleValidation,
    updateRoleValidation
} from "../validation/role-validation.js";
import {ResponseError} from "../utils/response-error.js";
import {addDivisiValidation, getDivisiValidation, searchDivisiValidation} from "../validation/divisi-validation.js";

const addDivisi = async (request) => {
    const divisi = validate(addDivisiValidation, request);

    const countDivisi = await prismaClient.divisi.count({
        where: {
            kd_divisi: divisi.kd_divisi
        }
    });

    if (countDivisi === 1) {
        throw new ResponseError("Divisi already exists");
    }

    return prismaClient.divisi.create({
        data: divisi,
        select: {
            kd_divisi: true,
            nm_divisi: true,
        }
    });
}

const getDivisi = async (request) => {
    request = validate(getDivisiValidation, request);

    const divisi = await prismaClient.divisi.findUnique({
        where: {
            kd_divisi: request.kd_divisi,
        },
        select: {
            kd_divisi: true,
            nm_divisi: true,
        }
    });

    if (!divisi) {
        throw new ResponseError("Divisi is not found");
    }

    return divisi;
}

const updateDivisi = async (request) => {
    request = validate(addDivisiValidation, request);

    const totalDivisiInDatabase = await prismaClient.divisi.count({
        where: {
            kd_divisi: request.kd_divisi
        }
    });

    if (totalDivisiInDatabase !== 1){
        throw new ResponseError("Divisi is not found", {});
    }

    const data = {};

    if (request.kd_divisi) {
        data.nm_divisi = request.nm_divisi;
    }

    return prismaClient.divisi.update({
        where: {
            kd_divisi: request.kd_divisi
        },
        data: data,
        select: {
            nm_divisi: true,
        }
    })
}

const removeDivisi = async (request) => {
    request = validate(getDivisiValidation, request);

    const totalInDatabase = await prismaClient.divisi.count({
        where: {
            kd_divisi: request.kd_divisi
        }
    });

    if (totalInDatabase !== 1) {
        throw new ResponseError("Divisi is not found", {});
    }

    return prismaClient.divisi.delete({
        where: {
            kd_divisi: request.kd_divisi
        }
    });
}

const searchDivisi = async (request) => {
    request = validate(searchDivisiValidation, request);

    // 1 ((page - 1) * size) = 0
    // 2 ((page - 1) * size) = 10
    const skip = (request.page - 1) * request.size;

    const filters = [];

    if (request.nm_divisi) {
        filters.push({
            nm_divisi: {
                contains: request.nm_divisi
            }
        });
    }

    const sortBy = request.sort_by || ['nm_divisi'];
    const sortOrder = request.sort_order || ['asc'];

    const orderBy = sortBy.map((column, index) => ({
        [column]: sortOrder[index] === 'desc' ? 'desc' : 'asc'
    }));

    const roles = await prismaClient.divisi.findMany({
        where: {
            AND: filters
        },
        take: request.size,
        skip: skip,
        orderBy: orderBy
    });

    const totalItems = await prismaClient.divisi.count({
        where: {
            AND: filters
        }
    });

    return {
        data_divisi: roles,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

export default {
    addDivisi,
    getDivisi,
    updateDivisi,
    removeDivisi,
    searchDivisi
}
