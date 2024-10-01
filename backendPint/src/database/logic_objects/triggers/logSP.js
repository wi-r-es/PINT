const db = require("../../../models");

const createFunction_logError = async () => {
  await db.sequelize.query(` 
    CREATE OR REPLACE FUNCTION security.log_error(error_message TEXT, error_severity TEXT, error_state TEXT)
    RETURNS VOID AS $$
    BEGIN
        -- Log the error details into the error log table
        INSERT INTO security.error_log (error_message, error_severity, error_state, error_time)
        VALUES (error_message, error_severity, error_state, CURRENT_TIMESTAMP);

        -- Raise the error to the caller
        -- RAISE EXCEPTION '%', error_message
        -- USING ERRCODE = error_severity, MESSAGE = error_message, DETAIL = 'Error state: ' || error_state::TEXT;
    END;
    $$ LANGUAGE plpgsql;
`);
};

module.exports = {
    createFunction_logError
};