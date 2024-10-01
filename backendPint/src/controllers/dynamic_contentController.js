const db = require("../models");
const { QueryTypes, Op } = require("sequelize");
const validator = require("validator");
const controllers = {};

controllers.getAllContent = async (req, res) => {
  try {
    // Raw query to get all posts ordered by creation_date in descending order
    const posts = await db.sequelize.query(
      `SELECT * FROM "dynamic_content"."posts" p 
LEFT JOIN "dynamic_content"."scores" sc ON p."post_id" = sc."post_id"
ORDER BY p.creation_date DESC `,
      { type: QueryTypes.SELECT }
    );

    // Raw query to get all forums ordered by creation_date in descending order
    const forums = await db.sequelize.query(
      `SELECT * FROM "dynamic_content"."forums" f ORDER BY f.creation_date DESC `,
      { type: QueryTypes.SELECT }
    );

    // Raw query to get all events ordered by creation_date in descending order
    const events = await db.sequelize.query(
      `SELECT * FROM "dynamic_content"."events" e ORDER BY e.creation_date DESC `,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json({ posts, forums, events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving content: " + error.message,
    });
  }
};
controllers.getAllContentByCity = async (req, res) => {
  const { city_id } = req.params;
  if (!validator.isInt(city_id)) {
    return res.status(400).json({ success: false, message: "Invalid city ID" });
  }
  try {
    const posts = await db.sequelize.query(
      ` SELECT p.*, o.city, s.score 
        FROM "dynamic_content"."posts" p 
        JOIN "centers"."offices" o ON p.office_id = o.office_id
        JOIN "dynamic_content"."scores" s ON p.post_id = s.post_id
        WHERE o.office_id = :city_id AND p.validated=true
        ORDER BY p.creation_date DESC `,
      {
        replacements: { city_id },
        type: QueryTypes.SELECT,
      }
    );

    const forums = await db.sequelize.query(
      `     SELECT * FROM "dynamic_content"."forums" f 
            JOIN "centers"."offices" o ON f.office_id = o.office_id
            WHERE o.office_id = :city_id AND f.validated=true
            ORDER BY f.creation_date DESC `,
      {
        replacements: { city_id },
        type: QueryTypes.SELECT,
      }
    );

    const events = await db.sequelize.query(
      ` SELECT e.*, o.city, s.score  
        FROM "dynamic_content"."events" e 
        JOIN "centers"."offices" o ON e.office_id = o.office_id
        JOIN "dynamic_content"."scores" s ON e.event_id = s.event_id
        WHERE o.office_id = :city_id AND e.validated=true
        ORDER BY e.creation_date DESC `,
      {
        replacements: { city_id },
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({ posts, forums, events });
  } catch (error) {
    console.log (error);
    console.log (error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving content: " + error.message,
    });
  }
};

controllers.getPostsByCity = async (req, res) => {
  const { city_id } = req.params;
  if (!validator.isInt(city_id)) {
    return res.status(400).json({ success: false, message: "Invalid city ID" });
  }
  try {
    const posts = await db.sequelize.query(
      `
            SELECT p.*, o.city, s.score
            FROM "dynamic_content"."posts" p
            JOIN "centers"."offices" o ON p.office_id = o.office_id
            JOIN "dynamic_content"."scores" s ON p.post_id = s.post_id
            WHERE o.office_id = :city_id AND p.validated=true
            ORDER BY p.creation_date DESC
        `,
      {
        replacements: { city_id },
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving posts: " + error.message,
    });
  }
};

controllers.getForumsByCity = async (req, res) => {
  const { city_id } = req.params;
  if (!validator.isInt(city_id)) {
    return res.status(400).json({ success: false, message: "Invalid city ID" });
  }
  try {
    const forums = await db.sequelize.query(
      `
            SELECT f.*, o.city
            FROM "dynamic_content"."forums" f
            JOIN "centers"."offices" o ON f.office_id = o.office_id
            WHERE o.office_id = :city_id AND f.validated=true
            ORDER BY f.creation_date DESC
        `,
      {
        replacements: { city_id },
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({ success: true, data: forums });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving forums: " + error.message,
    });
  }
};

controllers.getEventsByCity = async (req, res) => {
  const { city_id } = req.params;
  if (!validator.isInt(city_id)) {
    return res.status(400).json({ success: false, message: "Invalid city ID" });
  }
  try {
    const events = await db.sequelize.query(
      `
            SELECT e.*, o.city, s.score
            FROM "dynamic_content"."events" e
            JOIN "centers"."offices" o ON e.office_id = o.office_id
            JOIN "dynamic_content"."scores" s ON e.event_id = s.event_id
            WHERE o.office_id = :city_id AND e.validated=true
            ORDER BY e.creation_date DESC
        `,
      {
        replacements: { city_id },
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving events: " + error.message,
    });
  }
};

controllers.getPostById = async (req, res) => {
  const { post_id } = req.params;
  if (!validator.isInt(post_id)) {
    return res.status(400).json({ success: false, message: "Invalid post ID" });
  }
  try {
    const post = await db.sequelize.query(
      `
      SELECT 
        p.*,
        pub."first_name" AS "PublisherFirstName",
        pub."last_name" AS "PublisherLastName",
        admin."first_name" AS "AdminFirstName",
        admin."last_name" AS "AdminLastName",
        sc."score",
        sc."num_of_evals",
        sa.title as "SubAreaTitle"
      FROM "dynamic_content"."posts" p
      LEFT JOIN "hr"."users" pub ON p."publisher_id" = pub."user_id"
      LEFT JOIN "hr"."users" admin ON p."admin_id" = admin."user_id"
      LEFT JOIN "dynamic_content"."scores" sc ON p."post_id" = sc."post_id"
      left join "static_content".sub_area sa on SA.sub_area_id = P.sub_area_id 
      WHERE p."post_id" = :post_id
      `,
      {
        replacements: { post_id },
        type: QueryTypes.SELECT,
      }
    );

    if (post.length > 0) {
      res.status(200).json(post[0]);
    } else {
      res.status(404).json({ success: false, message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving post: " + error.message,
    });
  }
};

controllers.getEventById = async (req, res) => {
  const { event_id } = req.params;
  const user_id = req.user.id; // Extracted from JWT
  if (!validator.isInt(event_id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid event ID" });
  }
  try {
    const event = await db.sequelize.query(
      `
      SELECT 
        e.*,  -- Select all fields from the events table
        pub."first_name" AS "PublisherFirstName",
        pub."last_name" AS "PublisherLastName",
        admin."first_name" AS "AdminFirstName",
        admin."last_name" AS "AdminLastName",
        sc."score",
        sc."num_of_evals",
        f."forum_id",
        f."title" AS "ForumTitle",
        f."content" AS "ForumContent"
      FROM "dynamic_content"."events" e
      LEFT JOIN "hr"."users" pub ON e."publisher_id" = pub."user_id"
      LEFT JOIN "hr"."users" admin ON e."admin_id" = admin."user_id"
      LEFT JOIN "dynamic_content"."scores" sc ON e."event_id" = sc."event_id"
      LEFT JOIN "dynamic_content"."forums" f ON e."event_id" = f."event_id"
      LEFT JOIN "control"."event_forum_access" efa 
        ON f."forum_id" = efa."forum_id" AND efa."user_id" = :user_id
      WHERE e."event_id" = :event_id
      `,
      {
        replacements: { event_id, user_id },
        type: QueryTypes.SELECT,
      }
    );

    if (!(event.length > 0)) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    const event_ = event[0];
    // Check if the user is registered for the event
    const participationExists = await db.sequelize.query(
      `SELECT 1
            FROM "control"."participation"
            WHERE "user_id" = :user_id AND "event_id" = :eventId`,
      { replacements: { user_id, eventId: event_id }, type: QueryTypes.SELECT }
    );

    // If user is registered, fetch the forum details
    let forum = null;
    if (participationExists.length > 0) {
      const forumResult = await db.sequelize.query(
        `SELECT "forum_id", "title", "content", "creation_date"
                FROM "dynamic_content"."forums"
                WHERE "event_id" = :eventId`,
        { replacements: { eventId: event_id }, type: QueryTypes.SELECT }
      );

      if (forumResult.length > 0) {
        forum = forumResult[0];
      }
    }

    // Construct the response
    const response = {
      event_,
      forum,
    };

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving event",
      error: error.message,
    });
  }
};

controllers.getForumById = async (req, res) => {
  const { forum_id } = req.params;
  if (!validator.isInt(forum_id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid forum ID" });
  }
  try {
    const forum = await db.sequelize.query(
      `
      SELECT 
          p.*,
          pub."first_name" AS "PublisherFirstName",
          pub."last_name" AS "PublisherLastName",
          admin."first_name" AS "AdminFirstName",
          admin."last_name" AS "AdminLastName",
          sa.title as "SubAreaTitle"
      FROM "dynamic_content"."forums" p
      LEFT JOIN "hr"."users" pub ON p."publisher_id" = pub."user_id"
      LEFT JOIN "hr"."users" admin ON p."admin_id" = admin."user_id"
      LEFT JOIN static_content.sub_area sa ON p.sub_area_id = sa.sub_area_id 
      WHERE p."forum_id" = :forum_id
      `,
      {
        replacements: { forum_id },
        type: QueryTypes.SELECT,
      }
    );

    if (forum.length > 0) {
      res.status(200).json(forum[0]);
    } else {
      res.status(404).json({ success: false, message: "Forum not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving forum: " + error.message,
    });
  }
};

controllers.getUserInfo = async (req, res) => {
  const { user_id } = req.params;
  if (!validator.isInt(user_id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }
  try {
    const user = await db.sequelize.query(
      `
      SELECT 
        u."user_id",
        u."first_name",
        u."last_name",
        u."email",
        u."role_id",
        u."last_access",
        u."google_id",
		    u."fcmToken",
        o."office_id",
        o."city"
      FROM "hr"."users" u
      LEFT JOIN "centers"."office_workers" ow ON u."user_id" = ow."user_id"
      LEFT JOIN "centers"."offices" o ON ow."office_id" = o."office_id"
      WHERE u."user_id" = :user_id
      `,
      {
        replacements: { user_id },
        type: QueryTypes.SELECT,
      }
    );

    if (user.length > 0) {
      res.status(200).json({ success: true, data: user[0] });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user info: " + error.message,
    });
  }
};

controllers.getUsers = async (req, res) => {
  try {
    const query = `
            SELECT DISTINCT u.user_id, u.email, u.first_name, u.last_name, u.hashed_password,
                            ow.office_id, o.city
            FROM "hr"."users" u
            LEFT JOIN "centers"."office_workers" ow ON u.user_id = ow.user_id
            LEFT JOIN "centers"."offices" o ON ow.office_id = o.office_id
        `;

    const users = await db.sequelize.query(query, {
      type: db.Sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving users: " + error.message,
    });
  }
};

controllers.updateUserOffice = async (req, res) => {
  const { user_id, office_id } = req.body;
  console.log(req.body);
  // if (!validator.isInt(user_id) || !validator.isInt(office_id)) {
  //     return res.status(400).json({ success: false, message: 'Invalid user ID or office ID' });
  // }
  try {
    // Check if the user exists
    const user = await db.sequelize.query(
      `SELECT * FROM "hr"."users" WHERE "user_id" = :user_id`,
      {
        replacements: { user_id },
        type: QueryTypes.SELECT,
      }
    );
    if (user.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the office exists
    const office = await db.sequelize.query(
      `SELECT * FROM "centers"."offices" WHERE "office_id" = :office_id`,
      {
        replacements: { office_id },
        type: QueryTypes.SELECT,
      }
    );
    if (office.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Office not found" });
    }

    // Check if the office worker record exists
    const officeWorker = await db.sequelize.query(
      `SELECT * FROM "centers"."office_workers" WHERE "user_id" = :user_id`,
      {
        replacements: { user_id },
        type: QueryTypes.SELECT,
      }
    );

    if (officeWorker.length > 0) {
      // Delete the existing office worker record
      await db.sequelize.query(
        `DELETE FROM "centers"."office_workers" WHERE "user_id" = :user_id`,
        {
          replacements: { user_id },
          type: QueryTypes.DELETE,
        }
      );
    }

    // Create a new office worker record
    await db.sequelize.query(
      `INSERT INTO "centers"."office_workers" ("user_id", "office_id")
       VALUES (:user_id, :office_id)`,
      {
        replacements: { user_id, office_id },
        type: QueryTypes.INSERT,
      }
    );

    res
      .status(200)
      .json({ success: true, message: "User office updated successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user office: " + error.message,
    });
  }
};

controllers.getEventByDate = async (req, res) => {
  const { date } = req.params;

  // Validate the date format (assuming YYYY-MM-DD)
  if (!validator.isISO8601(date)) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format. Please use YYYY-MM-DD.",
    });
  }

  try {
    console.log(date);

    // Ensure that the event_date is compared correctly considering timezones
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const events = await db.sequelize.query(
      `
      SELECT 
        e.*,
        s.score
      FROM "dynamic_content"."events" e
      JOIN "dynamic_content"."scores" s ON e.event_id = s.event_id
      WHERE e."event_date" >= :startDate
      AND e."event_date" < :endDate
      ORDER BY e."creation_date" DESC
      `,
      {
        replacements: {
          startDate: startDate.toISOString(), // Convert dates to UTC format
          endDate: endDate.toISOString(),
        },
        type: QueryTypes.SELECT,
      }
    );

    // Filter validated events
    const newEvents = events.filter((event) => event.validated === true);

    res.status(200).json({ success: true, data: newEvents });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving events: " + error.message,
    });
  }
};

