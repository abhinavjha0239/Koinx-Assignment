require('dotenv').config();
const { initNats, closeNats } = require('./services/natsService');
const { initUpdateJob } = require('./jobs/updateJob');

let job = null;

/**
 * Start the worker server
 * This function initializes the NATS connection and starts the scheduled update job.
 * It also sets up a graceful shutdown mechanism to stop the job and close the NATS connection.
 */
async function startServer() {
  try {
    // Initialize NATS connection
    await initNats();

    // Initialize scheduled update job
    job = initUpdateJob();

    console.log('Worker server started successfully');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down worker server...');

      // Stop the scheduled job if it exists
      if (job) {
        job.stop();
        console.log('Scheduled job stopped');
      }

      // Close NATS connection
      await closeNats();

      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting worker server:', error.message);
    process.exit(1);
  }
}

startServer();