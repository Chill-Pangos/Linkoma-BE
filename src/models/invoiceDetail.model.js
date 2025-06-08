const { DataTypes } = require("sequelize");
const db = require("../config/database");

const InvoiceDetail = db.define(
  "InvoiceDetail",
  {
    invoiceDetailId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
        references: {
            model: 'Invoice', 
            key: 'invoiceId'
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
    usage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    tableName: "InvoiceDetail",
    timestamps: true, 
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = InvoiceDetail;
