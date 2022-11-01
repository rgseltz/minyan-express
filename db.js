const { Client } = require('pg');
const { getDatabaseUri } = require('./config');

let DB_URI;
let db = new Client({ connectionString: getDatabaseUri() });
db.connect();

module.exports = db;
