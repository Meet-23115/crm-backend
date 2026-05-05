import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../Api/ApiResponse";
import { User, UserDocument } from "../models/user.model";

interface JwtPayload {
  _id: string;
  uuid: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export const userAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      res.status(401).json(new ApiResponse(401, null, "Access token missing"));
      return;
    }

    const secret = process.env.ACCESS_TOKEN_SECRET || "secret";
    const userData = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(userData._id);

    if (!user) {
      res.status(401).json(new ApiResponse(401, null, "Invalid session"));
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json(new ApiResponse(401, null, "Invalid or expired token"));
  }
};
