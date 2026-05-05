import dotenv from "dotenv";
import server from "./server";
import connectDb from "./utils/db";
import ensureDefaultAdmin from "./utils/ensureDefaultAdmin";

dotenv.config();

async function start() {
  try {
    await connectDb();
    await ensureDefaultAdmin();
    server.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

start();
