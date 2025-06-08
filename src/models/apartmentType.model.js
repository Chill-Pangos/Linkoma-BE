const { DataTypes } = require("sequelize");
const db = require("../config/database");

const ApartmentType = db.define(
  "ApartmentType",
  {
    apartmentTypeId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    typeName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    area: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    numBedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    numBathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rentFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "ApartmentType",
    timestamps: true, 
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = ApartmentType;
