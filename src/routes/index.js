import { Router } from "express";
const router = Router();
import authRoutes from "./auth/index.js";
import examRoutes from "./exams/index.js";
import imageRoutes from "./images/index.js";
router.use("/auth", authRoutes);
router.use("/", examRoutes);
router.use("/", imageRoutes);


export default router;