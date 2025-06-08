const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Tokens = db.define(
  "Tokens",
  {
    tokenId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "userId",
      },
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Tokens",
    timestamps: true, 
    createdAt: "createdAt",
    updatedAt: "updatedAt", 
  }
);

module.exports = Tokens;
