import {prismaClient} from "../application/database.js";
import {ResponseError} from "../utils/response-error.js";

export const authMiddleware = async (req, res, next) => {
    const token = req.get('Authorization');
    if (!token) {
        res.status(200).json(
            new ResponseError("Unauthorized", {}).getResponse()
        ).end();
    } else {
        const user = await prismaClient.user.findFirst({
            where: {
                token: token
            }
        });
        if (!user) {
            res.status(200).json(
                new ResponseError("Unauthorized", {}).getResponse()
            ).end();
        } else {
            req.user = user;
            next();
        }
    }
}
