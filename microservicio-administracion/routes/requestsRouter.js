// Router para los endpoints relacionados con la administración de las peticiones de renderizado

import { Router } from "express";
import { getRequests, getRequestById, getRequestRenderedImage, deleteRequest } from "../controllers/requestsController.js";

const router = Router();

// GET /requests
router.get("", getRequests);

// GET /requests/:id
router.get("/:id", getRequestById);

// GET /requests/:id/rendered-image
router.get("/:id/rendered-image", getRequestRenderedImage);

// DELETE /requests/:id
router.delete("/:id", deleteRequest);

export default router;
