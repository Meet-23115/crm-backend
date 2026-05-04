import express from "express";
import cookieParser from "cookie-parser";
import pool from "./utils/db";
import cors from "cors";
const server = express();

server.use(express.json());
server.use(cookieParser());
server.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost"],
    credentials: true,
  }),
);

import LoginRouter from "./routes/user.route";
import AdminRouter from "./routes/admin.route";

server.use("/api/admin", AdminRouter);

server.use("/api/user", LoginRouter);

export default server;
