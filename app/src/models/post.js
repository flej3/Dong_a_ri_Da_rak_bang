const { Sequelize, DataTypes } = require('sequelize');

const sequelizeInstance = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

const postModel = sequelizeInstance.define('post', {
  club_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recruit_num: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dead_day: {
    type: DataTypes.DATE,
    allowNull: false
  },
  image_route: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

module.exports = {
  post: postModel,
  sequelize: sequelizeInstance,
};