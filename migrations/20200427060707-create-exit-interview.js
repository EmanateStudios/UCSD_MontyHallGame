'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('exitInterviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      finish_date_time: {
        type: Sequelize.DATE
      },
      condition: {
        type: Sequelize.INTEGER
      },
      hunch1: {
        type: Sequelize.TEXT
      },
      hunch1_level: {
        type: Sequelize.INTEGER
      },
      hunch2: {
        type: Sequelize.TEXT
      },
      hunch2_level: {
        type: Sequelize.INTEGER
      },
      hunch3: {
        type: Sequelize.TEXT
      },
      hunch3_level: {
        type: Sequelize.INTEGER
      },
      has_hunch: {
        type: Sequelize.INTEGER
      },
      last_action: {
        type: Sequelize.STRING
      },
      completed_block_100percent_after_trial: {
        type: Sequelize.INTEGER
      },
      aborted: {
        type: Sequelize.BOOLEAN
      },
      blur_1_seconds: {
        type: Sequelize.BOOLEAN
      },
      blur_2_seconds: {
        type: Sequelize.BOOLEAN
      },
      onTask: {
        type: Sequelize.BOOLEAN
      },
      playMethod: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('exitInterviews');
  }
};