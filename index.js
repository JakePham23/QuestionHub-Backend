// index.js
import express from "express";
import cors from "cors";
import examRoutes from "./src/routes/exams.js"; // <-- Import route mới
import dataRouter from "./src/routes/data_info.js"; // <-- Import route mới
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  })
);
app.use(express.json());
import "./src/db.js";

// Routes
app.use("/api", examRoutes); // <-- Sử dụng route mới với tiền tố /api
app.use("/api", dataRouter); // <-- Sử dụng route mới với tiền tố /api

app.listen(PORT, () => {
  console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});
