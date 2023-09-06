import { getRequests, getRequestById, getRequestRenderedImage, deleteRequest, handleReceivedImage } from "../controllers/requestsController.js";
import { upload } from "../constants/multerConfig.js";
import { Router } from "express";

// Router para los endpoints relacionados con la administración de las peticiones de renderizado

const router = Router();

// GET /requests
router.get("", getRequests);

// GET /requests/:id
router.get("/:id", getRequestById);

// GET /requests/:id/rendered-image
router.get("/:id/rendered-image", getRequestRenderedImage);

// DELETE /requests/:id
router.delete("/:id", deleteRequest);

// POST /requests/:id/rendered-image
router.post("/:id/rendered-image", upload.single("renderedImage"), handleReceivedImage);

export default router;
