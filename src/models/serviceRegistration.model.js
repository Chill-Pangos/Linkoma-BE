const { DataTypes } = require("sequelize");
const db = require("../config/database");

const ServiceRegistration = db.define(
  "ServiceRegistration",
  {
    serviceRegistrationId: {
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
    serviceTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
          model: 'ServiceType',
          key: 'serviceTypeId'
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
    status: {
      type: DataTypes.ENUM("Active", "Inactive", "Cancelled"),
      allowNull: false,
      defaultValue: "Active",
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "ServiceRegistration",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = ServiceRegistration;
