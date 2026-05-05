import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApiResponse } from "./Api/ApiResponse";
import UserRouter from "./routes/user.route";
import MemberRouter from "./routes/member.route";
import AdminRouter from "./routes/admin.route";

const server = express();
const isProduction = process.env.NODE_ENV === "production";

const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost",
  "http://127.0.0.1:3000",
  "http://127.0.0.1",
  ...configuredOrigins,
]);

server.use(express.json());
server.use(cookieParser());
server.set("trust proxy", 1);
server.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      if (isProduction && /\.vercel\.app$/.test(new URL(origin).hostname)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
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
  },
);

export default server;
