const cryptoService = require('../services/cryptoService');

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


module.exports = {
  getStats,
  getDeviation
};