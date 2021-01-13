'use strict';
module.exports = (sequelize, DataTypes) => {
  const subject = sequelize.define('subject', {
    startTime_consent: DataTypes.DATE,
    endTime_consent: DataTypes.DATE,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    wantsConsentEmailed: DataTypes.BOOLEAN,
    screenWidth: DataTypes.INTEGER,
    screenHeight: DataTypes.INTEGER,
    userAgent: DataTypes.STRING,
    version: DataTypes.INTEGER
  }, {});
  subject.associate = function (models) {
    subject.hasMany(models.trial);
    subject.hasOne(models.exitInterview)
    subject.hasMany(models.quiz)
  };
  return subject;
};