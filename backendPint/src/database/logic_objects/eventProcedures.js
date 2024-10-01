const { QueryTypes } = require("sequelize");
const db = require("../../models");
const { fnIsPublisherOfficeAdmin } = require("./generalHelpers");
const { spCreateForumForEvent } = require("./forumProcedures");

//Procedure to Create an Event
async function spCreateEvent(
  officeId,
  subAreaId,
  name,
  description,
  eventDate,
  startTime,
  endTime,
  recurring,
  recurring_pattern,
  max_participants,
  location,
  publisher_id,
  filePath
) {
  const isOfficeAdmin = await fnIsPublisherOfficeAdmin(publisher_id, officeId);
  const validated = isOfficeAdmin ? true : false;
  let admin_id = isOfficeAdmin ? publisher_id : null;

  const transaction = await db.sequelize.transaction();
  try {
    const [eventResult] = await db.sequelize.query(
      `INSERT INTO "dynamic_content"."events" 
            ("office_id", "sub_area_id", "publisher_id", "admin_id", "creation_date", "name", "description", "event_date", "start_time" , "end_time" , "recurring", "recurring_pattern", "max_participants", "event_location", "validated", "filepath")
            VALUES (:officeId, :subAreaId, :publisher_id, :admin_id, CURRENT_TIMESTAMP, :name, :description, :eventDate, :startTime, :endTime, :recurring, :recurring_pattern, :max_participants, :location, :validated, :filePath)
            RETURNING "event_id"`,
      {
        replacements: {
          officeId,
          subAreaId,
          publisher_id,
          admin_id,
          name,
          description,
          eventDate,
          startTime,
          endTime,
          recurring,
          recurring_pattern,
          max_participants,
          location,
          validated,
          filePath,
        },
        type: QueryTypes.INSERT,
        transaction,
      }
    );

    console.log("Event Result:", eventResult); // Debug log

    const eventId = eventResult[0].event_id;
    // Create the forum associated with the event
    const [forumResult] = await db.sequelize.query(
      `INSERT INTO "dynamic_content"."forums" 
            ("office_id", "sub_area_id", "title", "content", "creation_date", "publisher_id", "admin_id", "event_id", "validated")
            VALUES (:officeId, :subAreaId, :name, :description, CURRENT_TIMESTAMP, :publisher_id, :admin_id, :eventId, :validated)
            RETURNING "forum_id"`,
      {
        replacements: {
          officeId,
          subAreaId,
          name,
          description,
          publisher_id,
          admin_id,
          eventId,
          validated,
        },
        type: QueryTypes.INSERT,
        transaction,
      }
    );

    console.log("Forum Result:", forumResult); // Debug log

    const forumId = forumResult[0].forum_id;
    console.log(forumId);
    // Grant access to the publisher for the created forum
    await db.sequelize.query(
      `INSERT INTO "control"."event_forum_access" ("user_id", "forum_id")
            VALUES (:publisher_id, :forumId)`,
      {
        replacements: { publisher_id, forumId },
        type: QueryTypes.INSERT,
        transaction,
      }
    );
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    /*
        await db.sequelize.query(
            `INSERT INTO "control"."participation"("user_id", "event_id")
             VALUES ( :publisher_id, :eventId);`,
             {replacements: {publisher_id, eventId },
             type: QueryTypes.INSERT, 
                transaction},
        );
        */

    await transaction.commit();
    return eventId;
  } catch (error) {
    console.error("Transaction Error:", error); // Log the detailed error
    await transaction.rollback();
    throw error;
  }
}

