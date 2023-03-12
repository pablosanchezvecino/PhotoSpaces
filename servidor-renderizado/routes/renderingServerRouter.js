// Router para los endpoints del servidor de renderizado
const { Router } = require('express');
const renderingController = require('../controllers/renderingController');
const statusManagementController = require('../controllers/statusManagementController');

const router = Router();

// POST /test
router.get('/test', renderingController.test);

// TODO
// POST /render
// router.post('', renderingServerController.render);

// POST /disable
router.post('/disable', statusManagementController.disable);

// POST /enable
router.post('/enable', statusManagementController.enable);

module.exports = router;