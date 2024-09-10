import {prismaClient} from "../application/database.js";

const logResponse = async (success, message, data) => {
    await prismaClient.responseLog.create({
        data: {
            success: success,
            message: message,
            data: data,  // Storing the data as JSON
        }
    });
};


export {logResponse};