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
    console.log("Authenticating user...");
    if (!req.cookies) {
      throw new ApiResponse(
        400,
        "Cookies are not available. Make sure cookie-parser middleware is used."
      );
    }
    const token = req.cookies.accessToken;
    console.log("Access token from cookies:", token);
    if (!token) {
      throw new ApiResponse(401, "Access token missing. Please log in.");
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    console.log("Access token secret from environment:", secret);
    if (!secret) {
      throw new ApiResponse(500, "Access token secret is not defined.");
    }

    const userData = jwt.verify(token, secret) as JwtPayload;
    console.log("Decoded JWT payload:", userData);
    if (!userData || !userData._id) {
      throw new ApiResponse(401, "Invalid or expired access token.");
    }

    const user = await User.findById(userData._id);
    if (!user) {
      throw new ApiResponse(404, "User not found.");
    }

    req.user = user;
    console.log("here")
    next();
  } catch (error) {
    console.log("Error occurred while authenticating user:", error);
    if (error instanceof ApiResponse) {
      
      return next(error);
    }
    next(new ApiResponse(500, "Internal server error while authenticating"));
  }
};
