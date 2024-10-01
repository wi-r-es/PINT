const { QueryTypes } = require('sequelize');
const db = require('../../models'); 

async function spCreateCategory(title, icon) {
    const exists = await db.sequelize.query(
        `SELECT 1 FROM "static_content"."area" WHERE "title" = :title`,
        { replacements: { title }, type: QueryTypes.SELECT }
    );

    if (exists.length === 0) {
        // get the id of the last category
        const result = await db.sequelize.query(
            `SELECT MAX("area_id") AS max_id FROM "static_content"."area"`,
            { type: QueryTypes.SELECT }
        );

        const maxId = result[0].max_id;
        const newId = (maxId !== null ? maxId + 100 : 100);

        await db.sequelize.query(
            `INSERT INTO "static_content"."area" ("area_id", "title", "icon_name") VALUES (:newId, :title, :icon)`,
            { replacements: { newId, title, icon }, type: QueryTypes.RAW }
        );
    } else {
        console.log('Category already exists.');
    }
}


async function spCreateSubArea(areaId, title) {
    const exists = await db.sequelize.query(
        `SELECT 1 FROM "static_content"."sub_area" WHERE "title" = :title`,
        { replacements: { title }, type: QueryTypes.SELECT }
    );

    if (exists.length === 0) {
        const result = await db.sequelize.query(
            `SELECT MAX("sub_area_id") AS max_id FROM "static_content"."sub_area" WHERE "area_id" = :areaId`,
            { replacements: { areaId }, type: QueryTypes.SELECT }
        );

        const maxId = result[0].max_id;
        const newSubAreaId = (maxId !== null ? maxId + 1 : areaId * 1000 + 1);

        await db.sequelize.query(
            `INSERT INTO "static_content"."sub_area" ("sub_area_id", "area_id", "title") VALUES (:newSubAreaId, :areaId, :title)`,
            { replacements: { newSubAreaId, areaId, title }, type: QueryTypes.RAW }
        );
    } else {
        console.log('SubArea already exists.');
    }
}


module.exports = {
    spCreateCategory,
    spCreateSubArea
};
