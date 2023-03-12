// Router para los endpoints servidos al cliente de usuarios finales

const { Router } = require('express');
const requestsController = require('../controllers/requestsController');

const router = Router();

// POST /requests
router.post('', requestsController.handleNewRequest);

module.exports = router;