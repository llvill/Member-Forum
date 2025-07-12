const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'member_forum',
  password: 'Boy002boy002',
  port: 5432,
});

module.exports = pool;