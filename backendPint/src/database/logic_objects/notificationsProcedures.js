const db = require('../../models'); 
const { QueryTypes } = require('sequelize');

async function triggerNotifications({ eventID = null, postID = null, areaID = null, subAreaID = null }) {
  const t = await db.sequelize.transaction();
  try {
    if (eventID) {
      await db.sequelize.query(
        `INSERT INTO "user_interactions"."notifications" ("user_id", "event_id", "notification_text")
         SELECT "user_id", :eventID, 'New event posted in your preferred area'
         FROM "user_interactions"."user_pref"
         WHERE "receive_notifications" = 1
           AND (
             (ISJSON("areas") = 1 AND :areaID IS NOT NULL AND EXISTS (
               SELECT 1 FROM OPENJSON("areas") WHERE value = :areaID
             ))
             OR
             (ISJSON("sub_areas") = 1 AND :subAreaID IS NOT NULL AND EXISTS (
               SELECT 1 FROM OPENJSON("sub_areas") WHERE value = :subAreaID
             ))
           )`,
        {
          replacements: { eventID, areaID, subAreaID },
          type: QueryTypes.INSERT,
          transaction: t
        }
      );
    }

    if (postID) {
      await db.sequelize.query(
        `INSERT INTO "user_interactions"."notifications" ("user_id", "post_id", "notification_text")
         SELECT "user_id", :postID, 'New post in your preferred area'
         FROM "user_interactions"."user_pref"
         WHERE "receive_notifications" = 1
           AND (
             (ISJSON("areas") = 1 AND :areaID IS NOT NULL AND EXISTS (
               SELECT 1 FROM OPENJSON("areas") WHERE value = :areaID
             ))
             OR
             (ISJSON("sub_areas") = 1 AND :subAreaID IS NOT NULL AND EXISTS (
               SELECT 1 FROM OPENJSON("sub_areas") WHERE value = :subAreaID
             ))
           )`,
        {
          replacements: { postID, areaID, subAreaID },
          type: QueryTypes.INSERT,
          transaction: t
        }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error('Error triggering notifications:', error);
    throw error;
  }
}

async function notifyEventChanges(eventID, subAreaID) {
    const areaID = subAreaID ? subAreaID.toString().slice(0, 3) : null;
    try {
      await triggerNotifications({ eventID, areaID, subAreaID });
    } catch (error) {
      console.error('Error notifying event changes:', error);
      throw error;
    }
}

async function notifyEventComments(commentID, forumID) {
    const t = await sequelize.transaction();
    try {
      const [event] = await db.sequelize.query(
        `SELECT "e"."event_id", LEFT("e"."subarea_id", 3) AS "AreaID", "e"."subarea_id" AS "SubAreaID"
         FROM "dynamic_content"."forums" f
         JOIN "dynamic_content"."events" e ON f."event_id" = e."event_id"
         WHERE f."forum_id" = :forumID`,
        {
          replacements: { forumID },
          type: QueryTypes.SELECT,
          transaction: t
        }
      );
  
      if (event) {
        await triggerNotifications({ eventID: event.event_id, areaID: event.AreaID, subAreaID: event.SubAreaID });
      }
  
      await t.commit();
    } catch (error) {
      await t.rollback();
      console.error('Error notifying event comments:', error);
      throw error;
    }
}
  
async function notifyEventCreator(eventID, interactionDescription) {
    const t = await db.sequelize.transaction();
    try {
      const [eventCreator] = await sequelize.query(
        `SELECT "publisher_id" FROM "dynamic_content"."events" WHERE "event_id" = :eventID`,
        {
          replacements: { eventID },
          type: QueryTypes.SELECT,
          transaction: t
        }
      );
  
      if (eventCreator && eventCreator.publisher_id) {
        await db.sequelize.query(
          `INSERT INTO "user_interactions"."notifications" ("user_id", "event_id", "notification_text")
           VALUES (:creatorID, :eventID, :interactionDescription)`,
          {
            replacements: { creatorID: eventCreator.publisher_id, eventID, interactionDescription },
            type: QueryTypes.INSERT,
            transaction: t
          }
        );
      }
  
      await t.commit();
    } catch (error) {
      await t.rollback();
      console.error('Error notifying event creator:', error);
      throw error;
    }
}

async function notifyEventInteractions(eventID) {
    const interactionDescription = 'A new user has registered for your event';
    try {
      await notifyEventCreator(eventID, interactionDescription);
    } catch (error) {
      console.error('Error notifying event interactions:', error);
      throw error;
    }
}
  

module.exports = {
  triggerNotifications,
  notifyEventChanges,
  notifyEventComments,
  notifyEventCreator,
  notifyEventInteractions
};
