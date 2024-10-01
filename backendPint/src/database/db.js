require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    dialect: process.env.DB_DIALECT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: console.log, // Enable logging to see SQL queries
    pool: {
        max: 15,       // Increase max connections
        min: 5,        // Ensure a minimum number of connections are always available
        acquire: 60000, // Increase acquire timeout
        idle: 10000    // Time before an idle connection is released
      }
});

module.exports = sequelize;
