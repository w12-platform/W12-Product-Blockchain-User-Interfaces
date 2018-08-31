const DB = require('node-json-db');
const path = require('path');

module.exports = {
  db: new DB(path.join(__dirname, 'data/db.json'), true, true),
  // DB methods
};
