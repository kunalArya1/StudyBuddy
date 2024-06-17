import User from "../models/User";
import jwt from "jsonwebtoken";
import { AsyncHandler } from "../utils/CustomeError/AsyncHandler";
import { ApiResponse } from "../utils/CustomeError/ApiResopnse";

//auth

export const isAuth = AsyncHandler(async (req, res, next) => {
  const token =
    req.cookies.token ||
    req.body.token ||
    req.header("Authorisation").replace("Bearer ", "");

  // token  missing
  if (!token) {
    return res.json(new ApiResponse(401, "Token is missing"));
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SCERET);

    req.user = decode;
  } catch (error) {
    return res.json(new ApiResponse(401, "Token is invalid"));
  }

  next();
});

// isStudent

export const isStudent = AsyncHandler(async (req, res, next) => {
  if (req.user.accountType !== "Student") {
    return res.json(
      new ApiResponse(403, "You are not authorized to access this route")
    );
  }
  next();
});

// isInstructor

export const isInstructor = AsyncHandler(async (req, res, next) => {
  if (req.user.accountType !== "Instructor") {
    return res.json(
      new ApiResponse(403, "You are not authorized to access this route")
    );
  }
  next();
});

// isAdmin

export const isAdmin = AsyncHandler(async (req, res, next) => {
  if (req.user.accountType !== "Admin") {
    return res.json(
      new ApiResponse(403, "You are not authorized to access this route")
    );
  }
  next();
});
