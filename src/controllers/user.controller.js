import { asyncHandler } from "../utils/asyncHandler.js";
import UserManager from "../managers/user.manager.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password, fullName, avatar, coverImage } = req.body;

  try {
    const user = await UserManager.createUser({
      username,
      email,
      password,
      fullName,
    });

    return res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        data: user,
        message: "User registered Successfully",
      })
    );
  } catch (error) {
    next(error);
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const response = await UserManager.loginUser({
      email,
      username,
      password,
    });

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", response?.accessToken, options)
      .cookie("refreshToken", response?.refreshToken, options)
      .json(
        new ApiResponse({
          statusCode: 200,
          data: response?.user,
          message: "User logged in successfully",
        })
      );
  } catch (error) {
    console.log("error", error);
    throw new ApiError({ statusCode: 500, message: "Something went wrong" });
  }
});

const logoutUser = asyncHandler(async (req, res, next) => {
  try {
    const { user } = req;
    if (!user) {
      throw new ApiError({ statusCode: 401, message: "Unauthorized access" });
    }
    const _user = await User.findByIdAndUpdate(
      user._id,
      { $set: { refreshToken: undefined } },
      { new: true }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("refreshToken", options)
      .clearCookie("accessToken", options)
      .json(
        new ApiResponse({
          statusCode: 200,
          message: "User logged out successfully",
        })
      );
  } catch (error) {
    throw new ApiError({ statusCode: 500, message: "Something went wrong" });
  }
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  try {
    const { accessToken, refreshToken } =
      await UserManager.refreshAccessToken(req);

    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json(
        new ApiResponse({
          statusCode: 200,
          data: { accessToken, refreshToken },
          message: "Access Token Refreshed",
        })
      );
  } catch (error) {
    throw new ApiError({ statusCode: 500, message: "Something went wrong" });
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
