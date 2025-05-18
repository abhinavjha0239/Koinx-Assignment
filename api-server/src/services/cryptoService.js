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
  const latestStat = await CryptoStat.findOne({ coin })
    .sort({ timestamp: -1 })
    .lean();
  if (!latestStat) {
    return null;
  }
  return {
    price: latestStat.price,
    marketCap: latestStat.marketCap,
    "24hChange": latestStat.change24h
  };
}

module.exports = {
  storeCryptoStats,
  getLatestStats
};