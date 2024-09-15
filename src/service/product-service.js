import {validate} from "../validation/validation.js";
import {prismaClient} from "../application/database.js";
import {ResponseError} from "../utils/response-error.js";
import {generateDate} from "../utils/generate-date.js";
import {
    addProductValidation,
    getProductValidation,
    searchProductValidation,
    updateProductValidation
} from "../validation/product-validation.js";
import {updateFields} from "../utils/update-fields.js";

const createProduct = async (request) => {
     request = validate(addProductValidation, request);

    const countProduct = await prismaClient.products.count({
        where: {
            kd_product: request.kd_product
        }
    });

    if (countProduct === 1) {
        throw new ResponseError("Product already exists");
    }

    request.created_at = generateDate();

    return prismaClient.products.create({
        data: request,
    });
}

const getProduct = async (request) => {
    request = validate(getProductValidation, request);

    const product = await prismaClient.products.findUnique({
        where: {
            kd_product: request.kd_product,
        }
    });

    if (!product) {
        throw new ResponseError("Product is not found");
    }

    return product;
}

const updateProduct = async (request) => {
    request = validate(updateProductValidation, request);
    const fieldProduct = ['nm_product', 'kd_divisi', 'kd_supplier', 'harga_jual', 'harga_beli', 'status_product', 'jumlah', 'keterangan'];

    const totalProductInDatabase = await prismaClient.products.count({
        where: {
            kd_product: request.kd_product
        }
    });

    if (totalProductInDatabase !== 1){
        throw new ResponseError("Product is not found", {});
    }

    const data = {};
    updateFields(request, data, fieldProduct);

    data.updated_at = generateDate();

    return prismaClient.products.update({
        where: {
            kd_product: request.kd_product
        },
        data: data,
    })
}

const removeProduct = async (request) => {
    request = validate(getProductValidation, request);

    const totalInDatabase = await prismaClient.products.count({
        where: {
            kd_product: request.kd_product
        }
    });

    if (totalInDatabase !== 1) {
        throw new ResponseError("Product is not found", {});
    }

    return prismaClient.products.delete({
        where: {
            kd_product: request.kd_product
        }
    });
}

const searchProduct = async (request) => {
    request = validate(searchProductValidation, request);

    // 1 ((page - 1) * size) = 0
    // 2 ((page - 1) * size) = 10
    const skip = (request.page - 1) * request.size;

    const filters = [];

    if (request.nm_product) {
        filters.push({
            nm_product: {
                contains: request.nm_product
            }
        });
    }

    const sortBy = request.sort_by || ['nm_product'];
    const sortOrder = request.sort_order || ['asc'];

    const orderBy = sortBy.map((column, index) => ({
        [column]: sortOrder[index] === 'desc' ? 'desc' : 'asc'
    }));

    const roles = await prismaClient.products.findMany({
        where: {
            AND: filters
        },
        take: request.size,
        skip: skip,
        orderBy: orderBy
    });

    const totalItems = await prismaClient.products.count({
        where: {
            AND: filters
        }
    });

    return {
        data_product: roles,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

export default {
    createProduct,
    getProduct,
    updateProduct,
    removeProduct,
    searchProduct
}
