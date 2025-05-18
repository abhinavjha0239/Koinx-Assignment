const { connect } = require('nats');

let natsConnection = null;

/**
 * Initialize NATS connection
 * @returns {Promise<Object>}
 */
async function initNats() {
  try {
    console.log('Connecting to NATS server...');
    natsConnection = await connect({ servers: process.env.NATS_URL });
    console.log(`Connected to ${natsConnection.getServer()}`);
    return natsConnection;
  } catch (error) {
    console.error('Error connecting to NATS:', error.message);
    throw error;
  }
}

/**
 * Publish update event to NATS
 * @returns {Promise<void>}
 */
async function publishUpdateEvent() {
  if (!natsConnection) {
    throw new Error('NATS connection not initialized');
  }
  try {
    const message = JSON.stringify({ trigger: 'update' });
    natsConnection.publish('crypto.update', Buffer.from(message));
    console.log('Published update event to crypto.update');
  } catch (error) {
    console.error('Error publishing event:', error.message);
    throw error;
  }
}

/**
 * Close NATS connection
 * @returns {Promise<void>}
 */
async function closeNats() {
  if (natsConnection) {
    await natsConnection.drain();
    console.log('NATS connection closed');
  }
}

module.exports = {
  initNats,
  publishUpdateEvent,
  closeNats
};