controllers.getPosts = async (req, res) => {
  try {
    const posts = await db.sequelize.query(
      `
            SELECT p.*, s.score
            FROM "dynamic_content"."posts" p
            JOIN "dynamic_content"."scores" s ON p.post_id = s.post_id
            ORDER BY p.creation_date DESC
        `,
      {
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving posts: " + error.message,
    });
  }
};
controllers.getForums = async (req, res) => {
  try {
    const forums = await db.sequelize.query(
      `
            SELECT f.*
            FROM "dynamic_content"."forums" f
            ORDER BY f.creation_date DESC
        `,
      {
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({ success: true, data: forums });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving forums: " + error.message,
    });
  }
};
controllers.getEvents = async (req, res) => {
  try {
    const events = await db.sequelize.query(
      `
            SELECT e.*, s.score
            FROM "dynamic_content"."events" e
            JOIN "dynamic_content"."scores" s ON e.event_id = s.event_id
            ORDER BY e.creation_date DESC
        `,
      {
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving events: " + error.message,
    });
  }
};

module.exports = controllers;

/*
controllers.getUserPreferences = async (req, res) => {
  const { user_id } = req.query;

  try {
    const userPreferences = await db.sequelize.query(
      `
      SELECT * FROM "hr"."user_prefs"
      WHERE "user_id" = :user_id
      `,
      {
        replacements: { user_id },
        type: QueryTypes.SELECT,
      }
    );

    // Send the retrieved user preferences as JSON
    res.status(200).json(userPreferences);
  } catch (error) {
    // Handle any errors that occur during the query execution
    res.status(500).send('Error retrieving user preferences: ' + error.message);
  }
};
*/
