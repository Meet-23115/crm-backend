import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApiResponse } from "./Api/ApiResponse";
import UserRouter from "./routes/user.route";
import MemberRouter from "./routes/member.route";
import AdminRouter from "./routes/admin.route";

const server = express();

server.use(express.json());
server.use(cookieParser());
server.set("trust proxy", 1);

// Allow all origins
server.use(
  cors({
    origin: true, // reflect request origin
    credentials: true,
  })
);

server.get("/api", (_req: Request, res: Response) => {
  res.json(new ApiResponse(200, { ok: true }, "CRM API running"));
});

server.use("/api/user", UserRouter);
server.use("/api", MemberRouter);
server.use("/api/members", AdminRouter);

server.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json(new ApiResponse(500, null, err.message || "Server error"));
  }
);

export default server;