import {prismaClient} from "../application/database.js";
import {ResponseError} from "../utils/response-error.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
    // Extract the Authorization header
    const authHeader = req.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(200).json(
            new ResponseError("Unauthorized", {}).getResponse()
        ).end();
    }

    // Remove the "Bearer " prefix from the token
    const token = authHeader.split(' ')[1];

    try {
        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            return res.status(200).json(
                new ResponseError("JWT secret key is not defined in environment variables", {}).getResponse()
            ).end();
        }

        // Verify the token
        const decodedToken = jwt.verify(token, secretKey);

        // Find the user based on the decoded token information (assuming the payload has a user ID)
        const user = await prismaClient.user.findUnique({
            where: {
                username: decodedToken.username  // Assuming the JWT payload contains the user's ID
            }
        });

        if (!user) {
            return res.status(200).json(
                new ResponseError("Unauthorized", {}).getResponse()
            ).end();
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error) {
        res.status(200).json(
            new ResponseError(error, {}).getResponse()
        ).end();
    }
};

