import { ResponseError } from "../utils/response-error.js";
import jwt from "jsonwebtoken";

const errorMiddleware = async (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  if (err) {
    const authHeader = req.get("Authorization");

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      const secretKey = process.env.JWT_SECRET_KEY;

      // Verify the token
      const decodedToken = jwt.verify(token, secretKey);

      err.data = err.data || {};
      err.data.username = decodedToken.username;
    }

    res
      .status(200)
      .json(new ResponseError(err.message, err.data).getResponse())
      .end();
  } else {
    res
      .status(500)
      .json(new ResponseError(err.message, err.data).getResponse())
      .end();
  }
};

export { errorMiddleware };
