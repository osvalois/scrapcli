const path = require('path');

module.exports = {
  version: '1.0.0',
  defaultMongoUri: 'mongodb://localhost:27017/scraper',
  defaultDbName: 'scraper',
  loggerPath: path.join(__dirname, 'utils', 'logger.js')
};