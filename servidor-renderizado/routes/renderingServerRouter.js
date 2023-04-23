// Router para los endpoints del servidor de renderizado

import { Router } from "express";
import { test, handleRenderingRequest } from "../controllers/renderingController.js";
import { disable, enable } from "../controllers/statusManagementController.js";

const router = Router();

// POST /test
router.get("/test", test);

// POST /render
router.post("/render", handleRenderingRequest);

// POST /disable
router.post("/disable", disable);

// POST /enable
router.post("/enable", enable);

export default router;
