const db = require('../models');

async function deleteDB() {
    try {
       
        console.log('Connection has been established successfully.'); 
        await db.sequelize.query(
            `
            DO $$
            DECLARE
                schema_record RECORD;
            BEGIN
                FOR schema_record IN 
                    (SELECT schema_name 
                    FROM information_schema.schemata
                    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1', 'public'))
                LOOP
                    RAISE NOTICE 'Dropping schema: %', schema_record.schema_name;
                    EXECUTE 'DROP SCHEMA IF EXISTS ' || quote_ident(schema_record.schema_name) || ' CASCADE';
                END LOOP;
            END $$;

            `
        )
        console.log('All models were cleaned successfully.');
    } catch (error) {
        console.error('Unable to clean models:', error);
    } 
}
deleteDB();

module.exports = deleteDB;
