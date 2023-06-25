// Router para los endpoints relacionados con la administración de los servidores de renderizado

import { Router } from "express";
import {
  getServers,
  getServerById,
  addServer,
  disableServer,
  enableServer,
  deleteServer,
  abortServer
} from "../controllers/serversController.js";

const router = Router();

// GET /servers
router.get("", getServers);

// GET /servers/:id
router.get("/:id", getServerById);

// POST /servers
router.post("", addServer);

// POST /servers/:id/disable
router.post("/:id/disable", disableServer);

// POST /servers/:id/enable
router.post("/:id/enable", enableServer);

// POST /servers/:id/abort
router.post("/:id/abort", abortServer);

// DELETE /servers/:id
router.delete("/:id", deleteServer);

export default router;
