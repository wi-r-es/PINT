const db = require("../../../models");

const createTriggerFunction_create_album_for_area = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE FUNCTION dynamic_content.create_album_for_area()
        RETURNS TRIGGER AS $$
        DECLARE
            error_message TEXT;
            error_severity TEXT;
            error_state TEXT;
        BEGIN
                -- Insert a new album associated with the area
                INSERT INTO dynamic_content.albuns ( title, area_id)
                VALUES ( NEW.title, NEW.area_id); -- Use the area title as the album name

            RETURN NEW;
        EXCEPTION
            WHEN OTHERS THEN
                -- Capture the error details
                GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT,
                                        error_severity = RETURNED_SQLSTATE,
                                        error_state = PG_EXCEPTION_DETAIL;

                -- Log the error details 
                INSERT INTO security.error_log (error_message, error_severity, error_state, error_time)
                VALUES (error_message, error_severity, error_state, CURRENT_TIMESTAMP);

                -- Raise notice with error details (for debugging)
                RAISE NOTICE 'Error: %', error_message;

                RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    `);
};

const createTrigger_create_album_after_area_created = async () => {
  await db.sequelize.query(`
        DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_create_album_after_area_created') THEN
                DROP TRIGGER trg_create_album_after_area_created ON static_content.area;
            END IF;

            CREATE TRIGGER trg_create_album_after_area_created
            AFTER INSERT ON static_content.area
            FOR EACH ROW
            EXECUTE FUNCTION dynamic_content.create_album_for_area();
        END $$;
    `);
};

module.exports = {
  createTriggerFunction_create_album_for_area,
  createTrigger_create_album_after_area_created,
};
