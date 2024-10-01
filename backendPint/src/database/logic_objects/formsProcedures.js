const db = require("../../models");
const { QueryTypes } = require("sequelize");
//const { parse } = require('json2sql'); /
const { log_err } = require("../../utils/logError");
//to add more forms to a pendent event that is already created
async function addCustomFieldsToEventForm(eventID, customFieldsJson) {
  const t = await db.sequelize.transaction();
  try {
    // Check if the event is validated
    const event = await db.sequelize.query(
      `SELECT 1 FROM "dynamic_content"."events" WHERE "event_id" = :eventID AND "validated" = false`,
      {
        replacements: { eventID },
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (event.length === 0) {
      console.log("Event is already validated and cannot be edited.");
      await t.rollback();
      return;
    }

    // Convert JSON to array and insert custom fields
    const customFields = JSON.parse(customFieldsJson);

    for (const field of customFields) {
      await db.sequelize.query(
        `INSERT INTO "forms"."fields" ("event_id", "field_name", "field_type", "field_value", "max_value", "min_value")
         VALUES (:eventID, :fieldName, :fieldType, :fieldValue, :maxValue, :minValue)`,
        {
          replacements: {
            eventID,
            fieldName: field.field_name,
            fieldType: field.field_type,
            fieldValue: field.field_value,
            maxValue: field.max_value,
            minValue: field.min_value,
          },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error("Error adding custom fields:", error);
    log_err(error.message);
    throw error;
  }
}

async function createEventForm(eventID, customFieldsJson) {
  const t = await db.sequelize.transaction();
  try {
    // Copy default fields to the new event form
    // await db.sequelize.query(
    //   `INSERT INTO "forms"."fields" ("event_id", "field_name", "field_type", "field_value", "max_value", "min_value", "def_field_id")
    //      SELECT :eventID, "field_name", "field_type", "field_value", "max_value", "min_value", "field_id"
    //      FROM "forms"."default_fields"`,
    //   {
    //     replacements: { eventID },
    //     type: QueryTypes.INSERT,
    //     transaction: t,
    //   }
    // );
    // Log the JSON string before parsing
    console.log("Original JSON string:", customFieldsJson);
    // Parse the JSON string twice for some reason...
    const tempParsed = JSON.parse(customFieldsJson);
    console.log("After first parse:", tempParsed);
    // Convert JSON to array and insert custom fields
    const customFields = JSON.parse(tempParsed);
    // Log the parsed result
    console.log("Parsed customFields:", customFields);
    console.log("Type of parsed customFields:", typeof customFields);
    console.log("Is Array:", Array.isArray(customFields));

    // Ensure the parsed data is an array
    if (!Array.isArray(customFields)) {
      throw new Error("Parsed customFields is not an array");
    }

    for (const field of customFields) {
      console.log("inside for");
      console.log(field);
      // Ensure all fields are properly logged
      console.log("field_name:", field.field_name);
      console.log("field_type:", field.field_type);
      console.log("field_value:", field.field_value);
      console.log("max_value:", field.max_value);
      console.log("min_value:", field.min_value);
      // Check if field has all the necessary properties
      if (
        typeof field.field_name === "undefined" ||
        typeof field.field_type === "undefined" ||
        typeof field.field_value === "undefined"
      ) {
        console.error("Field is missing required properties:", field);
        continue; // Skip this iteration if properties are missing
      }

      await db.sequelize.query(
        `INSERT INTO "forms"."fields" ("event_id", "field_name", "field_type", "field_value", "max_value", "min_value")
           VALUES (:eventID, :fieldName, :fieldType, :fieldValue, :maxValue, :minValue)`,
        {
          replacements: {
            eventID,
            fieldName: field.field_name,
            fieldType: field.field_type,
            fieldValue: field.field_value,
            maxValue: field.max_value,
            minValue: field.min_value,
          },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error("Error creating event form:", error);
    log_err(error.message);
    throw error;
  }
}

async function createEventFormWeb(event_id, customFieldsJson) {
  const t = await db.sequelize.transaction();
  try {
    // Parse the JSON string
    const customFields = JSON.parse(customFieldsJson);

    // Ensure the parsed data is an array
    if (!Array.isArray(customFields)) {
      throw new Error("Parsed customFields is not an array");
    }

    for (const field of customFields) {
      // Check if field has all the necessary properties
      if (
        typeof field.field_name === "undefined" ||
        typeof field.field_type === "undefined" ||
        typeof field.field_value === "undefined"
      ) {
        console.error("Field is missing required properties:", field);
        continue; // Skip this iteration if properties are missing
      }

      await db.sequelize.query(
        `INSERT INTO "forms"."fields" ("event_id", "field_name", "field_type", "field_value", "max_value", "min_value")
           VALUES (:eventID, :fieldName, :fieldType, :fieldValue, :maxValue, :minValue)`,
        {
          replacements: {
            eventID: event_id,
            fieldName: field.field_name,
            fieldType: field.field_type,
            fieldValue: field.field_value,
            maxValue: field.max_value,
            minValue: field.min_value,
          },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }

    await t.commit();
    return { success: true, message: "Form created successfully" };
  } catch (error) {
    await t.rollback();
    console.error("Error creating event form:", error);
    log_err(error.message);
    return { success: false, message: "Error creating form" };
  }
}

async function editEventFormField(eventID, customFieldsJson) {
  const t = await db.sequelize.transaction();
  try {
    // Check if the event is validated
    // const event = await db.sequelize.query(
    //   `SELECT 1 FROM "dynamic_content"."events" WHERE "event_id" = :eventID AND "validated" = false`,
    //   {
    //     replacements: { eventID },
    //     type: QueryTypes.SELECT,
    //     transaction: t,
    //   }
    // );

    // if (event.length === 0) {
    //   console.log("Event is already validated and cannot be edited.");
    //   await t.rollback();
    //   return;
    // }
    // Log the JSON string before parsing
    console.log("Original JSON string:", customFieldsJson);
    // Parse the JSON string twice for some reason...
    const tempParsed = JSON.parse(customFieldsJson);
    console.log("After first parse:", tempParsed);
    // Convert JSON to array and insert custom fields
    const customFields = JSON.parse(tempParsed);
    // Log the parsed result
    console.log("Parsed customFields:", customFields);
    console.log("Type of parsed customFields:", typeof customFields);
    console.log("Is Array:", Array.isArray(customFields));

    // Ensure the parsed data is an array
    if (!Array.isArray(customFields)) {
      throw new Error("Parsed customFields is not an array");
    }

    for (const field of customFields) {
      console.log("inside for");
      console.log(field);
      // Ensure all fields are properly logged
      console.log("field_id:", field.field_id);
      console.log("field_name:", field.field_name);
      console.log("field_type:", field.field_type);
      console.log("field_value:", field.field_value);
      console.log("max_value:", field.max_value);
      console.log("min_value:", field.min_value);
      // Check if field has all the necessary properties
      if (
        typeof field.field_name === "undefined" ||
        typeof field.field_type === "undefined" ||
        typeof field.field_value === "undefined"
      ) {
        console.error("Field is missing required properties:", field);
        continue; // Skip this iteration if properties are missing
      }

      await db.sequelize.query(
        `UPDATE "forms"."fields" 
          SET
            "field_name" = COALESCE(:fieldName, "field_name"),
            "field_type" = COALESCE(:fieldType, "field_type"),
            "field_value" = COALESCE(:fieldValue, "field_value"),
            "max_value" = COALESCE(:maxValue, "max_value"),
            "min_value" = COALESCE(:minValue, "min_value")
          WHERE "event_id" = :eventID AND "field_id" = :fieldID
`,
        {
          replacements: {
            eventID,
            fieldName: field.field_name,
            fieldType: field.field_type,
            fieldValue: field.field_value,
            maxValue: field.max_value,
            minValue: field.min_value,
            fieldID: field.field_id,
          },
          type: QueryTypes.UPDATE,
          transaction: t,
        }
      );
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error("Error editing event form field:", error);
    log_err(error.message);
    throw error;
  }
}

async function getFormSchema(eventID) {
  try {
    const formschema = await db.sequelize.query(
      `SELECT "event_id", "field_id", "def_field_id", "field_name", "field_type", "field_value", "max_value", "min_value"
         FROM "forms"."fields"
         WHERE "event_id" = :eventID
         ORDER BY "field_id"`,
      {
        replacements: { eventID },
        type: QueryTypes.SELECT,
      }
    );
    return formschema;
  } catch (error) {
    console.error("Error fetching form schema:", error);
    throw error;
  }
}

async function getFormSchemaAsJson(eventID) {
  try {
    const formschema = await db.sequelize.query(
      `SELECT "event_id", "field_id", "def_field_id", "field_name", "field_type", "field_value", "max_value", "min_value"
         FROM "forms"."fields"
         WHERE "event_id" = :eventID
         ORDER BY "field_id"
         FOR JSON AUTO, ROOT('formschema')`,
      {
        replacements: { eventID },
        type: QueryTypes.RAW,
      }
    );
    return formschema[0][""];
  } catch (error) {
    console.error("Error fetching form schema as JSON:", error);
    throw error;
  }
}

async function insertFormAnswer(userID, eventID, fieldID, answer) {
  const t = await db.sequelize.transaction();
  try {
    await db.sequelize.query(
      `INSERT INTO "forms"."answers" ("user_id", "event_id", "field_id", "answer", "entry_date")
         VALUES (:userID, :eventID, :fieldID, :answer, CURRENT_TIMESTAMP)`,
      {
        replacements: { userID, eventID, fieldID, answer },
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );

    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error("Error inserting form answer:", error);
    log_err(error.message);
    throw error;
  }
}

async function insertFormAnswers(userID, eventID, answersJson) {
  const t = await db.sequelize.transaction();
  console.log(answersJson);
  try {
    const answers = JSON.parse(answersJson);

    for (const answer of answers) {
      await db.sequelize.query(
        `INSERT INTO "forms"."answers" ("user_id", "event_id", "field_id", "answer", "entry_date")
           VALUES (:userID, :eventID, :fieldID, :answer, CURRENT_TIMESTAMP)`,
        {
          replacements: {
            userID,
            eventID,
            fieldID: answer.field_id,
            answer: answer.ANSWERS,
          },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error("Error inserting multiple form answers:", error);
    log_err(error.message);
    throw error;
  }
}

async function deleteEventFormField(eventID, fieldID) {
  const t = await db.sequelize.transaction();
  try {
    // Check if the event is validated
    const event = await db.sequelize.query(
      `SELECT 1 FROM "dynamic_content"."events" WHERE "event_id" = :eventID AND "validated" = false`,
      {
        replacements: { eventID },
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (event.length === 0) {
      console.log("Event is already validated and cannot be edited.");
      await t.rollback();
      return;
    }

    // Delete the specified field for the event
    await db.sequelize.query(
      `DELETE FROM "forms"."fields" WHERE "event_id" = :eventID AND "field_id" = :fieldID`,
      {
        replacements: { eventID, fieldID },
        type: QueryTypes.DELETE,
        transaction: t,
      }
    );

    await t.commit();
    console.log("Field deleted successfully.");
  } catch (error) {
    await t.rollback();
    console.error("Error deleting event form field:", error);
    log_err(error.message);
    throw error;
  }
}

async function getFormAnswersByEvent(eventID) {
  try {
    const answersResult = await db.sequelize.query(
      `SELECT 
          "user_id",
          "event_id",
          "field_id",
          "answer",
          "entry_date"
       FROM "forms"."answers"
       WHERE "event_id" = :eventID`,
      {
        replacements: { eventID },
        type: QueryTypes.SELECT,
      }
    );

    if (answersResult.length === 0) {
      throw new Error("No answers found for the event.");
    }

    return answersResult;
  } catch (error) {
    console.error("Error retrieving form answers:", error.message);
    throw error;
  }
}


async function getFormAnswersByEventWeb(eventID) {
  try {
    const answersResult = await db.sequelize.query(
      `SELECT 
          fa."user_id",
          fa."event_id",
          fa."field_id",
          fa."answer",
          fa."entry_date",
          f.field_name,
          u.first_name ,
          u.last_name 
       FROM "forms"."answers" fa
       join forms.fields f on fa.field_id = f.field_id
       join hr.users u on fa.user_id = u.user_id 
       WHERE fa."event_id" = :eventID`,
      {
        replacements: { eventID },
        type: QueryTypes.SELECT,
      }
    );

    if (answersResult.length === 0) {
      throw new Error("No answers found for the event.");
    }

    return answersResult;
  } catch (error) {
    console.error("Error retrieving form answers:", error.message);
    throw error;
  }
}


async function getFormAnswersByEventAndUser(eventID, userID) {
  try {
    const answersResult = await db.sequelize.query(
      `SELECT 
          "user_id",
          "event_id",
          "field_id",
          "answer",
          "entry_date"
       FROM "forms"."answers"
       WHERE "event_id" = :eventID AND "user_id" = :userID`,
      {
        replacements: { eventID, userID },
        type: QueryTypes.SELECT,
      }
    );

    if (answersResult.length === 0) {
      throw new Error("No answers found for the event and user.");
    }

    return answersResult;
  } catch (error) {
    console.error("Error retrieving form answers:", error.message);
    throw error;
  }
}

async function getAllEventsWithForms() {
  try {
    const events = await db.sequelize.query(
      `SELECT DISTINCT e.event_id, e."name", e.office_id, e.validated 
FROM forms.fields f 
JOIN dynamic_content.events e 
ON e.event_id = f.event_id
`,
      {
        type: QueryTypes.SELECT,
      }
    );

    if (events.length === 0) {
      throw new Error("No events found with forms.");
    }

    return events;
  } catch (error) {
    console.error("Error retrieving events with forms:", error.message);
    throw error;
  }
}

module.exports = {
  addCustomFieldsToEventForm,
  createEventForm,
  editEventFormField,
  getFormSchema,
  getFormSchemaAsJson,
  insertFormAnswer,
  insertFormAnswers,
  deleteEventFormField,
  getFormAnswersByEvent,
  getFormAnswersByEventAndUser,
  getAllEventsWithForms,
  createEventFormWeb,
  getFormAnswersByEventWeb,
};
