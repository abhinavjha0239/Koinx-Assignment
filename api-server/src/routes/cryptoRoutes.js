const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

// GET /stats - Get latest stats for a specific coin
router.get('/stats', cryptoController.getStats);

// GET /deviation - Get standard deviation for a specific coin
router.get('/deviation', cryptoController.getDeviation);

// GET /log - Get last 800 lines of the server log
router.get('/log', cryptoController.getLog);

module.exports = router;