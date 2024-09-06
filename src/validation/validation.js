import {ResponseError} from "../utils/response-error.js";
import {logger} from "../application/logging.js";

const validate = (schema, request) => {
    const result = schema.validate(request, {
        abortEarly: false,
        allowUnknown: false
    })
    logger.warn("result");
    logger.warn(result);

    if (result.error) {
        throw new ResponseError(result.error.message,{});
    } else {
        return result.value;
    }
}

export {
    validate
}
