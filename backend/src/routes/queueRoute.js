import express from "express";
import { checkQueue } from "../services/queueService.js";
const router = express.Router();

router.get("/", checkQueue);

export default router;
