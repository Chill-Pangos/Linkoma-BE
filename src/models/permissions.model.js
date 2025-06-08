const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Permissions = db.define(
  "Permissions",
  {
    permissionId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "employee", "resident"),
      allowNull: false,
    },
    permissionKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "Permissions",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
      {
        unique: true,
        fields: ["role", "permissionKey"],
      },
    ],
  }
);

module.exports = Permissions;
