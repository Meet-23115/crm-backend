import { ApiError } from "@packages/shared-utils/Api/ApiError";
import { NextFunction, Request, Response } from "express";

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
      res.json(new ApiError(401, "Unauthorized: User not authenticated."));
    } else if (req.user)
      if (!allowedRoles.includes(req.user.role)) {
        // Check if the user's role is among the allowed roles
        res.json(new ApiError(401, "Not Authorized for this method"));
      } else {
        next();
      }

    // User is authorized; proceed to the next middleware/route handler
  };
};
