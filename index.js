import express from 'express';
import cors from 'cors';
import dataRouter from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      'https://questionhub-education.vercel.app'
    ],
    optionsSuccessStatus: 200,
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

// Add this middleware to ensure the header is always set
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// --- Routes ---
app.use('/api', dataRouter); 

app.listen(PORT, () => {
  console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});