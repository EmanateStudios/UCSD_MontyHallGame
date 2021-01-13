'use strict';
module.exports = (sequelize, DataTypes) => {
  const trial = sequelize.define('trial', {
    trialIteration: DataTypes.INTEGER,
    level: DataTypes.INTEGER,
    round: DataTypes.INTEGER,
    score: DataTypes.INTEGER,
    pReward: DataTypes.FLOAT,
    xClick: DataTypes.FLOAT,
    yClick:DataTypes.FLOAT,
    door:DataTypes.INTEGER,
    success: DataTypes.INTEGER,
    abandonedPage: DataTypes.BOOLEAN,
    version: DataTypes.INTEGER
  }, {});
  trial.associate = function (models) {
    trial.belongsTo(models.subject)
  };
  return trial;
};