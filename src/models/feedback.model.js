const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Feedback = db.define(
  "Feedback",
  {
    feedbackId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
        references: {
            model: 'User',
            key: 'userId'
        }
    },
    category: {
      type: DataTypes.ENUM("Maintenance", "Service", "Complaint"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Resolved", "Rejected", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending",
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "Feedback",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = Feedback;
