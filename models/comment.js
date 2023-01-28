'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Comment.belongsTo(models.user,{
        foreignKey: 'user_id'
      });
    }
  }
  Comment.init({
    user_id:  DataTypes.INTEGER,
    text: {
      type: DataTypes.STRING,
      trim: true,
      allowNull:false,
      validate:{
        min:1, max:128
      }
    },
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Comment',
  });
  return Comment;
};