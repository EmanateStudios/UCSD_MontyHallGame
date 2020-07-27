'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('trials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      trialIteration: {
        type: Sequelize.INTEGER
      },
      score: {
        type: Sequelize.INTEGER
      },
      condition: {
        type: Sequelize.INTEGER
      },
      cursorX_exitOccluder: {
        type: Sequelize.FLOAT
      },
      cursorY_exitOccluder: {
        type: Sequelize.FLOAT
      },
      cursorX_enterOccluder: {
        type: Sequelize.FLOAT
      },
      cursorY_enterOccluder: {
        type: Sequelize.FLOAT
      },
      success: {
        type: Sequelize.INTEGER
      },
      bg_color: {
        type: Sequelize.STRING
      },
      eye_size: {
        type: Sequelize.FLOAT
      },
      eye_color: {
        type: Sequelize.STRING
      },
      mouth_w: {
        type: Sequelize.INTEGER
      },
      mouth_h: {
        type: Sequelize.INTEGER
      },
      horns_w: {
        type: Sequelize.INTEGER
      },
      horns_h: {
        type: Sequelize.INTEGER
      },
      exitDirection: {
        type: Sequelize.STRING
      },
      refreshedPage: {
        type: Sequelize.BOOLEAN
      },
      abandonedPage: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('trials');
  }
};