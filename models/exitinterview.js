'use strict';
module.exports = (sequelize, DataTypes) => {
  const exitInterview = sequelize.define('exitInterview', {
    finish_date_time: DataTypes.DATE,
    condition: DataTypes.INTEGER,
    hunch1: DataTypes.TEXT,
    hunch1_level: DataTypes.INTEGER,
    hunch2: DataTypes.TEXT,
    hunch2_level: DataTypes.INTEGER,
    hunch3: DataTypes.TEXT,
    hunch3_level: DataTypes.INTEGER,
    has_hunch: DataTypes.INTEGER,
    last_action: DataTypes.STRING,
    completed_block_100percent_after_trial: DataTypes.INTEGER,
    aborted: DataTypes.BOOLEAN,
    blur_1_seconds: DataTypes.BOOLEAN,
    blur_2_seconds: DataTypes.BOOLEAN,
    onTask: DataTypes.BOOLEAN,
    playMethod: DataTypes.STRING
  }, {});
  exitInterview.associate = function (models) {
    exitInterview.belongsTo(models.subject)
  };
  return exitInterview;
};