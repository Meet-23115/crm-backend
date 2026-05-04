import server from "./server";
import dotenv from "dotenv";

dotenv.config();

try {
    server.listen(8080, () => {
        console.log("Server is running on port 8080");
    });
} catch (error) {
    console.error("Error starting server:", error);
}