import server from "./server";
import dotenv from "dotenv";
import connectDb from "./utils/db";

dotenv.config();

try {
  connectDb().then(() => {
    server.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  });
} catch (error) {
  console.error("Error starting server:", error);
}
