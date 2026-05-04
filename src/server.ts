import express from "express";
import cookieParser from "cookie-parser";
import pool from "./utils/db";

const server = express();

server.use(express.json());
server.use(cookieParser());

import LoginRouter from "./routes/user.route";
import AdminRouter from "./routes/admin.route";

server.use("/api/admin", AdminRouter);

server.use("/api/user", LoginRouter);

export default server;
