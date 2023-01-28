'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Comments.belongsTo(models.User,{
        foreignKey: 'user_id'
      });
    }
  }
  Comments.init({
    user_id:  DataTypes.INTEGER,
    date: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isDate: true,
      }
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
    modelName: 'Comments',
  });
  return Comments;
};