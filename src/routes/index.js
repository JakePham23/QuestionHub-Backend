import { Router } from "express";
const router = Router();
import authRoutes from "./auth/index.js";
import examRoutes from "./exams/index.js";

router.use("/auth", authRoutes);
router.use("/", examRoutes);

export default router;