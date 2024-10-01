const db = require("../../../models");

const createTriggerFunction_trg_moderate_post_content_after_insert = async () => {
    await db.sequelize.query(`
      CREATE OR REPLACE FUNCTION dynamic_content.trg_moderate_post_content_after_insert()
      RETURNS TRIGGER AS $$
      DECLARE
          post_record RECORD;
          error_message TEXT;
          error_severity TEXT;
          error_state TEXT;
          post_cursor REFCURSOR;
      BEGIN
          -- Open a cursor for the inserted rows
          OPEN post_cursor FOR
          SELECT post_id, publisher_id, admin_id
          FROM dynamic_content.posts
          WHERE post_id = NEW.post_id;

          LOOP
              FETCH post_cursor INTO post_record;
              EXIT WHEN NOT FOUND;

              BEGIN
                  IF post_record.admin_id IS NULL THEN
                      INSERT INTO admin.content_validation_status (content_real_id, content_type)
                      VALUES (post_record.post_id, 'Post');
                  ELSE
                      INSERT INTO admin.content_validation_status (content_real_id, content_type, content_status, validator_id, validation_date)
                      VALUES (post_record.post_id, 'Post', 'Approved', post_record.admin_id, CURRENT_TIMESTAMP);

                      -- Update the post record with the admin ID
                      UPDATE dynamic_content.posts
                      SET admin_id = post_record.admin_id
                      WHERE post_id = post_record.post_id;
                  END IF;

                  INSERT INTO dynamic_content.scores(post_id, score)
                  VALUES (post_record.post_id, 0);

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
          CLOSE post_cursor;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

    `);
};

const createTrigger_createPost = async () => {
  await db.sequelize.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_moderate_post_content_after_insert') THEN
          DROP TRIGGER trg_moderate_post_content_after_insert ON dynamic_content.posts;
        END IF;
        CREATE TRIGGER trg_moderate_post_content_after_insert
        AFTER INSERT ON dynamic_content.posts
        FOR EACH ROW
        EXECUTE FUNCTION dynamic_content.trg_moderate_post_content_after_insert();
      END $$;
    `);
};

module.exports = {
  createTriggerFunction_trg_moderate_post_content_after_insert,
  createTrigger_createPost,
};
