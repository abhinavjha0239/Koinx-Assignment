const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

// GET /update - Manually trigger store crypto stats (for browser usage)
router.get('/update', cryptoController.updateStats);

// POST /update - Manually trigger store crypto stats (for API usage)
router.post('/update', cryptoController.updateStats);

module.exports = router;