//Procedure to Clean Up Event Participation
async function spEventParticipationCleanup() {
  const transaction = await db.sequelize.transaction();
  try {
    const inactiveUsers = await db.sequelize.query(
      `SELECT ep."user_id", ep."event_id"
        FROM "control"."participation" ep
        JOIN "security"."user_account_details" ua ON ua."user_id" = ep."user_id"
        WHERE ua."account_status" = false`,
      { type: QueryTypes.SELECT, transaction }
    );

    for (const user of inactiveUsers) {
      await db.sequelize.query(
        `DELETE FROM "control"."participation"
          WHERE "user_id" = :userId AND "event_id" = :eventId`,
        {
          replacements: { userId: user.user_id, eventId: user.event_id },
          type: QueryTypes.DELETE,
          transaction,
        }
      );
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

//Procedure to Unregister a User from an Event
async function spUnregisterUserFromEvent(userId, eventId) {
  const transaction = await db.sequelize.transaction();
  try {
    const forumIdResult = await db.sequelize.query(
      `SELECT "forum_id"
        FROM "dynamic_content"."forums"
        WHERE "event_id" = :eventId`,
      { replacements: { eventId }, type: QueryTypes.SELECT, transaction }
    );

    if (forumIdResult.length === 0) {
      throw new Error("Forum not found for the event.");
    }

    const forumId = forumIdResult[0].forum_id;

    await db.sequelize.query(
      `DELETE FROM "control"."participation"
        WHERE "user_id" = :userId AND "event_id" = :eventId`,
      {
        replacements: { userId, eventId },
        type: QueryTypes.DELETE,
        transaction,
      }
    );

    await db.sequelize.query(
      `DELETE FROM "control"."event_forum_access"
        WHERE "user_id" = :userId AND "forum_id" = :forumId`,
      {
        replacements: { userId, forumId },
        type: QueryTypes.DELETE,
        transaction,
      }
    );

    await db.sequelize.query(
      `UPDATE "dynamic_content"."events"
        SET "current_participants" = "current_participants" - 1
        WHERE "event_id" = :eventId`,
      { replacements: { eventId }, type: QueryTypes.UPDATE, transaction }
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function spRegisterUserForEvent(userId, eventId) {
  const transaction = await db.sequelize.transaction();
  try {
    const forumIdResult = await db.sequelize.query(
      `SELECT "forum_id"
            FROM "dynamic_content"."forums"
            WHERE "event_id" = :eventId`,
      { replacements: { eventId }, type: QueryTypes.SELECT, transaction }
    );

    if (forumIdResult.length === 0) {
      throw new Error("Forum not found for the event.");
    }

    const forumId = forumIdResult[0].forum_id;

    const participationExists = await db.sequelize.query(
      `SELECT 1
            FROM "control"."participation"
            WHERE "user_id" = :userId AND "event_id" = :eventId`,
      {
        replacements: { userId, eventId },
        type: QueryTypes.SELECT,
        transaction,
      }
    );

    if (participationExists.length === 0) {
      await db.sequelize.query(
        `INSERT INTO "control"."participation" ("user_id", "event_id")
                VALUES (:userId, :eventId)`,
        {
          replacements: { userId, eventId },
          type: QueryTypes.INSERT,
          transaction,
        }
      );
    } else {
      console.log("User is already registered for this event.");
    }

    const forumAccessExists = await db.sequelize.query(
      `SELECT 1
            FROM "control"."event_forum_access"
            WHERE "user_id" = :userId AND "forum_id" = :forumId`,
      {
        replacements: { userId, forumId },
        type: QueryTypes.SELECT,
        transaction,
      }
    );

    if (forumAccessExists.length === 0) {
      await db.sequelize.query(
        `INSERT INTO "control"."event_forum_access" ("user_id", "forum_id")
                VALUES (:userId, :forumId)`,
        {
          replacements: { userId, forumId },
          type: QueryTypes.INSERT,
          transaction,
        }
      );
    } else {
      console.log("User already has forum access for this event.");
    }

    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();

    console.error("Error registering user for event:", error.message);

    throw error;
  }
}

async function getEventCreator(eventId) {
  try {
    const creatorResult = await db.sequelize.query(
      `SELECT "publisher_id" AS "user_id"
       FROM "dynamic_content"."events"
       WHERE "event_id" = :eventId`,
      {
        replacements: { eventId },
        type: QueryTypes.SELECT,
      }
    );

    if (creatorResult.length === 0) {
      throw new Error("Event not found.");
    }

    const userId = creatorResult[0].user_id;
    return userId;
  } catch (error) {
    console.error("Error retrieving event creator:", error.message);
    throw error;
  }
}


//Function to Get Event State
async function fnGetEventState(eventId) {
  const result = await db.sequelize.query(
    `SELECT CASE WHEN "validated" = true THEN 'Validated' ELSE 'Pending' END AS "state"
      FROM "dynamic_content"."events"
      WHERE "event_id" = :eventId`,
    { replacements: { eventId }, type: QueryTypes.SELECT }
  );

  return result.length ? result[0].state : null;
}

//Procedure to Edit an Event
async function spEditEvent(
  eventId,
  subAreaId = null,
  officeId = null,
  adminId = null,
  name = null,
  description = null,
  eventDate = null,
  start_time = null,
  end_time = null,
  eventLocation = null,
  filePath = null,
  recurring = null,
  recurringPattern = null,
  maxParticipants = null,
  currentParticipants = null
) {
  const transaction = await db.sequelize.transaction();
  try {
    const event = await db.sequelize.query(
      `SELECT "validated" FROM "dynamic_content"."events" WHERE "event_id" = :eventId`,
      { replacements: { eventId }, type: QueryTypes.SELECT, transaction }
    );

    // if (event.length && event[0].validated === false) {
      if (event.length) {
      await db.sequelize.query(
        `UPDATE "dynamic_content"."events"
                SET
                    "sub_area_id" = COALESCE(:subAreaId, "sub_area_id"),
                    "office_id" = COALESCE(:officeId, "office_id"),
                    "admin_id" = COALESCE(:adminId, "admin_id"),
                    "name" = COALESCE(:name, "name"),
                    "description" = COALESCE(:description, "description"),
                    "event_date" = COALESCE(:eventDate, "event_date"),
                    "start_time" = COALESCE(:start_time, "start_time"),
                    "end_time" = COALESCE(:end_time, "end_time"),
                    "event_location" = COALESCE(:eventLocation, "event_location"),
                    "filepath" = COALESCE(:filePath, "filepath"),
                    "recurring" = COALESCE(:recurring, "recurring"),
                    "recurring_pattern" = COALESCE(:recurringPattern, "recurring_pattern"),
                    "max_participants" = COALESCE(:maxParticipants, "max_participants"),
                    "current_participants" = COALESCE(:currentParticipants, "current_participants")
                WHERE "event_id" = :eventId`,
        {
          replacements: {
            eventId,
            subAreaId,
            officeId,
            adminId,
            name,
            description,
            eventDate,
            start_time,
            end_time,
            eventLocation,
            filePath,
            recurring,
            recurringPattern,
            maxParticipants,
            currentParticipants,
          },
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
    } else {
      console.log("Event is already validated and cannot be edited.");
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// async function spGetEvent(eventId) {
//   const event = await db.sequelize.query(
//     `SELECT * FROM "dynamic_content"."events" WHERE "event_id" = :eventId`,
//     { replacements: { eventId }, type: QueryTypes.SELECT }
//   );

//   return event.length ? event[0] : null;
// }

async function spGetParticipants_adm(eventId) {
  const participants = await db.sequelize.query(
    `SELECT u.user_id, u.first_name, u.last_name from "control".participation p 
         JOIN hr.users u on p.user_id = u.user_id 
         WHERE  event_id = :eventId`,
    { replacements: { eventId }, type: QueryTypes.SELECT }
  );

  return participants;
}

async function spGetParticipants(eventId) {
  const participants = await db.sequelize.query(
    `SELECT u.user_id from "control".participation p 
         JOIN hr.users u on p.user_id = u.user_id 
         WHERE  event_id = :eventId`,
    { replacements: { eventId }, type: QueryTypes.SELECT }
  );

  return participants;
}

async function getEventCreator(eventId) {
  try {
    const creatorResult = await db.sequelize.query(
      `SELECT "publisher_id" AS "user_id"
       FROM "dynamic_content"."events"
       WHERE "event_id" = :eventId`,
      {
        replacements: { eventId },
        type: QueryTypes.SELECT,
      }
    );

    if (creatorResult.length === 0) {
      throw new Error("Event not found.");
    }

    const userId = creatorResult[0].user_id;
    return userId;
  } catch (error) {
    console.error("Error retrieving event creator:", error.message);
    throw error;
  }
}


async function getEventNameById(eventID) {
  try {
    const eventResult = await db.sequelize.query(
      `SELECT 
          e."name" 
       FROM "dynamic_content"."events" e
       WHERE e."event_id" = :eventID`,
      {
        replacements: { eventID },
        type: QueryTypes.SELECT,
      }
    );

    if (eventResult.length === 0) {
      throw new Error("Event not found.");
    }

    return eventResult[0].name;
  } catch (error) {
    console.error("Error retrieving event name:", error.message);
    throw error;
  }
}

module.exports = {
  spCreateEvent,
  spEventParticipationCleanup,
  spUnregisterUserFromEvent,
  spRegisterUserForEvent,
  fnGetEventState,
  spEditEvent,
  //spGetEvent,
  spGetParticipants,
  getEventCreator,
  getEventNameById,
  spGetParticipants_adm,
};
