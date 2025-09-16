import { Router } from "express";
const router = Router();
import authRoutes from "./auth/index.js";
import examRoutes from "./exams/index.js";
import imageRoutes from "./images/index.js";
import exerciseRoutes from "./exercises/index.js";
import questionRoutes from "./questions/index.js";

import staticDataRoutes from "./static_data/index.js";


router.use("/", staticDataRoutes);
router.use("/auth", authRoutes);
router.use("/exams", examRoutes);
router.use("/", imageRoutes);
router.use("/exercises", exerciseRoutes);
router.use('/questions', questionRoutes);

export default router;