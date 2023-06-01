// Router para los endpoints relacionados con la administración de los servidores de renderizado

import { Router } from "express";
import {
  getServers,
  addServer,
  disableServer,
  enableServer,
  deleteServer,
} from "../controllers/serversController.js";

const router = Router();

// GET /servers
router.get("", getServers);

// POST /servers
router.post("", addServer);

// POST /servers/:id/disable
router.post("/:id/disable", disableServer);

// POST /servers/:id/enable
router.post("/:id/enable", enableServer);

// DELETE /servers/:id
router.delete("/:id", deleteServer);

export default router;
