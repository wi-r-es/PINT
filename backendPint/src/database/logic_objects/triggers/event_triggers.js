const db = require('../../../models'); 

const createTriggerFunction_trg_moderate_event_content = async () => {
    await db.sequelize.query(`

        CREATE OR REPLACE FUNCTION dynamic_content.trg_moderate_event_content()
        RETURNS TRIGGER AS $$
        DECLARE
            error_message TEXT;
            error_severity TEXT;
            error_state TEXT;
            eid INT;
            pid INT;
            aid INT;
        BEGIN
            RAISE NOTICE 'Trigger function started for event_id: %', NEW.event_id;

            -- Assign values from NEW to local variables
            eid := NEW.event_id;
            aid := NEW.admin_id;
            pid := NEW.publisher_id;

            BEGIN
                IF aid IS NULL THEN
                    RAISE NOTICE 'Admin ID is NULL, inserting validation status';
                    INSERT INTO admin.content_validation_status (content_real_id, content_type)
                    VALUES (eid, 'Event');
                ELSE
                    RAISE NOTICE 'Admin ID is NOT NULL, inserting approved validation status';
                    INSERT INTO admin.content_validation_status (content_real_id, content_type, content_status, validator_id, validation_date)
                    VALUES (eid, 'Event', 'Approved', aid, CURRENT_TIMESTAMP);

                    RAISE NOTICE 'Updating event record with admin ID';
                    UPDATE dynamic_content.events
                    SET admin_id = aid
                    WHERE event_id = eid;

                    -- RAISE NOTICE 'Inserting into control.participation';
                    -- INSERT INTO control.participation(user_id, event_id, entry_date)
                    -- VALUES (pid, eid, CURRENT_TIMESTAMP);

                    RAISE NOTICE 'Inserting score for the new event';
                    --INSERT INTO dynamic_content.scores(event_id, score)
                    --VALUES (eid, 0);

                    --C
                END IF;

                

            EXCEPTION
                WHEN OTHERS THEN
                    GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT,
                                            error_severity = RETURNED_SQLSTATE,
                                            error_state = PG_EXCEPTION_DETAIL;
                    RAISE NOTICE 'Error: %', error_message;
                    RETURN NULL;
            END;

            RAISE NOTICE 'Trigger function completed for event_id: %', eid;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);
};



const createTrigger_createEvent = async () => {
    await db.sequelize.query(`
            DO $$ 
            BEGIN
            IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_moderate_event_content') THEN
                DROP TRIGGER trg_moderate_event_content ON dynamic_content.events;
            END IF;
            CREATE TRIGGER trg_moderate_event_content
            AFTER INSERT ON dynamic_content.events
            FOR EACH ROW
            EXECUTE FUNCTION dynamic_content.trg_moderate_event_content();
            END $$;
    `);
};




const sp_for_next_trigger = async () => {
    await db.sequelize.query(`
        CREATE OR REPLACE FUNCTION control.sp_unregister_user_from_event(user_id INT, event_id INT)
        RETURNS VOID AS $$
        DECLARE
            forum_id INT;
            error_message TEXT;
            error_severity TEXT;
            error_state TEXT;
        BEGIN
            BEGIN
                -- Start the transaction
                PERFORM 1; -- Dummy operation to ensure BEGIN block
                -- Retrieve the FORUM_ID associated with the EVENT_ID
                SELECT forum_id INTO forum_id
                FROM dynamic_content.forums
                WHERE event_id = event_id;

                -- Delete the participation record
                DELETE FROM control.participation
                WHERE user_id = user_id AND event_id = event_id;

                -- Delete the event forum access record
                DELETE FROM control.event_forum_access
                WHERE user_id = user_id AND forum_id = forum_id;

                -- Update the current participants count
                UPDATE dynamic_content.events
                SET current_participants = current_participants - 1
                WHERE event_id = event_id;

            EXCEPTION
                WHEN OTHERS THEN
                    -- Capture the error details
                    GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT,
                                            error_severity = RETURNED_SQLSTATE,
                                            error_state = PG_EXCEPTION_DETAIL;
                    -- Log the error details (Assuming a log_error function exists)
                    INSERT INTO security.error_log (error_message, error_severity, error_state, error_time)
                    VALUES (error_message, error_severity, error_state, CURRENT_TIMESTAMP);

                    -- Rollback the transaction
                    ROLLBACK;
                    RAISE NOTICE 'Error: %', error_message;
                    RETURN;
            END;
        END;
        $$ LANGUAGE plpgsql;

        `);
};
const create_sp_for_trigger = async () => {
    await db.sequelize.query(`
        CREATE OR REPLACE FUNCTION control.sp_event_participation_cleanup()
        RETURNS VOID AS $$
        DECLARE
            user_id INT;
            event_id INT;
            participation_cursor REFCURSOR;
        BEGIN
            -- Open a cursor for the participation records of inactive users
            OPEN participation_cursor FOR
            SELECT ep.user_id, ep.event_id
            FROM control.participation ep
            JOIN security.user_account_details u ON ep.user_id = u.user_id
            WHERE u.account_status = 0; -- Only select inactive users

            LOOP
                FETCH participation_cursor INTO user_id, event_id;
                EXIT WHEN NOT FOUND;

                -- Remove the inactive user from the event
                PERFORM control.sp_unregister_user_from_event(user_id, event_id);
            END LOOP;

            -- Close and deallocate the cursor
            CLOSE participation_cursor;
        END;
        $$ LANGUAGE plpgsql;

    `);
};

const createTriggerFunction_event_part_count= async () => {
    await db.sequelize.query(`
            CREATE OR REPLACE FUNCTION control.trg_event_participation_count()
            RETURNS TRIGGER AS $$
            BEGIN
                -- Update participation count for the event referenced in NEW
                UPDATE dynamic_content.events e
                SET current_participants = p.participant_count
                FROM (
                    SELECT event_id, COUNT(*) AS participant_count
                    FROM control.participation 
                    WHERE event_id = NEW.event_id
                    GROUP BY event_id
                ) p
                WHERE e.event_id = p.event_id;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
};

const createTrigger_event_part_count= async () => {
    await db.sequelize.query(`
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_event_participation_count') THEN
                DROP TRIGGER trg_event_participation_count ON control.participation;
                END IF;
                CREATE TRIGGER trg_event_participation_count
                AFTER INSERT ON control.participation
                FOR EACH ROW
                EXECUTE FUNCTION control.trg_event_participation_count();
            END $$;
        `);
};









const createTriggerFunction_create_album_for_validated_event = async () => {
    await db.sequelize.query(`
        CREATE OR REPLACE FUNCTION dynamic_content.create_album_for_validated_event()
        RETURNS TRIGGER AS $$
        DECLARE
            error_message TEXT;
            error_severity TEXT;
            error_state TEXT;
        BEGIN
            -- Check if the event is validated
            IF NEW.validated = TRUE THEN
                -- Insert a new album associated with the validated event
                INSERT INTO dynamic_content.albuns (event_id, title, sub_area_id)
                VALUES (NEW.event_id, NEW.name, NEW.sub_area_id); -- Use the event title as the album name
            END IF;

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

const createTrigger_create_album_after_event_insert = async () => {
    await db.sequelize.query(`
        DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_create_album_after_event_insert') THEN
                DROP TRIGGER trg_create_album_after_event_insert ON dynamic_content.events;
            END IF;

            CREATE TRIGGER trg_create_album_after_event_insert
            AFTER INSERT ON dynamic_content.events
            FOR EACH ROW
            WHEN (NEW.validated IS TRUE)
            EXECUTE FUNCTION dynamic_content.create_album_for_validated_event();
        END $$;
    `);
};

const createTrigger_create_album_after_event_update = async () => {
    await db.sequelize.query(`
        DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_create_album_after_event_update') THEN
                DROP TRIGGER trg_create_album_after_event_update ON dynamic_content.events;
            END IF;

            CREATE TRIGGER trg_create_album_after_event_update
            AFTER UPDATE ON dynamic_content.events
            FOR EACH ROW
            WHEN (NEW.validated IS TRUE AND OLD.validated IS FALSE)
            EXECUTE FUNCTION dynamic_content.create_album_for_validated_event();
        END $$;
    `);
};



module.exports = {
    createTriggerFunction_trg_moderate_event_content,
    createTrigger_createEvent,
    sp_for_next_trigger,
    create_sp_for_trigger,
    createTriggerFunction_event_part_count,
    createTrigger_event_part_count,

    createTriggerFunction_create_album_for_validated_event,
    createTrigger_create_album_after_event_insert,
    createTrigger_create_album_after_event_update

};
