const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

// GET /stats - Get latest stats for a specific coin
router.get('/stats', cryptoController.getStats);

// GET /deviation - Get standard deviation for a specific coin
router.get('/deviation', cryptoController.getDeviation);

// GET /log - Get last 800 lines of the server log
router.get('/log', cryptoController.getLog);

// POST /update - Manually trigger stats update
router.post('/update', cryptoController.updateStats);

// GET /update - Allow manual trigger via browser
router.get('/update', cryptoController.updateStats);

module.exports = router;