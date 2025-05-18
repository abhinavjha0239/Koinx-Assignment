const cron = require('node-cron');
const { publishUpdateEvent } = require('../services/natsService');

/**
 * Initialize the scheduled update job
 * @returns {Object} - The cron job instance
 */
function initUpdateJob() {
  // Schedule job to run every 15 minutes
  const job = cron.schedule('*/15 * * * *', async () => {
    console.log(`Running scheduled update job at ${new Date().toISOString()}`);
    try {
      await publishUpdateEvent();
    } catch (error) {
      console.error('Error in scheduled update job:', error.message);
    }
  });

  job.start();
  console.log('Scheduled update job initialized to run every 15 minutes');

  // Run immediately on startup (after 5 seconds)
  setTimeout(async () => {
    console.log('Running initial update...');
    try {
      await publishUpdateEvent();
    } catch (error) {
      console.error('Error in initial update:', error.message);
    }
  }, 5000);

  return job;
}

module.exports = {
  initUpdateJob
};