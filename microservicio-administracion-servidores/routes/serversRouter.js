// Router para los endpoints relacionados con la administración de los servidores de renderizado

const { Router } = require('express');
const serversController = require('../controllers/serversController');

const router = Router();

// GET /servers
router.get('', serversController.getServers);

// POST /servers
router.post('', serversController.addServer);

// POST /servers/:id/disable
router.post('/:id/disable', serversController.disableServer);

// POST /servers/:id/enable
router.post('/:id/enable', serversController.enableServer);

// DELETE /servers/:id
router.delete('/:id', serversController.deleteServer);

module.exports = router;