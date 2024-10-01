const db = require('../../../models'); 

const createTriggerFunction_trg_increment_like_comment = async () => {
    await db.sequelize.query(`
        CREATE OR REPLACE FUNCTION communication.increment_like_count()
        RETURNS TRIGGER AS $$
        BEGIN
            RAISE NOTICE 'Trigger increment_like_count fired for comment_id %', NEW.comment_id;

            UPDATE "communication"."comments"
            SET likes = likes + 1
            WHERE comment_id = NEW.comment_id;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);
};

const createTrigger_increment_like_count = async () => {
    //await createTriggerFunction_trg_increment_like_comment();
     await db.sequelize.query(`
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_increment_like_count') THEN
                DROP TRIGGER trg_increment_like_count ON "communication"."likes";
            END IF;

            CREATE TRIGGER trg_increment_like_count
            AFTER INSERT ON "communication"."likes"
            FOR EACH ROW
            EXECUTE FUNCTION communication.increment_like_count();
        END $$;
    `);
}

const createTriggerFunction_trg_decrement_like_comment = async () => {
    await db.sequelize.query(`
        CREATE OR REPLACE FUNCTION communication.decrement_like_count()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Update the likes in the comments table
            UPDATE "communication"."comments"
            SET likes = likes - 1
            WHERE comment_id = OLD.comment_id;
            
            RETURN OLD;
        END;
        $$ LANGUAGE plpgsql;
    `);
};

const createTrigger_decrement_like_count = async () => {
    //await createTriggerFunction_trg_decrement_like_comment(); 

    await db.sequelize.query(`
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_decrement_like_count') THEN
                DROP TRIGGER trg_decrement_like_count ON "communication"."likes";
            END IF;

            CREATE TRIGGER trg_decrement_like_count
            AFTER DELETE ON "communication"."likes"
            FOR EACH ROW
            EXECUTE FUNCTION communication.decrement_like_count();
        END $$;
    `);
}

module.exports = {
    createTriggerFunction_trg_increment_like_comment,
    createTrigger_increment_like_count,
    createTriggerFunction_trg_decrement_like_comment,
    createTrigger_decrement_like_count
};
