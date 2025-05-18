const { connect } = require('nats');
const cryptoService = require('./cryptoService');

let natsConnection = null;

/**
 * Initialize NATS connection and set up subscription
 */
async function initNats() {
  try {
    console.log('Connecting to NATS server...');
    natsConnection = await connect({ servers: process.env.NATS_URL });
    console.log(`Connected to ${natsConnection.getServer()}`);

    // Subscribe to the crypto.update subject
    const subscription = natsConnection.subscribe('crypto.update');
    console.log('Subscribed to crypto.update events');

    (async () => {
      for await (const message of subscription) {
        const data = JSON.parse(message.data.toString());
        console.log('Received message:', data);
        if (data.trigger === 'update') {
          console.log('Trigger received, updating crypto stats...');
          try {
            await cryptoService.storeCryptoStats();
            console.log('Crypto stats updated successfully');
          } catch (error) {
            console.error('Error updating crypto stats:', error);
          }
        }
      }
    })();
  } catch (error) {
    console.error('Error connecting to NATS:', error.message);
    throw error;
  }
}

/**
 * Close NATS connection
 */
async function closeNats() {
  if (natsConnection) {
    await natsConnection.drain();
    console.log('NATS connection closed');
  }
}

module.exports = {
  initNats,
  closeNats
};