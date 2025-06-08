const { DataTypes } = require("sequelize");
const db = require("../config/database");

const ServiceType = db.define(
  "ServiceType",
  {
    serviceTypeId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    serviceName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    tableName: "ServiceType",
    timestamps: true, 
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = ServiceType;
