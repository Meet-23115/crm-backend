import { Request, Response, NextFunction } from "express";

// Async handler wrapper
export const asyncHandler = (fn: (req: Request, res: Response, next?: NextFunction) => Promise<void | Response<any>>) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
