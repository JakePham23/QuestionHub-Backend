// index.js
import express from 'express';
import cors from 'cors';
import path from 'path'; // Thêm import path
import { fileURLToPath } from 'url'; // Thêm import fileURLToPath

// import examRoutes from './src/routes/exams.js'; // <-- Bỏ comment
import dataRouter from './src/routes/data_info.js'; // <-- Giữ nguyên

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Tùy chỉnh __dirname để tương thích với ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Phục vụ file tĩnh (ảnh) ---
// Thư mục 'public' sẽ chứa tất cả các file ảnh của bạn
app.use(express.static(path.join(__dirname, 'src/public')));

// --- Kết nối Database ---
import './src/db.js';

// --- Routes ---
// app.use('/api', examRoutes); // <-- Bỏ comment
app.use('/api', dataRouter); // <-- Giữ nguyên

app.listen(PORT, () => {
  console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});