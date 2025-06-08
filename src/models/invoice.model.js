const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Invoice = db.define(
  "Invoice",
  {
    invoiceId: {
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
    rentFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    serviceFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Unpaid", "Paid"),
      allowNull: false,
      defaultValue: "Unpaid",
    },
  },
  {
    tableName: "Invoice",
    timestamps: true, 
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = Invoice;
