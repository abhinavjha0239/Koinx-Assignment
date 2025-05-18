const axios = require('axios');
const CryptoStat = require('../models/CryptoStat');

/**
 * Fetch crypto data from CoinGecko API
 * @param {string} coinId - The ID of the coin in CoinGecko API
 * @returns {Promise<Object>} - The cryptocurrency data
 */
async function fetchCryptoData(coinId) {
  try {
    const url = `${process.env.COINGECKO_API_URL}/coins/${coinId}`;
    const response = await axios.get(url, {
      headers: {
        'accept': 'application/json',
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
      },
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    });
    const { market_data } = response.data;
    return {
      coin: coinId,
      price: market_data.current_price.usd,
      marketCap: market_data.market_cap.usd,
      change24h: market_data.price_change_percentage_24h
    };
  } catch (error) {
    console.error(`Error fetching data for ${coinId}:`, error.message);
    throw new Error(`Failed to fetch data for ${coinId}`);
  }
}

/**
 * Store cryptocurrency stats in the database
 */
async function storeCryptoStats() {
  // CoinGecko IDs and DB IDs
  const coins = [
    { id: 'bitcoin', dbId: 'bitcoin' },
    { id: 'ethereum', dbId: 'ethereum' },
    { id: 'matic-network', dbId: 'matic-network' }
  ];
  try {
    const promises = coins.map(async (coin) => {
      try {
        const data = await fetchCryptoData(coin.id);
        const cryptoStat = new CryptoStat({
          coin: coin.dbId,
          price: data.price,
          marketCap: data.marketCap,
          change24h: data.change24h
        });
        await cryptoStat.save();
        console.log(`Stored ${coin.dbId} stats: $${data.price.toFixed(2)}`);
        return data;
      } catch (error) {
        // Fallback for matic-network if needed
        if (coin.id === 'matic-network') {
          try {
            console.log('Trying fallback from matic-network to polygon...');
            const altData = await fetchCryptoData('polygon');
            const cryptoStat = new CryptoStat({
              coin: coin.dbId,
              price: altData.price,
              marketCap: altData.marketCap,
              change24h: altData.change24h
            });
            await cryptoStat.save();
            console.log(`Stored ${coin.dbId} stats: $${altData.price.toFixed(2)}`);
            return altData;
          } catch (altError) {
            console.error(`Error with both matic-network and polygon: ${altError.message}`);
            return null;
          }
        }
        console.error(`Error processing ${coin.id}: ${error.message}`);
        return null;
      }
    });
    const results = await Promise.all(promises);
    return results.filter(result => result !== null);
  } catch (error) {
    console.error('Error storing crypto stats:', error.message);
    throw error;
  }
}

/**
 * Get the latest stats for a specific coin
 * @param {string} coin - The coin ID
 * @returns {Promise<Object>} - The latest cryptocurrency stats
 */
async function getLatestStats(coin) {
  try {
    const latestStat = await CryptoStat.findOne({ coin })
      .sort({ timestamp: -1 })
      .lean();
    if (!latestStat) {
      throw new Error(`No stats found for ${coin}`);
    }
    return {
      price: latestStat.price,
      marketCap: latestStat.marketCap,
      "24hChange": latestStat.change24h
    };
  } catch (error) {
    console.error(`Error fetching latest stats for ${coin}:`, error.message);
    throw error;
  }
}

/**
 * Calculate the standard deviation of price for the last 100 records
 * @param {string} coin - The coin ID
 * @returns {Promise<number>} - The standard deviation
 */
async function calculateDeviation(coin) {
  try {
    const records = await CryptoStat.find({ coin })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('price')
      .lean();
    if (records.length === 0) {
      throw new Error(`No stats found for ${coin}`);
    }
    const prices = records.map(record => record.price);
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => {
      const diff = price - mean;
      return sum + (diff * diff);
    }, 0) / prices.length;
    return parseFloat(Math.sqrt(variance).toFixed(2));
  } catch (error) {
    console.error(`Error calculating deviation for ${coin}:`, error.message);
    throw error;
  }
}

module.exports = {
  fetchCryptoData,
  storeCryptoStats,
  getLatestStats,
  calculateDeviation
};