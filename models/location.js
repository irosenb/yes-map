'use strict';

module.exports = (sequelize, DataTypes) => {
  var Location = sequelize.define('location', {
    latitude: DataTypes.FLOAT, 
    longitude: DataTypes.FLOAT,
  }, {});

  return Location; 
};