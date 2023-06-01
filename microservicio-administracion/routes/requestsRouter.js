// Router para los endpoints relacionados con la administración de las peticiones de renderizado

import { Router } from "express";
import { getRequests, deleteRequest } from "../controllers/requestsController.js";

const router = Router();

// GET /requests
router.get("", getRequests);

// DELETE /requests/:requestId
router.delete("/:id", deleteRequest);

export default router;
