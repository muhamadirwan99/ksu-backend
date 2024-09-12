import {prismaClient} from "../application/database.js";
import {generateDate} from "../utils/generate-date.js";

const logResponse = async (success, message, data) => {
    await prismaClient.responseLog.create({
        data: {
            success: success,
            message: message,
            data: data,  // Storing the data as JSON
            created_at: generateDate()
        }
    });
};

export {logResponse};