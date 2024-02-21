"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      // define association here
      models.User.belongsToMany(models.Message, {
        through: models.Like,
        foreignKey: "userId",
        otherKey: "messageId",
      });
      models.Message.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: "messageId",
        otherKey: "userId",
      });
      models.Like.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      models.Like.belongsTo(models.Message, {
        foreignKey: "messageId",
        as: "message",
      });
    }
  }
  Like.init(
    {
      messageId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Message",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "User",
          key: "id",
        },
      },
      isLike: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Like",
    }
  );
  return Like;
};
