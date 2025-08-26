import express from 'express';
import cors from 'cors';
import path from 'path'; // Thêm import path
import { fileURLToPath } from 'url'; // Thêm import fileURLToPath

// import examRoutes from './src/routes/exams.js'; // <-- Bỏ comment
import dataRouter from './src/routes/data_info.js'; // <-- Giữ nguyên
import authRouter from './src/routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Tùy chỉnh __dirname để tương thích với ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Phục vụ file tĩnh (ảnh) ---
// Thư mục 'public' sẽ chứa tất cả các file ảnh của bạn
app.use(express.static(path.join(__dirname, 'src/public')));

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

// --- Routes ---
// app.use('/api', examRoutes); // <-- Bỏ comment
app.use('/api', dataRouter); // <-- Giữ nguyên
app.use('/api', authRouter)
app.listen(PORT, () => {
  console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});