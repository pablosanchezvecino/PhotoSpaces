import { handleEstimatedRemainingProcessingTimeRequest } from "../controllers/timeController.js";
import { disable, enable, unbind, abort } from "../controllers/statusManagementController.js";
import { bind, handleRenderingRequest } from "../controllers/renderingController.js";
import { upload } from "../constants/multerConfig.js";
import { Router } from "express";

// Router para los endpoints del servidor de renderizado

const router = Router();

// POST /bind
router.post("/bind", bind);

// POST /unbind
router.post("/unbind", unbind);

// POST /render
router.post("/render", upload.single("model"), handleRenderingRequest);

// GET /time
router.get("/time", handleEstimatedRemainingProcessingTimeRequest);

// POST /abort
router.post("/abort", abort);

// POST /disable
router.post("/disable", disable);

// POST /enable
router.post("/enable", enable);


// POST /file
router.post("/file-transfer", upload.single("model"), (req, res) => {
  console.log(`Recibido fichero ${req.file.filename}`.magenta);
  res.status(200).send();
});

export default router;
