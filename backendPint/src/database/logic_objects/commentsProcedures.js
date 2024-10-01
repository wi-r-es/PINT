const db = require("../../models");
const { QueryTypes } = require("sequelize");

const { log_err } = require("../../utils/logError");

// const contentTables = {
//   post: "post_id",
//   forum: "forum_id",
// };
async function spAddComment({
  parentCommentID = null,
  contentID,
  contentType,
  userID,
  commentText,
}) {
  const t = await db.sequelize.transaction();
  try {
    // Insert the new comment
    const [result] = await db.sequelize.query(
      `INSERT INTO "communication"."comments" (
         ${contentType === "Forum" ? '"forum_id"' : '"post_id"'}, 
         "publisher_id", "comment_date", "content"
       ) VALUES (
         :contentID, :userID, CURRENT_TIMESTAMP, :commentText
       ) RETURNING "comment_id"`,
      {
        replacements: { contentID, userID, commentText },
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );

    const newCommentID = result[0].comment_id;

    // Insert the path to the new comment (self-reference with depth 0)
    await db.sequelize.query(
      `INSERT INTO "communication"."comment_path" ("ancestor_id", "descendant_id", "depth")
       VALUES (:newCommentID, :newCommentID, 0)`,
      {
        replacements: { newCommentID },
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );

    // If this is a reply to another comment, update the comment_path table
    if (parentCommentID !== null) {
      // Check if the parent comment exists
      const parentCommentExists = await sequelize.query(
        `SELECT 1 FROM "communication"."comments" WHERE "comment_id" = :parentCommentID`,
        {
          replacements: { parentCommentID },
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );

      if (parentCommentExists.length === 0) {
        throw new Error("Parent comment does not exist.");
      }

      // Insert paths for all ancestors of the parent comment to the new comment
      await db.sequelize.query(
        `INSERT INTO "communication"."comment_path" ("ancestor_id", "descendant_id", "depth")
         SELECT "ancestor_id", :newCommentID, "depth" + 1
         FROM "communication"."comment_path"
         WHERE "descendant_id" = :parentCommentID
         ON CONFLICT ("ancestor_id", "descendant_id") DO NOTHING`,
        {
          replacements: { newCommentID, parentCommentID },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );

      // Insert the direct link from parent to new comment
      await db.sequelize.query(
        `INSERT INTO "communication"."comment_path" ("ancestor_id", "descendant_id", "depth")
         VALUES (:parentCommentID, :newCommentID, 1)
         ON CONFLICT ("ancestor_id", "descendant_id") DO NOTHING`,
        {
          replacements: { parentCommentID, newCommentID },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }

    await t.commit();
    return newCommentID;
  } catch (error) {
    await t.rollback();
    console.error("Error adding comment:", error.message);

    try {
      await db.sequelize.query(
        `SELECT security.error_log(:errorMessage, :errorSeverity, :errorState)`,
        {
          replacements: {
            errorMessage: error.message,
            errorSeverity: "ERROR",
            errorState: "ERROR",
          },
          type: QueryTypes.SELECT,
        }
      );
    } catch (logError) {
      console.error("Error logging the error:", logError.message);
    }

    throw error;
  }
}

async function getCommentTree(contentID, contentType) {
  try {
    const results = await db.sequelize.query(
      `WITH RECURSIVE "CommentHierarchy" AS (
        SELECT 
          c."comment_id",
          c."forum_id",
          c."post_id",
          c."publisher_id",
          c."comment_date",
          c."content",
          c."likes",
          0 AS "depth",
          ARRAY[c."comment_id"] AS "path"
        FROM "communication"."comments" c
        WHERE 
          c."post_id" = :contentID OR
          c."forum_id" = :contentID

        UNION ALL

        SELECT 
          c."comment_id",
          c."forum_id",
          c."post_id",
          c."publisher_id",
          c."comment_date",
          c."content",
          c."likes",
          ch."depth" + 1,
          ch."path" || c."comment_id"
        FROM "communication"."comments" c
        INNER JOIN "communication"."comment_path" cp ON c."comment_id" = cp."descendant_id"
        INNER JOIN "CommentHierarchy" ch ON cp."ancestor_id" = ch."comment_id"
        WHERE NOT c."comment_id" = ANY(ch."path")
      )
      SELECT 
        "comment_id",
        "forum_id",
        "post_id",
        "publisher_id",
        "comment_date",
        "content",
        "likes",
        "depth"
      FROM "CommentHierarchy";
      `,
      {
        replacements: { contentID, contentType },
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching comment tree:", error);
    throw error;
  }
}

// async function getCommentTree(contentID, contentType) {
//   try {
//     const results = await db.sequelize.query(
//       `WITH RECURSIVE "CommentHierarchy" AS (
//         -- Anchor member: start with the comments directly related to the content (post or forum)
//         SELECT
//           c."comment_id",
//           c."forum_id",
//           c."post_id",
//           c."publisher_id",
//           c."comment_date",
//           c."content",
//           0 AS "depth"
//         FROM "communication"."comments" c
//         WHERE
//           (c."post_id" = :contentID AND :contentType = 'Post') OR
//           (c."forum_id" = :contentID AND :contentType = 'Forum')

//         UNION ALL

//         -- Recursive member: join with the comment_path to get the child comments
//         SELECT
//           c."comment_id",
//           c."forum_id",
//           c."post_id",
//           c."publisher_id",
//           c."comment_date",
//           c."content",
//           ch."depth" + 1
//         FROM "communication"."comments" c
//         INNER JOIN "communication"."comment_path" cp ON c."comment_id" = cp."descendant_id"
//         INNER JOIN "CommentHierarchy" ch ON cp."ancestor_id" = ch."comment_id"
//         WHERE cp."depth" > 0 AND
//           ((c."post_id" = :contentID AND :contentType = 'Post') OR
//            (c."forum_id" = :contentID AND :contentType = 'Forum'))
//       )
//       SELECT
//         "comment_id",
//         "forum_id",
//         "post_id",
//         "publisher_id",
//         "comment_date",
//         "content",
//         "depth"
//       FROM "CommentHierarchy";
//       `,
//       {
//         replacements: { contentID, contentType },
//         type: QueryTypes.SELECT,
//       }
//     );
//     return results;
//   } catch (error) {
//     console.error("Error fetching comment tree:", error);
//     throw error;
//   }
// }

async function likeComment(commentID, userID) {
  const t = await db.sequelize.transaction();
  try {
    // Insert the like into the likes table
    await db.sequelize.query(
      `INSERT INTO "communication"."likes" ("comment_id", "publisher_id", "like_date")
       VALUES (:commentID, :userID, CURRENT_TIMESTAMP)
       ON CONFLICT ("comment_id", "publisher_id") DO NOTHING
       `,
      {
        replacements: { commentID, userID },
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );

    await t.commit();
    console.log("Comment liked successfully.");
  } catch (error) {
    await t.rollback();
    console.error("Error liking comment: ", error.message);

    //log_err(error.message);

    throw error;
  }
}

async function unlikeComment(commentID, userID) {
  const t = await db.sequelize.transaction();
  try {
    // Delete the like from the likes table
    const result = await db.sequelize.query(
      `DELETE FROM "communication"."likes"
       WHERE "comment_id" = :commentID AND "publisher_id" = :userID`,
      {
        replacements: { commentID, userID },
        type: QueryTypes.DELETE,
        transaction: t,
      }
    );

    if (result[1] === 0) {
      // If no rows were affected, the like did not exist
      throw new Error(
        "Like does not exist for the specified comment and user."
      );
    }

    await t.commit();
    console.log("Comment unliked successfully.");
  } catch (error) {
    await t.rollback();
    console.error("Error unliking comment:", error.message);

    log_err(error.message);

    throw error;
  }
}

async function reportComment(commentID, reporterID, observation) {
  const t = await db.sequelize.transaction();
  try {
    // Insert the report into the reports table
    await db.sequelize.query(
      `INSERT INTO "control"."reports" ("comment_id", "reporter_id", "report_date", "observation")
       VALUES (:commentID, :reporterID, CURRENT_TIMESTAMP, :observation)`,
      {
        replacements: { commentID, reporterID, observation },
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );

    await t.commit();
    console.log("Comment reported successfully.");
  } catch (error) {
    await t.rollback();
    console.error("Error reporting comment:", error.message);

    log_err(error.message);

    throw error;
  }
}

async function getCommentTree_forlikes(contentID, contentType) {
  try {
    const results = await db.sequelize.query(
      `
        SELECT 
          c."comment_id",
          c."forum_id",
          c."post_id",
          c."publisher_id"
        FROM "communication"."comments" c
        WHERE 
          c."post_id" = :contentID OR
          c."forum_id" = :contentID
      `,
      {
        replacements: { contentID, contentType },
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching comment tree:", error);
    throw error;
  }
}


async function likes_per_content(comments, user_id) {
  const t = await db.sequelize.transaction();
  try {
    const likedComments = [];
    comments.forEach((comment) => {
      console.log(comment);
    });
    for (const el of comments) {
      const { comment_id } = el;

      const [result] = await db.sequelize.query(
        `
        SELECT "comment_id"
        FROM "communication"."likes"
        WHERE "comment_id" = :comment_id AND "publisher_id" = :user_id
        LIMIT 1;
        `,
        {
          replacements: { comment_id, user_id },
          type: QueryTypes.SELECT,
        }
      );

      if (result) {
        likedComments.push(result.comment_id);
      }
    }

    console.log("Liked comment IDs:", likedComments);
    // Return the array of liked comment IDs
    return likedComments;
  } catch (error) {
    await t.rollback();
    console.error("Error checking liked comments :", error.message);

    log_err(error.message);

    throw error;
  }
}

async function getCommentPublisher(commentID) {
  try {
    const publisherResult = await db.sequelize.query(
      `
       SELECT "publisher_id" AS "user_id"
       FROM "communication"."comments" 
       WHERE "comment_id" = :commentID`,
      {
        replacements: { commentID },
        type: QueryTypes.SELECT,
      }
    );

    if (publisherResult.length === 0) {
      throw new Error("Comment or publisher not found.");
    }

    return publisherResult[0].user_id;
  } catch (error) {
    console.error("Error retrieving comment publisher:", error.message);
    log_err(error.message);

    throw error;
  }
}

async function deleteComment(comment_id) {
  const t = await db.sequelize.transaction();
  try {
    // Delete related reports first
    await db.sequelize.query(
      `DELETE FROM "control"."reports"
       WHERE "comment_id" = :comment_id`,
      {
        replacements: { comment_id },
        type: QueryTypes.DELETE,
        transaction: t,
      }
    );

    // Delete the comment
    const result = await db.sequelize.query(
      `DELETE FROM "communication"."comments"
       WHERE "comment_id" = :comment_id`,
      {
        replacements: { comment_id },
        type: QueryTypes.DELETE,
        transaction: t,
      }
    );

    if (result[1] === 0) {
      // If no rows were affected, the comment did not exist
      throw new Error("Comment does not exist.");
    }

    await t.commit();
    console.log("Comment deleted successfully.");
  } catch (error) {
    await t.rollback();
    console.error("Error deleting comment:", error.message);

    log_err(error.message);

    throw error;
  }
}

async function likes_per_user(userID) {
  try {
    const results = await db.sequelize.query(
      `
      SELECT 
        "comment_id"
      FROM "communication"."likes"
      WHERE "publisher_id" = :userID
      `,
      {
        replacements: { userID },
        type: QueryTypes.SELECT,
      }
    );
    return results;
  } catch (error) {
    console.error("Error fetching likes per user:", error);
    throw error;
  }
  
}



module.exports = {
  spAddComment,
  getCommentTree,
  likeComment,
  unlikeComment,
  reportComment,
  likes_per_content,
  getCommentTree_forlikes,
  getCommentPublisher,
  deleteComment,
  likes_per_user,
};
