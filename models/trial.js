'use strict';
module.exports = (sequelize, DataTypes) => {
  const trial = sequelize.define('trial', {
    trialIteration: DataTypes.INTEGER,
    score: DataTypes.INTEGER,
    condition: DataTypes.INTEGER,
    success: DataTypes.INTEGER,
    refreshedPage: DataTypes.BOOLEAN,
    abandonedPage: DataTypes.BOOLEAN,
  }, {});
  trial.associate = function (models) {
    trial.belongsTo(models.subject)
  };
  return trial;
};