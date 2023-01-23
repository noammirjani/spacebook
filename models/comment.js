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
      // define association here
    }
  }
  Comment.init({
    date: {
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        isDate: true,
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull:false,
    },
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