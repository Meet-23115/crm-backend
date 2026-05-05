import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../Api/ApiResponse";
import { UserRole } from "../models/user.model";

export { UserRole as Role };

export const authorize = (allowedRoles: UserRole | UserRole[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(new ApiResponse(403, null, "Forbidden"));
      return;
    }

    next();
  };
};
