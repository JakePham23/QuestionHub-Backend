import { Router } from "express";
const router = Router();
import authRoutes from "./auth/index.js";
import examRoutes from "./exams/index.js";
import imageRoutes from "./images/index.js";
import exerciseRoutes from "./exercises/index.js";
router.use("/auth", authRoutes);
router.use("/", examRoutes);
router.use("/", imageRoutes);
router.use("/exercises", exerciseRoutes);


export default router;