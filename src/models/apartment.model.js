const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Apartment = db.define(
  "Apartment",
  {
    apartmentId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    apartmentTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ApartmentType',
            key: 'apartmentTypeId'
        }
    },
    floor: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('available', 'rented', 'maintenance'),
        allowNull: false,
        defaultValue: 'available', 
    },
  },
  {
    tableName: "Apartment",
    timestamps: true, 
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = Apartment;
