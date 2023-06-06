// Router para los endpoints servidos al cliente estándar

import { Router } from "express";
import { handleNewRequest, getWaitingInfo, transferRenderedImage } from "../controllers/requestsController.js";
import { upload } from "../constants/multerConfig.js";

const router = Router();

// GET /requests/:requestId
router.get("/:requestId", transferRenderedImage);

// POST /requests
router.post("", upload.single("model"), handleNewRequest);

// GET /requests/:requestId/time
router.get("/:requestId/info", getWaitingInfo);

export default router;
