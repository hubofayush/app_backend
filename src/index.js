import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({ path: "./env" });

connectDB();

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";

// import express from "express";
// const app = express();
// // iffe function
// // immediate run
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
//     app.on("eroor", (error) => {
//       console.log("ERROR ON DB CONNECTION ", error);
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     throw error;
//   }
// })();
