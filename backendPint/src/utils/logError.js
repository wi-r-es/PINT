const { QueryTypes } = require('sequelize');
const db = require('../models/');

async function log_err(error) {
  try {
    // Call the PostgreSQL function to log the error and raise an exception
    await db.sequelize.query(
      `SELECT security.log_error(:errorMessage, :errorSeverity, :errorState);`,
      {
        replacements: {
          errorMessage: error,
          errorSeverity: 'ERROR',  
          errorState: '1000',       
        },
        type: QueryTypes.SELECT,
      }
    );
  } catch (loggingError) {
    console.error('Error logging the error:', loggingError.message);
    throw loggingError;
  }
}


module.exports = {log_err}; 