const fs = require('fs');
const path = require('path');

/**
 * Initialize the logger
 * @param {boolean} clearLog - Whether to clear the log on startup
 * @returns {void}
 */
function initLogger(clearLog = true) {
  const logDir = path.join(__dirname, '../../logs');
  const logFile = path.join(logDir, 'server.log');
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  if (clearLog) {
    // Clear the log file on server start
    fs.writeFileSync(logFile, '');
    console.log('Log file cleared');
  }
  
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  
  // Override console methods to write to log file
  ['log', 'error', 'warn'].forEach((method) => {
    const orig = console[method];
    console[method] = (...args) => {
      const timestamp = new Date().toISOString();
      const level = method.toUpperCase();
      const message = args.join(' ');
      const formattedMessage = `[${timestamp}] [${level}] ${message}\n`;
      
      // Write to log file
      logStream.write(formattedMessage);
      
      // Call original method
      orig.apply(console, args);
    };
  });
  
  console.log('Logger initialized');
}

/**
 * Get the path to the log file
 * @returns {string} - The path to the log file
 */
function getLogPath() {
  return path.join(__dirname, '../../logs/server.log');
}

module.exports = {
  initLogger,
  getLogPath
};
