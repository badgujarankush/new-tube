import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const generateAccessRefreshToken = async ({ id }) => {
  try {
    const user = await User.findById(id);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.refreshAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError({ statusCode: 500, message: "Something went wrong" });
  }
};

const createUser = async ({ username, fullName, email, password }) => {
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError({ statusCode: 400, message: "User already registered" });
  }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError({ statusCode: 500, message: "Something went wrong" });
  }

  return createdUser;
};

const loginUser = async ({ username, email, password }) => {
  if (!(username || email)) {
    throw new ApiError({
      statusCode: 400,
      message: "username/email is required",
    });
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError({ statusCode: 404, message: "User doesn't exist" });
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError({
      statusCode: 401,
      message: "Invalid user credentials",
    });
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken({
    id: user._id,
  });

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const response = {
    user: updatedUser,
    accessToken,
    refreshToken,
  };

  return response;
};

const refreshAccessToken = async (req) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError({ statusCode: 401, message: "Unauthorized token" });
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError({ statusCode: 401, message: "Invalid refresh token" });
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError({
        statusCode: 401,
        message: "Refresh token is expired or used",
      });
    }

    const { accessToken, refreshToken } = await generateAccessRefreshToken({
      id: user?._id,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("error", error);
    throw new ApiError({ statusCode: 500, message: "Something went wrong" });
  }
};

export default { createUser, loginUser, refreshAccessToken };
