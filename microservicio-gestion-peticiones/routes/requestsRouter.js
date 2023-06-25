
import { handleNewRequest, getWaitingInfo, transferRenderedImage } from "../controllers/requestsController.js";
import { upload } from "../constants/multerConfig.js";
import { Router } from "express";

// Router para los endpoints servidos al cliente estándar

const router = Router();

// GET /requests/:id
router.get("/:id", transferRenderedImage);

// POST /requests
// router.post("", upload.single("model"), handleNewRequest);

// POST /requests
router.post("", (req, res) => {
  try {
    upload.single("model")(req, res, (err) => {
      // MIME Type no válido o archivo que sobrepasa el límite de tamaño  
      if (err) {
        console.error(`Archivo no válido detectado por multer. ${err.message}`.red);
        res.status(400).json({ error: err.message });
        return;
      }
      // Todo bien de momento
      handleNewRequest(req, res);
    });
  } catch (error) {
    // Cualquier otro error relacionado con multer
    res.status(500).json({ error: error.message });
  }
});

// GET /requests/:requestId/time
router.get("/:requestId/info", getWaitingInfo);

export default router;
