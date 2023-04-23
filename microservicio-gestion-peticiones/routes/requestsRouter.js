// Router para los endpoints servidos al cliente de usuarios finales

import { Router } from "express";
import { handleNewRequest } from "../controllers/requestsController.js";

const router = Router();

// POST /requests
router.post("", handleNewRequest);

export default router;
