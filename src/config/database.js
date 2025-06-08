const sequelize = require("sequelize");
const config = require("./config");

const db = new sequelize.Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: "mysql",
    port: config.port,
    logging: false,
    dialectOptions:{
      ssl: {
        rejectUnauthorized: true
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
  }
);

module.exports = db;
