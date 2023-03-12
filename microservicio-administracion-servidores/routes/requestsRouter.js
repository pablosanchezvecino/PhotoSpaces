// Router para los endpoints relacionados con la administración de las peticiones de renderizado

const { Router } = require('express');
const requestsController = require('../controllers/requestsController');

const router = Router();

// GET /requests
router.get('', requestsController.getRequests);

module.exports = router;