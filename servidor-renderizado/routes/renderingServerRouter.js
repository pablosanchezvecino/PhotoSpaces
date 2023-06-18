// Router para los endpoints del servidor de renderizado

import { Router } from "express";
import { test, handleRenderingRequest } from "../controllers/renderingController.js";
import { disable, enable, unbind } from "../controllers/statusManagementController.js";
import { handleEstimatedRemainingProcessingTimeRequest } from "../controllers/timeController.js";
import { upload } from "../constants/multerConfig.js";

const router = Router();

// POST /test
router.get("/test", test);

// POST /render
router.post("/render", upload.single("model"), handleRenderingRequest);

// GET /time
router.get("/time", handleEstimatedRemainingProcessingTimeRequest);

// POST /disable
router.post("/disable", disable);

// POST /enable
router.post("/enable", enable);

// POST /unbind
router.post("/unbind", unbind);

// POST /abort
// router.post("/abort", abort);

export default router;
