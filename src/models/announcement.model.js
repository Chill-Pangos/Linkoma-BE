const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Announcement = db.define(
  "Announcement",
  {
    announcementId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    author: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "User",
        key: "userId",
      },
    },
  },
  {
    tableName: "Announcement",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = Announcement;
