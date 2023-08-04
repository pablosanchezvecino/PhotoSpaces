import { handleEstimatedRemainingProcessingTimeRequest } from "../controllers/infoController.js";
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

// GET /info
router.get("/info", handleEstimatedRemainingProcessingTimeRequest);

// POST /abort
router.post("/abort", abort);

// POST /disable
router.post("/disable", disable);

// POST /enable
router.post("/enable", enable);


// POST /file-transfer
router.post("/file-transfer", upload.single("model"), (req, res) => {
  console.log(`Recibido fichero ${req.file.filename}`.magenta);
  res.status(200).send({ message: "Fichero recibido con éxito" });
});

export default router;
