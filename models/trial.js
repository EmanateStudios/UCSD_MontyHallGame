'use strict';
module.exports = (sequelize, DataTypes) => {
  const trial = sequelize.define('trial', {
    trialIteration: DataTypes.INTEGER,
    score: DataTypes.INTEGER,
    condition: DataTypes.INTEGER,
    cursorX_exitOccluder: DataTypes.FLOAT,
    cursorY_exitOccluder: DataTypes.FLOAT,
    cursorX_enterOccluder: DataTypes.FLOAT,
    cursorY_enterOccluder: DataTypes.FLOAT,
    success: DataTypes.INTEGER,
    bg_color: DataTypes.STRING,
    eye_size: DataTypes.FLOAT,
    eye_color: DataTypes.STRING,
    mouth_w: DataTypes.INTEGER,
    mouth_h: DataTypes.INTEGER,
    horns_w: DataTypes.INTEGER,
    horns_h: DataTypes.INTEGER,
    exitDirection: DataTypes.STRING,
    refreshedPage: DataTypes.BOOLEAN,
    abandonedPage: DataTypes.BOOLEAN,
  }, {});
  trial.associate = function (models) {
    trial.belongsTo(models.subject)
  };
  return trial;
};