import { handleEstimatedRemainingProcessingTimeRequest } from "../controllers/timeController.js";
import { disable, enable, unbind, abort } from "../controllers/statusManagementController.js";
import { test, handleRenderingRequest } from "../controllers/renderingController.js";
import { upload } from "../constants/multerConfig.js";
import { Router } from "express";

// Router para los endpoints del servidor de renderizado

const router = Router();

// POST /test
router.get("/test", test);

// POST /render
router.post("/render", upload.single("model"), handleRenderingRequest);

// POST /abort
router.post("/abort", abort);

// GET /time
router.get("/time", handleEstimatedRemainingProcessingTimeRequest);

// POST /disable
router.post("/disable", disable);

// POST /enable
router.post("/enable", enable);

// POST /unbind
router.post("/unbind", unbind);


export default router;
