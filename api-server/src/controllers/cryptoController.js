const cryptoService = require('../services/cryptoService');
const fs = require('fs');
const path = require('path');

/**
 * Get latest stats for a specific coin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getStats(req, res) {
  try {
    const { coin } = req.query;
    
    if (!coin) {
      return res.status(400).json({ error: 'Coin parameter is required' });
    }
    
    // Validate coin
    if (!['bitcoin', 'ethereum', 'matic-network'].includes(coin)) {
      return res.status(400).json({ 
        error: 'Invalid coin. Supported coins are: bitcoin, ethereum, matic-network'
      });
    }
    
    try {
      const stats = await cryptoService.getLatestStats(coin);
      return res.json(stats);
    } catch (error) {
      // If no stats found, trigger an update and inform the user
      if (error.message.includes('No stats found')) {
        try {
          // Try to fetch fresh data
          await cryptoService.storeCryptoStats();
          // Try again to get stats
          const stats = await cryptoService.getLatestStats(coin);
          return res.json(stats);
        } catch (fetchError) {
          return res.status(404).json({ 
            error: `No data available for ${coin}. Please try again later.`,
            details: fetchError.message
          });
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in getStats controller:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Calculate standard deviation for a specific coin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getDeviation(req, res) {
  try {
    const { coin } = req.query;
    
    if (!coin) {
      return res.status(400).json({ error: 'Coin parameter is required' });
    }
    
    // Validate coin
    if (!['bitcoin', 'ethereum', 'matic-network'].includes(coin)) {
      return res.status(400).json({ 
        error: 'Invalid coin. Supported coins are: bitcoin, ethereum, matic-network'
      });
    }
    
    const deviation = await cryptoService.calculateDeviation(coin);
    return res.json({ deviation });
  } catch (error) {
    console.error('Error in getDeviation controller:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Manually trigger store crypto stats
 */
async function updateStats(req, res) {
  try {
    await cryptoService.storeCryptoStats();
    return res.json({ message: 'Crypto stats updated successfully' });
  } catch (error) {
    console.error('Error in updateStats controller:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get last 800 lines of the server log
 */
async function getLog(req, res) {
  try {
    const logPath = path.resolve(__dirname, '../../logs/server.log');
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ error: 'Log file not found' });
    }
    const data = fs.readFileSync(logPath, 'utf-8');
    // Remove any trailing empty line for accurate count
    const lines = data.trimEnd().split('\n');
    const lastLines = lines.slice(-800).join('\n');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(lastLines);
  } catch (error) {
    console.error('Error reading logs:', error.message);
    res.status(500).json({ error: 'Failed to read logs', details: error.message });
  }
}

module.exports = {
  getStats,
  getDeviation,
  updateStats,
  getLog
};