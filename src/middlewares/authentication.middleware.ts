import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import { ApiResponse } from "../Api/ApiResponse";
import { User, UserDocument } from "../models/user.model";

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
      throw new ApiResponse(
        400,
        "Cookies are not available. Make sure cookie-parser middleware is used."
      );
    }
    const token = req.cookies.accessToken;
    if (!token) {
      throw new ApiResponse(401, "Access token missing. Please log in.");
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new ApiResponse(500, "Access token secret is not defined.");
    }

    const userData = jwt.verify(token, secret) as JwtPayload;

    if (!userData || !userData._id) {
      throw new ApiResponse(401, "Invalid or expired access token.");
    }

    const user = await User.findById(userData._id);
    if (!user) {
      throw new ApiResponse(404, "User not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiResponse) {
      return next(error);
    }
    next(new ApiResponse(500, "Internal server error while authenticating"));
  }
};
