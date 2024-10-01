const db = require('../../../models'); 

const createTriggerFunction_trg_moderate_forum_content_after_insert = async () => {
    await db.sequelize.query(`
      CREATE OR REPLACE FUNCTION dynamic_content.trg_moderate_forum_content_after_insert()
      RETURNS TRIGGER AS $$
      DECLARE
          forum_record RECORD;
          error_message TEXT;
          error_severity TEXT;
          error_state TEXT;
          forum_cursor REFCURSOR;
      BEGIN
          -- Open a cursor for the inserted rows
          OPEN forum_cursor FOR
          SELECT forum_id, publisher_id, admin_id
          FROM dynamic_content.forums
          WHERE forum_id = NEW.forum_id;

          LOOP
              FETCH forum_cursor INTO forum_record;
              EXIT WHEN NOT FOUND;

              BEGIN
                  IF forum_record.admin_id IS NULL THEN
                      INSERT INTO admin.content_validation_status (content_real_id, content_type)
                      VALUES (forum_record.forum_id, 'Forum');
                  ELSE
                      INSERT INTO admin.content_validation_status (content_real_id, content_type, content_status, validator_id, validation_date)
                      VALUES (forum_record.forum_id, 'Forum', 'Approved', forum_record.admin_id, CURRENT_TIMESTAMP);

                      -- Update the forum record with the admin ID
                      UPDATE dynamic_content.forums
                      SET admin_id = forum_record.admin_id
                      WHERE forum_id = forum_record.forum_id;
                  END IF;

              EXCEPTION
                  WHEN OTHERS THEN
                      GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT,
                                              error_severity = RETURNED_SQLSTATE,
                                              error_state = PG_EXCEPTION_DETAIL;
                      RAISE NOTICE 'Error: %', error_message;
                      RETURN NULL;
              END;
          END LOOP;

          -- Close and deallocate the cursor
          CLOSE forum_cursor;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
};

const createTrigger_createForum = async () => {
    await db.sequelize.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_moderate_forum_content_after_insert') THEN
          DROP TRIGGER trg_moderate_forum_content_after_insert ON dynamic_content.forums;
        END IF;
        CREATE TRIGGER trg_moderate_forum_content_after_insert
        AFTER INSERT ON dynamic_content.forums
        FOR EACH ROW
        EXECUTE FUNCTION dynamic_content.trg_moderate_forum_content_after_insert();
      END $$;
    `);
};

module.exports = {
    createTriggerFunction_trg_moderate_forum_content_after_insert,
    createTrigger_createForum,
};
