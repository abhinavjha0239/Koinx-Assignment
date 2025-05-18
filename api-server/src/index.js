const express = require('express');
const { connectDB } = require('./utils/db');
const cryptoRoutes = require('./routes/cryptoRoutes');

const app = express();
app.use(express.json());

app.use(cryptoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT ;

async function startServer() {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
    
    app.listen(PORT, () => {
      console.log(`API Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
}

startServer();