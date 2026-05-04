import { Request, Response, NextFunction } from "express";
import { ApiError } from "@packages/shared-utils/Api/ApiError";
// import { asyncHandler } from '../utils/asyncHandler';
import {
  User,
  UserDocument,
} from "@packages/shared-models/src/models/user.model";
import jwt from "jsonwebtoken";

// Define the shape of decoded JWT payload
interface JwtPayload {
  _id: string;
  iat?: number;
  exp?: number;
}

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export const userAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.cookies) {
      throw new ApiError(
        400,
        "Cookies are not available. Make sure cookie-parser middleware is used."
      );
    }
    const token = req.cookies.accessToken;
    if (!token) {
      throw new ApiError(401, "Access token missing. Please log in.");
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new ApiError(500, "Access token secret is not defined.");
    }

    const userData = jwt.verify(token, secret) as JwtPayload;

    if (!userData || !userData._id) {
      throw new ApiError(401, "Invalid or expired access token.");
    }

    const user = await User.findById(userData._id);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(500, "Internal server error while authenticating"));
  }
};
