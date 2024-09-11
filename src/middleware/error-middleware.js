import {ResponseError} from "../utils/response-error.js";

const errorMiddleware = async (err, req, res, next) => {
    if (!err) {
        next();
        return;
    }

    if (err) {
        res.status(200).json(
            new ResponseError(err.message, err.data).getResponse()
        ).end();
    }  else {
        res.status(500).json(
            new ResponseError(err.message, err.data).getResponse()
        ).end();
    }
}

export {
    errorMiddleware
}
