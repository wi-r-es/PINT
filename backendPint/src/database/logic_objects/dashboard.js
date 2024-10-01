const db = require("../../models");

async function sptoValidate() {
  const result_posts = await db.sequelize.query(
    `SELECT COUNT(*) FROM "dynamic_content"."posts" WHERE "validated" = false`
  );

  const result_events = await db.sequelize.query(
    `SELECT COUNT(*) 
FROM "dynamic_content"."events" 
WHERE "validated" = FALSE 
AND "event_date" > CURRENT_DATE;`
  );

  return {
    posts: result_posts[0][0].count,
    events: result_events[0][0].count,
  };
}

async function spValidated() {
  const result_posts = await db.sequelize.query(
    `SELECT COUNT(*) FROM "dynamic_content"."posts" WHERE "validated" = true`
  );

  const result_events = await db.sequelize.query(
    `SELECT COUNT(*) FROM "dynamic_content"."events" WHERE "validated" = true`
  );

  return {
    posts: result_posts[0][0].count,
    events: result_events[0][0].count,
  };
}

async function sppostsbycity() {
  const result = await db.sequelize.query(
    `SELECT COUNT(*) as post_count, "centers"."offices"."city" 
        FROM "dynamic_content"."posts"
        JOIN "hr"."users" ON "dynamic_content"."posts"."publisher_id" = "hr"."users"."user_id"
        JOIN "centers"."office_workers" ON "hr"."users"."user_id" = "centers"."office_workers"."user_id"
        JOIN "centers"."offices" ON "centers"."office_workers"."office_id" = "centers"."offices"."office_id"
        GROUP BY "centers"."offices"."city"`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  return result;
}

async function speventsbycity() {
  const result = await db.sequelize.query(
    `SELECT COUNT(*) as event_count, "centers"."offices"."city" 
        FROM "dynamic_content"."events"
        JOIN "hr"."users" ON "dynamic_content"."events"."publisher_id" = "hr"."users"."user_id"
        JOIN "centers"."office_workers" ON "hr"."users"."user_id" = "centers"."office_workers"."user_id"
        JOIN "centers"."offices" ON "centers"."office_workers"."office_id" = "centers"."offices"."office_id"
        GROUP BY "centers"."offices"."city"`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  return result;
}

async function spcomments_by_city() {
  const result = await db.sequelize.query(
    `SELECT COUNT(*) as comment_count, "centers"."offices"."city" 
        FROM "communication"."comments"
        JOIN "hr"."users" ON "communication"."comments"."publisher_id" = "hr"."users"."user_id"
        JOIN "centers"."office_workers" ON "hr"."users"."user_id" = "centers"."office_workers"."user_id"
        JOIN "centers"."offices" ON "centers"."office_workers"."office_id" = "centers"."offices"."office_id"
        GROUP BY "centers"."offices"."city"`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  return result;
}

module.exports = {
  sptoValidate,
  spValidated,
  sppostsbycity,
  speventsbycity,
  spcomments_by_city,
};
