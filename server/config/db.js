const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: process.env.DB_CA,             
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("DB_HOST:", JSON.stringify(process.env.DB_HOST));
console.log("DB_PORT:", JSON.stringify(process.env.DB_PORT));
console.log("DB_USER:", JSON.stringify(process.env.DB_USER));
console.log("DB_NAME:", JSON.stringify(process.env.DB_NAME));
console.log("DB_CA set:", !!process.env.DB_CA);

module.exports = pool;
