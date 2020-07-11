'use strict';
module.exports = (sequelize, DataTypes) => {
  const demographics = sequelize.define('demographics', {
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    demographic: DataTypes.STRING
  }, {});
  demographics.associate = function (models) {
    demographics.belongsTo(models.subject)
  };
  return demographics;
};