const db = require("../../../models");

const createTriggerFunction_notifs = async () => {
  await db.sequelize.query(`
    CREATE OR REPLACE FUNCTION admin.notify_content_validated() 
    RETURNS trigger AS $$
    DECLARE
        content_title VARCHAR;
        topic_name VARCHAR;
        error_message TEXT;
        error_severity TEXT;
    BEGIN
        -- Log a message when the trigger fires
        RAISE NOTICE 'Trigger notify_content_validated fired for content_type: %, content_real_id: %', NEW.content_type, NEW.content_real_id;


        -- Determine the content type and fetch the relevant details
        IF NEW.content_type = 'Event' THEN
            SELECT e.name, s.title 
            INTO content_title, topic_name 
            FROM dynamic_content.events e 
            JOIN static_content.sub_area s 
            ON e.sub_area_id = s.sub_area_id
            WHERE e.event_id = NEW.content_real_id;
        ELSIF NEW.content_type = 'Forum' THEN
            SELECT f.title, s.title 
            INTO content_title, topic_name 
            FROM dynamic_content.forums f 
            JOIN static_content.sub_area s 
            ON f.sub_area_id = s.sub_area_id
            WHERE f.forum_id = NEW.content_real_id;
        ELSIF NEW.content_type = 'Post' THEN
            SELECT p.title, s.title 
            INTO content_title, topic_name 
            FROM dynamic_content.posts p 
            JOIN static_content.sub_area s 
            ON p.sub_area_id = s.sub_area_id
            WHERE p.post_id = NEW.content_real_id;
        ELSE
            RAISE EXCEPTION 'Unknown content type: %', NEW.content_type;
        END IF;

        -- Notify the application with the content title and subarea name (topic name)
        PERFORM pg_notify('content_validated', content_title || ',' || topic_name || ',' || NEW.content_type);
        RETURN NEW;

        EXCEPTION
    WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS 
            error_message = MESSAGE_TEXT,
            error_severity = RETURNED_SQLSTATE; -- Correct variable name
        RAISE NOTICE 'Error: %', error_message;
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `);
};

const createTrigger_notifyServer = async () => {
  await db.sequelize.query(`
    DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_content_validation_trigger') THEN
                DROP TRIGGER trg_content_validation_trigger ON admin.content_validation_status;
            END IF;

            CREATE TRIGGER trg_content_validation_trigger
            AFTER INSERT OR UPDATE OF content_status ON admin.content_validation_status
            FOR EACH ROW
            WHEN (NEW.content_status = 'Approved')
            EXECUTE FUNCTION admin.notify_content_validated();
        END 
    $$;
  `);
};

module.exports = {
  createTriggerFunction_notifs,
  createTrigger_notifyServer,
};
