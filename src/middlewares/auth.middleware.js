import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req?.cookies?.accessToken ||
      req?.header("Authorization").replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiError({
        statusCode: 401,
        message: "Unauthrorized request",
      });
    }

    const decodedInfo = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = User.findById(decodedInfo._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError({ statusCode: 401, message: "Invalid AccessToken" });
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError({
      statusCode: 401,
      message: "Invalid Access token",
    });
  }
});
