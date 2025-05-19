const mysql = require("mysql2/promise");
const config = require("./config");

const db = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 30,
  queueLimit: 0,
});

module.exports = db;
