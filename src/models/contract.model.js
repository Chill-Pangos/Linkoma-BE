const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Contract = db.define(
  "Contract",
  {
    contractId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    apartmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
        references: {
            model: 'Apartment',
            key: 'apartmentId'
        }
    },
    startDate: {
      type: DataTypes.DATEONLY, 
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "Contract",
    timestamps: true, 
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = Contract;
