import express from 'express';
import cors from 'cors';
// import examRoutes from './src/routes/exams.js'; // <-- Bỏ comment
import dataRouter from './src/routes/index.js'; // <-- Giữ nguyên

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      'https://questionhub-education.vercel.app' // Thêm domain của Vercel
    ],
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

// --- Routes ---
app.use('/api', dataRouter); 
app.listen(PORT, () => {
  console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});