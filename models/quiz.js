'use strict';
module.exports = (sequelize, DataTypes) => {
  const quiz = sequelize.define('quiz', {
    startTime_quiz: DataTypes.DATE,
    endTime_quiz: DataTypes.DATE
  }, {});
  quiz.associate = function (models) {
    quiz.belongsTo(models.subject)
  };
  return quiz;
};