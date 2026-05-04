import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../Api/ApiResponse";

export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  DEVELOPER = "developer",
  DESIGNER = "designer",
  HR = "hr",
}

interface authorizeProps {
  allowedRoles: Role;
}

export const authorize = (allowedRoles: authorizeProps["allowedRoles"]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure req.user exists (set by a previous authentication middleware)
    if (!req.user) {
      res.json(new ApiResponse(401, "Unauthorized: User not authenticated."));
    } else if (req.user)
      if (!allowedRoles.includes(req.user.role)) {
        // Check if the user's role is among the allowed roles
        res.json(new ApiResponse(401, "Not Authorized for this method"));
      } else {
        next();
      }

    // User is authorized; proceed to the next middleware/route handler
  };
};
