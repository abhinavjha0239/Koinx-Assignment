require('dotenv').config();
const express = require('express');
const { connectDB } = require('./utils/db');
const { initLogger } = require('./utils/logger');
const cryptoRoutes = require('./routes/cryptoRoutes');
const cryptoRoutesV2 = require('./routes/cryptoRoutesV2');
const { initNats, closeNats } = require('./services/natsService');

// Initialize logger first
initLogger(true); // true = clear log on startup

const app = express();
app.use(express.json());

// Routes
app.use('/api/v1', cryptoRoutes);
app.use('/api/v2', cryptoRoutesV2);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT;

async function startServer() {
  try {
    console.log('Starting API server...');
    await connectDB();
    console.log('MongoDB connected successfully');

    await initNats();
    console.log('NATS connected successfully');
    console.log('Listening for crypto.update events...');

    app.listen(PORT, () => {
      console.log(`API Server running on port ${PORT}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down API server...');
      await closeNats();
      await require('./utils/db').closeDB();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
}

startServer();