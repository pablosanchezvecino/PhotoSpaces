// Router para los endpoints relacionados con la administración de las peticiones de renderizado

import { Router } from "express";
import { getRequests, getRequestById, deleteRequest } from "../controllers/requestsController.js";

const router = Router();

// GET /requests
router.get("", getRequests);

// GET /requets/:id
router.get("/:id", getRequestById);

// DELETE /requests/:requestId
router.delete("/:id", deleteRequest);

export default router;
