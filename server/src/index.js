import dotenv from "dotenv";
import connectDB from "./config/db.js";
import dns from "dns";

dotenv.config({ path: "./.env" });

const { app } = await import("./app.js");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`console is running at the port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongodb is not connected properly", err);
  });
