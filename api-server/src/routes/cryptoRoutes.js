const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

// GET /stats - Get latest stats for a specific coin
router.get('/stats', cryptoController.getStats);

module.exports = router;