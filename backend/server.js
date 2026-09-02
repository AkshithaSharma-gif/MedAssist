import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./APIs/AuthAPI.js";

import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;


// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


//routes
app.use("/api/auth", authRouter);


// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MedAssist API is running successfully",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MedAssist server running on port ${PORT}`);
});