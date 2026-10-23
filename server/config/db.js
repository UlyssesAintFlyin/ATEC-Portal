const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_CA
    ? { ca: process.env.DB_CA, rejectUnauthorized: true }
    : undefined,
  connectTimeout: 20000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const APP_SQL_MODE =
  'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

pool.pool.on('connection', (conn) => {
  conn.query(`SET SESSION sql_mode = '${APP_SQL_MODE}'`);
});

module.exports = pool;
