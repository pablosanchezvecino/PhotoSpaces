import express from "express";
import { totalEstimated } from "../services/timeService.js";
const router = express.Router();

router.get("/", totalEstimated);

export default router;
