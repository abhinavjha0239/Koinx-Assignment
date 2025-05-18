require('dotenv').config();
const express = require('express');
const { connectDB } = require('./utils/db');
const cryptoRoutes = require('./routes/cryptoRoutes');
const { initNats, closeNats } = require('./services/natsService');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Simple file logger: write all console logs to logs/server.log
const logDir = path.join(__dirname, '../logs');
const logFile = path.join(logDir, 'server.log');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
// Clear the log file on server start
fs.writeFileSync(logFile, '');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });
['log', 'error', 'warn'].forEach((method) => {
  const orig = console[method];
  console[method] = (...args) => {
    const msg = `[${new Date().toISOString()}] [${method.toUpperCase()}] ${args.join(' ')}\n`;
    logStream.write(msg);
    orig.apply(console, args);
  };
});

app.use(cryptoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT ;

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
      await require('./services/natsService').closeNats();
      await require('./utils/db').closeDB();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
}

startServer();