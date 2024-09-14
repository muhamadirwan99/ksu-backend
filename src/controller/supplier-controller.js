import {ResponseSuccess} from "../utils/response-success.js";
import supplierService from "../service/supplier-service.js";

const createSupplier = async (req, res, next) => {
    try {
        const result = await supplierService.createSupplier(req.body);
        const responses = new ResponseSuccess("Supplier registered", result).getResponse();
        res.status(200).json(responses);
    } catch (e) {
        next(e);
    }
}

const getSupplier = async (req, res, next) => {
    try {
        const result = await supplierService.getSupplier(req.body);
        const responses = new ResponseSuccess("Success get supplier", result).getResponse();

        res.status(200).json(responses);
    } catch (e) {
        next(e);
    }
}

const updateSupplier = async (req, res, next) => {
    try {
        const result = await supplierService.updateSupplier(req.body);
        const responses = new ResponseSuccess("Success update supplier", result).getResponse();

        res.status(200).json(responses);
    } catch (e) {
        next(e);
    }
}

const removeSupplier = async (req, res, next) => {
    try {
        const result = await supplierService.removeSupplier(req.body);
        const responses = new ResponseSuccess("Success remove supplier", result).getResponse();

        res.status(200).json(responses);
    } catch (e) {
        next(e);
    }
}

const listSupplier = async (req, res, next) => {
    try {
        const result = await supplierService.searchSupplier(req.body);
        const responses = new ResponseSuccess("Success get list supplier", result).getResponse();

        res.status(200).json(responses);
    } catch (e) {
        next(e);
    }
}

export default {
    createSupplier,
    getSupplier,
    updateSupplier,
    removeSupplier,
    listSupplier
}
