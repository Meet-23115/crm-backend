import express from "express";
import cookieParser from "cookie-parser";
import pool from "./utils/db";

const server = express();

server.use(express.json());
server.use(cookieParser());

// server.get("/", async (req, res) => {
//   const start = Date.now();

//   await pool.query("SELECT NOW()", (err, result) => {
//     if (err) {
//       console.error("Error executing query:", err);
//       res.status(500).send("Internal Server Error");
//     } else {
//       res.send(result.rows[0]);
//     }
//   });
//   const end = Date.now();
//   console.log(`Query took ${end - start} ms`);
// });

export default server;
