const { QueryTypes } = require("sequelize");
const db = require("../../models");



//Procedure to Insert a New Rating/Evaluation
async function spInsertEvaluation(
  contentType,
  contentId,
  criticId,
  evaluation
) {
  const transaction = await db.sequelize.transaction();
  try {
    const validContentTypes = ["post", "event"];
    if (!validContentTypes.includes(contentType)) {
      throw new Error(
        'Invalid ContentType. Only "post" and "event" are allowed.'
      );
    }

    const contentIdColumn = contentType === "post" ? "post_id" : "event_id";

    // Check if an evaluation already exists
    const [existingEvaluation] = await db.sequelize.query(
      `SELECT 1 FROM "dynamic_content"."ratings"
       WHERE "${contentIdColumn}" = :contentId AND "critic_id" = :criticId`,
      {
        replacements: { contentId, criticId },
        type: QueryTypes.SELECT,
        transaction,
      }
    );

    if (existingEvaluation) {
      // If an evaluation exists, update it
      await db.sequelize.query(
        `UPDATE "dynamic_content"."ratings"
         SET "evaluation" = :evaluation, "evaluation_date" = CURRENT_TIMESTAMP
         WHERE "${contentIdColumn}" = :contentId AND "critic_id" = :criticId`,
        {
          replacements: { contentId, criticId, evaluation },
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
    } else {
      // If no evaluation exists, insert a new one
      await db.sequelize.query(
        `INSERT INTO "dynamic_content"."ratings" ("${contentIdColumn}", "critic_id", "evaluation_date", "evaluation")
         VALUES (:contentId, :criticId, CURRENT_TIMESTAMP, :evaluation)`,
        {
          replacements: { contentId, criticId, evaluation },
          type: QueryTypes.INSERT,
          transaction,
        }
      );
    }

    await transaction.commit();
  } catch (error) {
    console.error("Error inserting or updating evaluation:", error.message);
    await transaction.rollback();
    throw error;
  }
}



async function fnIsPublisherOfficeAdmin(publisherID, officeID) {
  // Fetch the OfficeCenterID for the given publisherID, in case he is a admin
  const offcAdmin = await db.sequelize.query(
    `SELECT "office_id" FROM "centers"."office_admins" WHERE "manager_id" = :publisherID`,
    {
      replacements: { publisherID },
      type: QueryTypes.SELECT,
    }
  );
  //check wheter it got back an office, eg. the publisher is an admin. If not return false;
  if (offcAdmin.length) {
    const officeCenterID = offcAdmin[0].office_id;

    if ( officeCenterID === 0 || officeCenterID == officeID ) {
      return true;
    }
  }
  return false;

//   const result = await db.sequelize.query(
//     `SELECT EXISTS (SELECT 1 FROM "centers"."office_admins" WHERE "manager_id" = :publisherID AND "office_id" = :officeID) AS "exists"`,
//     {
//       replacements: { publisherID, officeID },
//       type: QueryTypes.SELECT,
//     }
//   );

//   return result[0].exists ? true : false;
}

const logError = async (errorMessage, errorSeverity, errorState) => {
  try {
    await db.sequelize.query(
      `INSERT INTO "security"."error_log" ("error_message", "error_severity", "error_state", "error_time")
         VALUES (:errorMessage, :errorSeverity, :errorState, NOW())`,
      {
        replacements: { errorMessage, errorSeverity, errorState },
        type: QueryTypes.INSERT,
      }
    );

    throw new Error(errorMessage);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  //spValidateContent,
  //spRejectContent,
  spInsertEvaluation,
  // fnReverseRating,
  // trgUpdateAverageScore,
  fnIsPublisherOfficeAdmin,
  logError,
};
