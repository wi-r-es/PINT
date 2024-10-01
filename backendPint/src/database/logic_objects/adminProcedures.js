const { QueryTypes } = require("sequelize");
const db = require("../../models");
const { logError } = require("./generalHelpers");

async function getUserEngagementMetrics() {
  try {
    const results = await db.sequelize.query(
      `SELECT action_type, COUNT(*) AS "action_count"
         FROM "user_interactions"."user_actions_log"
         GROUP BY action_type`,
      {
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching user engagement metrics:", error);
    throw error;
  }
}

async function getContentValidationStatusByadmin(adminID) {
  try {
    const center_id = await db.sequelize.query(
      `SELECT oa."office_id"
         FROM "centers"."office_admins" oa
         WHERE oa."manager_id" = :adminID`,
      {
        replacements: { adminID },
        type: QueryTypes.SELECT,
      }
    );

    if (!center_id.length) {
      console.log("Invalid adminID or adminID not associated with any Center");
      return [];
    }

    const results = await db.sequelize.query(
      `SELECT cvs."content_type", cvs."content_status", COUNT(*) AS "content_count"
         FROM "admin"."content_validation_status" cvs
         INNER JOIN "dynamic_content"."posts" p ON cvs."content_real_id" = p."post_id" AND cvs."content_type" = 'Post' AND p."office_id" = :center_id
         GROUP BY cvs."content_type", cvs."content_status"
         UNION
         SELECT cvs."content_type", cvs."content_status", COUNT(*) AS "content_count"
         FROM "admin"."content_validation_status" cvs
         INNER JOIN "dynamic_content"."events" e ON cvs."content_real_id" = e."event_id" AND cvs."content_type" = 'Event' AND e."office_id" = :center_id
         GROUP BY cvs."content_type", cvs."content_status"
         UNION
         SELECT cvs."content_type", cvs."content_status", COUNT(*) AS "content_count"
         FROM "admin"."content_validation_status" cvs
         INNER JOIN "dynamic_content"."forums" f ON cvs."content_real_id" = f."forum_id" AND cvs."content_type" = 'Forum' AND f."office_id" = :center_id
         GROUP BY cvs."content_type", cvs."content_status"`,
      {
        replacements: { center_id: center_id[0].office_id },
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching content validation status by admin:", error);
    throw error;
  }
}

async function getContentValidationStatus() {
  try {
    const results = await db.sequelize.query(
      `SELECT "content_type", "content_status", COUNT(*) AS "content_count"
         FROM "admin"."content_validation_status"
         GROUP BY "content_type", "content_status"`,
      {
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching content validation status:", error);
    throw error;
  }
}

async function getActiveDiscussions() {
  try {
    const results = await db.sequelize.query(
      `SELECT d."forum_id", f."title", d."last_activity_date", d."active_participants"
         FROM "admin"."active_discussions" d
         JOIN "dynamic_content"."forums" f ON d."forum_id" = f."forum_id"
         ORDER BY d."last_activity_date" DESC`,
      {
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching active discussions:", error);
    throw error;
  }
}

const contentTables = {
  post: "posts",
  event: "events",
  forum: "forums",
};

function capitalizeFirstLetter(str) {
  if (!str) return str; // Handle empty strings
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function validateContent(contentType, contentID, adminID) {
  const transaction = await db.sequelize.transaction();

  try {
    const currentTimestamp = new Date();
    const contentTypeCapitalized = capitalizeFirstLetter(contentType);
    // Update content validation status
    await db.sequelize.query(
      `UPDATE "admin"."content_validation_status"
       SET "validator_id" = :adminID,
           "validation_date" = :currentTimestamp,
           "content_status" = 'Approved'
       WHERE "content_real_id" = :contentID AND "content_type" = :contentTypeCapitalized`,
      {
        replacements: {
          contentID,
          contentTypeCapitalized,
          adminID,
          currentTimestamp,
        },
        type: QueryTypes.UPDATE,
        transaction,
      }
    );

    // Determine the appropriate table and column for validation
    let updateQuery;
    switch (contentType) {
      case "post":
        updateQuery = `
          UPDATE "dynamic_content"."posts"
          SET "validated" = true, "admin_id" = :adminID
          WHERE "post_id" = :contentID`;
        break;
      case "event":
        updateQuery = `
          UPDATE "dynamic_content"."events"
          SET "validated" = true, "admin_id" = :adminID
          WHERE "event_id" = :contentID`;
        break;
      case "forum":
        updateQuery = `
          UPDATE "dynamic_content"."forums"
          SET "validated" = true, "admin_id" = :adminID
          WHERE "forum_id" = :contentID`;
        break;
      default:
        throw new Error(
          'Invalid content type. Only "post", "event", and "forum" are allowed.'
        );
    }

    // Execute the update query for the specified content type
    await db.sequelize.query(updateQuery, {
      replacements: { contentID, adminID },
      type: QueryTypes.UPDATE,
      transaction,
    });

    // Commit the transaction if all operations succeed
    await transaction.commit();
  } catch (error) {
    // Rollback the transaction in case of any error
    await transaction.rollback();
    console.error("Error validating content:", error);
    throw error;
  }
}

async function rejectContent(contentType, contentID, adminID) {
  const transaction = await db.sequelize.transaction();

  try {
    const validContentTypes = ["post", "event", "forum"];
    if (!validContentTypes.includes(contentType)) {
      throw new Error(
        'Invalid ContentType. Only "post", "event", and "forum" are allowed.'
      );
    }
    const contentTypeCapitalized = capitalizeFirstLetter(contentType);
    // Update content validation status to 'Rejected'
    await db.sequelize.query(
      `UPDATE "admin"."content_validation_status"
       SET "validator_id" = :adminID, 
           "validation_date" = CURRENT_TIMESTAMP, 
           "content_status" = 'Rejected'
       WHERE "content_real_id" = :contentID AND "content_type" = :contentTypeCapitalized`,
      {
        replacements: { contentID, contentTypeCapitalized, adminID },
        type: QueryTypes.UPDATE,
        transaction,
      }
    );

    // Commit the transaction if all operations succeed
    await transaction.commit();
  } catch (error) {
    // Rollback the transaction in case of any error
    await transaction.rollback();
    console.error("Error rejecting content:", error);
    throw error;
  }
}

async function getActiveWarnings() {
  try {
    const results = await db.sequelize.query(
      `SELECT "warning_id", "warning_level", "description", "state", "creation_date", "admin_id", "office_id"
         FROM "control"."warnings"
         WHERE "state" = TRUE`,
      {
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching active warnings:", error);
    throw error;
  }
}



async function getAllWarnings() {
  try {
    const results = await db.sequelize.query(
      `SELECT "warning_id", "warning_level", "description", "state", "creation_date", "admin_id", "office_id"
         FROM "control"."warnings"
         `,
      {
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching active warnings:", error);
    throw error;
  }
}

async function getContentCenterToBeValidated(center_id) {
  try {
    const results = await db.sequelize.query(
      `SELECT
          cvs."content_type",
          cvs."content_status",
          cvs."content_real_id",
          cvs."validation_date",
          cvs."validator_id"
         FROM "admin"."content_validation_status" cvs
         JOIN "dynamic_content"."posts" p ON cvs."content_type" = 'Post' AND cvs."content_real_id" = p."post_id" AND p."office_id" = :center_id
         WHERE cvs."content_status" = 'Pending'
         UNION ALL
         SELECT
          cvs."content_type",
          cvs."content_status",
          cvs."content_real_id",
          cvs."validation_date",
          cvs."validator_id"
         FROM "admin"."content_validation_status" cvs
         JOIN "dynamic_content"."events" e ON cvs."content_type" = 'Event' AND cvs."content_real_id" = e."event_id" AND e."office_id" = :center_id
         WHERE cvs."content_status" = 'Pending'
         UNION ALL
         SELECT
          cvs."content_type",
          cvs."content_status",
          cvs."content_real_id",
          cvs."validation_date",
          cvs."validator_id"
         FROM "admin"."content_validation_status" cvs
         JOIN "dynamic_content"."forums" f ON cvs."content_type" = 'Forum' AND cvs."content_real_id" = f."forum_id" AND f."office_id" = :center_id
         WHERE cvs."content_status" = 'Pending'`,
      {
        replacements: { center_id },
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching content center to be validated:", error);
    throw error;
  }
}

async function createCenter(city, admin, officeImage) {
  try {
    const result = await db.sequelize.transaction(async (transaction) => {
      // Fetch the OfficeCenterID for the given admin
      const result = await db.sequelize.query(
        `SELECT "office_id" FROM "centers"."office_admins" WHERE "manager_id" = :admin`,
        {
          replacements: { admin },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (!result.length) {
        throw new Error("Admin not found.");
      }

      const officeCenterID = result[0].office_id;

      if (officeCenterID === 0) {
        // Admin has permission to validate content globally
        // Fetch the maximum office_id
        const maxOfficeIdResult = await db.sequelize.query(
          `SELECT MAX("office_id") as max_office_id
         FROM "centers"."offices"`,
          {
            type: QueryTypes.SELECT,
            transaction,
          }
        );

        const maxOfficeId = maxOfficeIdResult[0].max_office_id || 0;
        const newOfficeId = maxOfficeId + 1;

        // Insert into centers.offices with the new office_id
        const officeResult = await db.sequelize.query(
          `INSERT INTO "centers"."offices" ("office_id", "city", "officeImage")
         VALUES (:newOfficeId, :city, :officeImage)
         RETURNING "office_id"`,
          {
            replacements: { newOfficeId, city, officeImage },
            type: QueryTypes.INSERT,
            transaction,
          }
        );

        const officeId = officeResult[0][0].office_id;

        // // Insert into centers.office_admins with the retrieved office_id
        // await db.sequelize.query(
        //   `INSERT INTO "centers"."office_admins" ("office_id", "manager_id")
        //    VALUES (:officeId, :admin)`,
        //   {
        //     replacements: { officeId, admin },
        //     type: QueryTypes.INSERT,
        //     transaction
        //   }
        // );

        return officeId;
      } else {
        throw new Error("Office center not found for the admin.");
      }
    });

    return result;
  } catch (error) {
    console.error("Error creating center:", error);
    throw error;
  }
}

//TODO
async function deleteCenter(center_id) {
  try {
    await db.sequelize.query(
      `DELETE FROM "centers"."offices"
         WHERE "office_id" = :center_id`,
      {
        replacements: { center_id },
        type: QueryTypes.DELETE,
      }
    );
  } catch (error) {
    console.error("Error deleting center:", error);
    throw error;
  }
}

async function spValidateContentHELPER(contentType, contentID, adminID) {
  const transaction = await db.sequelize.transaction();
  try {
    const newDate = new Date();

    // Update CONTENT_VALIDATION_STATUS
    await db.sequelize.query(
      `UPDATE "admin"."content_validation_status"
       SET "validator_id" = :adminID,
           "validation_date" = :newDate,
           "content_status" = 'Approved'
       WHERE "content_real_id" = :contentID AND "content_type" = :contentType`,
      {
        replacements: { adminID, newDate, contentID, contentType },
        type: QueryTypes.UPDATE,
        transaction,
      }
    );

    // Validate content based on the content type
    if (contentType === "post") {
      await db.sequelize.query(
        `UPDATE "dynamic_content"."posts"
         SET "validated" = true, "admin_id" = :adminID
         WHERE "post_id" = :contentID`,
        {
          replacements: { adminID, contentID },
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
    } else if (contentType === "event") {
      await db.sequelize.query(
        `UPDATE "dynamic_content"."events"
         SET "validated" = true, "admin_id" = :adminID
         WHERE "event_id" = :contentID`,
        {
          replacements: { adminID, contentID },
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
    } else if (contentType === "forum") {
      await db.sequelize.query(
        `UPDATE "dynamic_content"."forums"
         SET "validated" = true, "admin_id" = :adminID
         WHERE "forum_id" = :contentID`,
        {
          replacements: { adminID, contentID },
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
    } else {
      throw new Error(
        'Invalid ContentType. Only "post", "event", and "forum" are allowed.'
      );
    }

    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();
    await logError(error.message, error.severity || 16, error.state || 1);
    throw error;
  }
}

async function spValidateContent(contentID, contentType, validatorID) {
  const transaction = await db.sequelize.transaction();
  try {
    // Fetch the OfficeCenterID for the given validatorID
    const result = await db.sequelize.query(
      `SELECT "office_id" FROM "centers"."office_admins" WHERE "manager_id" = :validatorID`,
      {
        replacements: { validatorID },
        type: QueryTypes.SELECT,
        transaction,
      }
    );

    if (!result.length) {
      throw new Error("Validator not found.");
    }

    const officeCenterID = result[0].office_id;

    if (officeCenterID === 0) {
      // Admin has permission to validate content globally
      await spValidateContentHELPER(contentID, contentType, validatorID);
    } else {
      let tableName;
      let additionalCondition;

      // Determine table name and additional condition based on content type
      switch (contentType) {
        case "event":
          tableName = '"dynamic_content"."events"';
          additionalCondition = 'p."event_id"';
          break;
        case "forum":
          tableName = '"dynamic_content"."forums"';
          additionalCondition = 'p."forum_id"';
          break;
        default:
          tableName = '"dynamic_content"."posts"';
          additionalCondition = 'p."post_id"';
          break;
      }

      // Check if the content belongs to the admin's designated center
      const isAuthorized = await db.sequelize.query(
        `SELECT 1
          FROM ${tableName} p
          JOIN "centers"."office_admins" ro ON p."office_id" = ro."office_id"
          WHERE ${additionalCondition} = :contentID
          AND ro."office_id" = :officeCenterID`,
        {
          replacements: { contentID, officeCenterID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (isAuthorized.length > 0) {
        await spValidateContentHELPER(contentID, contentType, validatorID);
      } else {
        throw new Error("Not authorized to validate this content");
      }
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    await logError(error.message, error.severity || 16, error.state || 1);
    throw error;
  }
}

async function spCreateWarning(description, severity, createdBy, officeId = 0) {
  const transaction = await db.sequelize.transaction();
  try {
    // Fetch the office center ID
    const officeCenterResult = await db.sequelize.query(
      `SELECT "office_id"
             FROM "centers"."office_admins"
             WHERE "manager_id" = :createdBy`,
      { replacements: { createdBy }, type: QueryTypes.SELECT, transaction }
    );

    if (officeCenterResult.length === 0) {
      throw new Error("Office center not found for the admin.");
    }

    const officeCenterId = officeCenterResult[0].office_id;

    if (officeCenterId === 0 || officeId === officeCenterId) {
      // Insert the new warning
      await db.sequelize.query(
        `INSERT INTO "control"."warnings" ("description", "warning_level", "admin_id", "office_id")
                 VALUES (:description, :severity, :createdBy, :officeId)`,
        {
          replacements: { description, severity, createdBy, officeId },
          type: QueryTypes.INSERT,
          transaction,
        }
      );
    } else {
      throw new Error("Unauthorized attempt.");
    }

    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();

    console.error("Error creating warning:", error.message);

    throw error;
  }
}

async function spMakeWarningInactive(warningId, adminId, officeId) {
  const transaction = await db.sequelize.transaction();
  try {
    // Fetch the office center ID
    const officeCenterResult = await db.sequelize.query(
      `SELECT "office_id" 
             FROM "centers"."office_admins" 
             WHERE "manager_id" = :adminId`,
      { replacements: { adminId }, type: QueryTypes.SELECT, transaction }
    );

    if (officeCenterResult.length === 0) {
      throw new Error("Office center not found for the admin.");
    }

    const officeCenterId = officeCenterResult[0].office_id;

    if (officeCenterId === 0 || officeId === officeCenterId) {
      // Update the warning to set it inactive
      await db.sequelize.query(
        `UPDATE "control"."warnings"
                 SET "state" = 0
                 WHERE "warning_id" = :warningId`,
        { replacements: { warningId }, type: QueryTypes.UPDATE, transaction }
      );
    } else {
      throw new Error("Unauthorized attempt.");
    }

    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();

    console.error("Error making warning inactive:", error.message);

    throw error;
  }
}

async function getCenters() {
  try {
    const results = await db.sequelize.query(
      ` SELECT 
            co.office_id AS officeid,
            co.city AS city,
            co."officeImage" AS officeImage,
            array_agg(u.first_name || ' ' || u.last_name) AS name
        FROM 
            "centers"."offices" co
        LEFT JOIN 
            "centers"."office_admins" oa ON co.office_id = oa.office_id
        LEFT JOIN 
            "hr"."users" u ON oa.manager_id = u.user_id
        GROUP BY 
            co.office_id, co.city, co."officeImage"
        ORDER BY 
            co.office_id;
`,
      {
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching centers:", error);
    throw error;
  }
}

async function updateCenter(center_id, city, officeImage) {
  const transaction = await db.sequelize.transaction();
  try {
    // Ensure that the replacement map includes all necessary keys
    await db.sequelize.query(
      `UPDATE "centers"."offices"
       SET "city" = COALESCE(:city, "city"), 
           "officeImage" = COALESCE(:officeImage, "officeImage")
       WHERE "office_id" = :center_id`,
      {
        replacements: {
          center_id,
          city: city !== undefined ? city : null,
          officeImage: officeImage !== undefined ? officeImage : null,
        },
        type: QueryTypes.UPDATE,
        transaction,
      }
    );
    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();

    console.error("Error updating center:", error.message);

    throw error;
  }
}

//WIP
async function makeCenterAdmin(officeId, admin) {
  const transaction = await db.sequelize.transaction();
  try {
    await db.sequelize.query(
      `INSERT INTO "centers"."office_admins" ("office_id", "manager_id")
       VALUES (:officeId, :admin)`,
      {
        replacements: { officeId, admin },
        type: QueryTypes.INSERT,
        transaction,
      }
    );
    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();

    console.error("Error making warning inactive:", error.message);

    throw error;
  }
}

async function getReports() {
  try {
    const results = await db.sequelize.query(
      `
      SELECT 
          cp.*, 
          u.first_name , 
          u.last_name, 
          c.*,
          f.office_id 
      FROM 
          "control"."reports" cp
      JOIN 
          hr.users u ON u.user_id = cp.reporter_id
      JOIN 
          communication."comments" c ON c.comment_id = cp.comment_id
      join dynamic_content.forums f on f.forum_id = c.forum_id 


`,
      {
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}

async function deleteReport(reportID) {
  try {
    await db.sequelize.query(
      `DELETE FROM "control"."reports"
         WHERE "report_id" = :reportID`,
      {
        replacements: { reportID },
        type: QueryTypes.DELETE,
      }
    );
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
}

async function createWarnings(warning_level, description, state, admin_id, office_id) {
  try {
    const results = await db.sequelize.query(
      `INSERT INTO "control"."warnings" ("warning_level", "description", "state", "creation_date", "admin_id", "office_id")
         VALUES (:warning_level, :description, :state, CURRENT_TIMESTAMP, :admin_id, :office_id)
         RETURNING "warning_id"`,
      {
        replacements: { warning_level, description, state, admin_id, office_id },
        type: QueryTypes.INSERT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error creating warning:", error);
    throw error;
  }
};

async function updateWarnings(warning_id, warning_level =  null, description = null, state = null) {
  try {
    const results = await db.sequelize.query(
      `UPDATE "control"."warnings"
         SET "warning_level" = COALESCE(:warning_level, "warning_level"),
             "description" = COALESCE(:description, "description"),
             "state" = COALESCE(:state, "state")
         WHERE "warning_id" = :warning_id`,
      {
        replacements: { warning_id, warning_level, description, state },
        type: QueryTypes.UPDATE,
      }
    );
    return results;
  } catch (error) {
    console.error("Error updating warning:", error);
    throw error;
  }
}

async function getCityNameByOfficeId(officeId) {
  try {
    const result = await db.sequelize.query(
      `
      SELECT city
      FROM "centers"."offices"
      WHERE office_id = :officeId
      `,
      {
        replacements: { officeId },
        type: QueryTypes.SELECT,
      }
    );

    if (result.length > 0) {
      return result[0].city;
    } else {
      throw new Error('Office not found');
    }
  } catch (error) {
    console.error('Error fetching city name:', error.message);
    throw error;
  }
}



module.exports = {
  getUserEngagementMetrics,
  getContentValidationStatusByadmin,
  getContentValidationStatus,
  getActiveDiscussions,
  validateContent,
  rejectContent,
  getActiveWarnings,
  getContentCenterToBeValidated,
  createCenter,
  deleteCenter,
  spValidateContent,
  spCreateWarning,
  spMakeWarningInactive,
  getCenters,
  updateCenter,
  makeCenterAdmin,
  getReports,
  deleteReport,
  getAllWarnings,
  createWarnings,
  updateWarnings,
  getCityNameByOfficeId
};
