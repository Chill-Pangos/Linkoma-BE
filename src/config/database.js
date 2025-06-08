const { Sequelize} = require("sequelize");
const config = require("./config");

const db = new Sequelize(config.mysql.database, config.mysql.username, config.mysql.password, {
  host: config.mysql.host,
  dialect: "mysql",
  port: config.mysql.port,
  logging: false,
  dialectOptions: {
    ssl: {
      ca: config.mysql.ca.replace(/\\n/g, '\n'), 
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = db;
