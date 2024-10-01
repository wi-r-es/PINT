const db = require("../../../models");

const create_spEngagementMetrics = async () => {
  await db.sequelize.query(`
            CREATE OR REPLACE FUNCTION user_interactions.sp_get_user_engagement_metrics()
            RETURNS TABLE (action_type TEXT, action_count BIGINT) AS $$
            BEGIN
                RETURN QUERY
                SELECT action_type, COUNT(*) AS action_count
                FROM user_interactions.user_actions_log
                GROUP BY action_type;
            END;
            $$ LANGUAGE plpgsql;

        `);
};

const create_spGetContentValidationStatusByAdmin = async () => {
  await db.sequelize.query(
    `
            CREATE OR REPLACE FUNCTION admin.sp_get_content_validation_status_by_admin(admin_id INT)
            RETURNS TABLE (
                content_status TEXT,
                post_count INT,
                event_count INT,
                forum_count INT
            ) AS $$
            DECLARE
                center_id INT;
            BEGIN
                -- Get the CenterID for the given AdminID
                SELECT oa.office_id INTO center_id
                FROM centers.office_admins oa
                WHERE oa.manager_id = admin_id;

                -- If the AdminID does not map to a CenterID, return nothing
                IF center_id IS NULL THEN
                    RAISE NOTICE 'Invalid AdminID or AdminID not associated with any Center';
                    RETURN;
                END IF;

                -- Get content validation status filtered by CenterID and pivot the results
                RETURN QUERY
                SELECT 
                    content_status,
                    COALESCE(post_count, 0) AS post_count,
                    COALESCE(event_count, 0) AS event_count,
                    COALESCE(forum_count, 0) AS forum_count
                FROM (
                    SELECT 
                        cvs.content_status,
                        CASE WHEN cvs.content_type = 'Post' THEN COUNT(*) END AS post_count,
                        CASE WHEN cvs.content_type = 'Event' THEN COUNT(*) END AS event_count,
                        CASE WHEN cvs.content_type = 'Forum' THEN COUNT(*) END AS forum_count
                    FROM admin.content_validation_status cvs
                    LEFT JOIN dynamic_content.posts p ON cvs.content_real_id = p.post_id AND cvs.content_type = 'Post' AND p.office_id = center_id
                    LEFT JOIN dynamic_content.events e ON cvs.content_real_id = e.event_id AND cvs.content_type = 'Event' AND e.office_id = center_id
                    LEFT JOIN dynamic_content.forums f ON cvs.content_real_id = f.forum_id AND cvs.content_type = 'Forum' AND f.office_id = center_id
                    GROUP BY cvs.content_status, cvs.content_type
                ) AS SourceTable
                GROUP BY content_status, post_count, event_count, forum_count
                ORDER BY content_status;
            END;
            $$ LANGUAGE plpgsql;

        `
  );
};

const create_spGetContentValidationStatus = async () => {
  await db.sequelize.query(`
            CREATE OR REPLACE FUNCTION admin.sp_get_content_validation_status()
            RETURNS TABLE (
                content_type TEXT,
                content_status TEXT,
                content_count BIGINT
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT content_type, content_status, COUNT(*) AS content_count
                FROM admin.content_validation_status
                GROUP BY content_type, content_status;
            END;
            $$ LANGUAGE plpgsql;


        `);
};

const create_spGetActiveDiscussions = async () => {
  await db.sequelize.query(`
            CREATE OR REPLACE FUNCTION admin.sp_get_active_discussions()
            RETURNS TABLE (
                forum_id INT,
                title TEXT,
                last_activity_date TIMESTAMPTZ,
                active_participants INT
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT d.forum_id, f.title, d.last_activity_date, d.active_participants
                FROM admin.active_discussions d
                JOIN dynamic_content.forums f ON d.forum_id = f.forum_id
                ORDER BY d.last_activity_date DESC;
            END;
            $$ LANGUAGE plpgsql;

        `);
};
const create_view_user_engagement = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE VIEW admin.vw_user_engagement_metrics AS
        SELECT action_type, COUNT(*) AS engagement_count
        FROM user_interactions.user_actions_log
        GROUP BY action_type;
        `);
};
const create_view_content_validation_status = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE VIEW admin.vw_content_validation_status AS
        SELECT content_type, content_status, COUNT(*) AS content_count
        FROM admin.content_validation_status
        GROUP BY content_type, content_status;
        `);
};

const create_view_active_discussions = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE VIEW admin.vw_active_discussions AS
        SELECT d.forum_id, f.title, d.last_activity_date, d.active_participants
        FROM admin.active_discussions d
        JOIN dynamic_content.forums f ON d.forum_id = f.forum_id;

        `);
};
const create_usersView = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE VIEW "admin".vw_users AS
        SELECT u.user_id, u.first_name, u.last_name, u.email, p.role_name, ro.city
        FROM hr.users u
        JOIN security.acc_permissions p ON u.role_id = p.role_id
        JOIN centers.office_workers ow ON u.user_id = ow.user_id
        JOIN centers.offices ro ON ow.office_id = ro.office_id
        JOIN security.user_account_details d ON u.user_id = d.user_id
        WHERE d.account_status = true;

        `);
};

const create_fn_is_city_valid = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE FUNCTION "admin".fn_is_city_valid(city TEXT)
        RETURNS BOOLEAN AS $$
        DECLARE
            is_valid BOOLEAN;
        BEGIN
            -- Check if the city exists in the CENTERS.OFFICES table
            IF EXISTS (SELECT 1 FROM centers.offices WHERE city = city) THEN
                is_valid := TRUE;
            ELSE
                is_valid := FALSE;
            END IF;

            RETURN is_valid;
        END;
        $$ LANGUAGE plpgsql;

        `);
};
const create_sp_get_users_by_city = async () => {
  await db.sequelize.query(
    `
        CREATE OR REPLACE FUNCTION "admin".sp_get_users_by_city(_city TEXT)
        RETURNS TABLE (
            user_id INT,
            firstname TEXT,
            lastname TEXT,
            email TEXT,
            rolename TEXT,
            city TEXT
        ) AS $$
        BEGIN
            -- Validate the city
            IF NOT fn_is_city_valid(city) THEN
                RAISE EXCEPTION 'Invalid city passed as SP parameter.'
                USING ERRCODE = '70000', MESSAGE = 'Invalid city';
            END IF;

            -- Select from the view
            RETURN QUERY
            SELECT user_id, firstname, lastname, email, rolename, city
            FROM vw_users
            WHERE city = _city;
        END;
        $$ LANGUAGE plpgsql;
    `
  );
};

const create_vw_post_counts = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE VIEW "admin".vw_post_counts AS
        SELECT 
            u.user_id, 
            u.first_name, 
            u.last_name, 
            COUNT(p.post_id) AS post_count, 
            ro.city
        FROM 
            hr.users u
        JOIN 
            centers.office_workers ow ON u.user_id = ow.user_id
        JOIN 
            centers.offices ro ON ow.office_id = ro.office_id
        LEFT JOIN 
            dynamic_content.posts p ON u.user_id = p.publisher_id
        GROUP BY 
            u.user_id, 
            u.first_name, 
            u.last_name, 
            ro.city;
        --ORDER BY post_count DESC;

        `);
};
const create_sp_get_post_counts_by_city = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE FUNCTION "admin".sp_get_post_counts_by_city(_city TEXT)
        RETURNS TABLE (
            user_id INT,
            first_name TEXT,
            last_name TEXT,
            post_count BIGINT,
            city TEXT
        ) AS $$
        BEGIN
            -- Validate the city
            IF NOT fn_is_city_valid(city) THEN
                RAISE EXCEPTION 'Invalid city passed as SP parameter.'
                USING ERRCODE = '70000', MESSAGE = 'Invalid city';
            END IF;

            -- Select from the view
            RETURN QUERY
            SELECT user_id, first_name, last_name, post_count, city
            FROM vw_post_counts
            WHERE city = _city;
        END;
        $$ LANGUAGE plpgsql;

        `);
};

const create_vw_events = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE VIEW "admin".vw_events AS
        SELECT 
            e.event_id, 
            e.name, 
            e.description, 
            e.event_date, 
            COUNT(ep.user_id) AS participant_count, 
            ro.city
        FROM 
            dynamic_content.events e
        JOIN 
            centers.offices ro ON e.office_id = ro.office_id
        LEFT JOIN 
            control.participation ep ON e.event_id = ep.event_id
        GROUP BY 
            e.event_id, 
            e.name, 
            e.description, 
            e.event_date, 
            ro.city;
        --ORDER BY participant_count DESC;

        `);
};
const create_sp_get_events_by_city = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE FUNCTION "admin".sp_get_events_by_city(_city TEXT)
        RETURNS TABLE (
            event_id INT,
            name TEXT,
            description TEXT,
            event_date TIMESTAMPTZ,
            participant_count BIGINT,
            city TEXT
        ) AS $$
        BEGIN
            -- Validate the city
            IF NOT fn_is_city_valid(city) THEN
                RAISE EXCEPTION 'Invalid city passed as SP parameter.'
                USING ERRCODE = '70000', MESSAGE = 'Invalid city';
            END IF;

            -- Select from the view
            RETURN QUERY
            SELECT event_id, name, description, event_date, participant_count, city
            FROM vw_events
            WHERE city = _city;
        END;
        $$ LANGUAGE plpgsql;

        `);
};
const create_vw_forum_discussions = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE VIEW "admin".vw_forum_discussions AS
        SELECT 
            a.title AS category, 
            COUNT(f.forum_id) AS forum_count, 
            ro.city
        FROM 
            static_content.area a
        JOIN 
            static_content.sub_area sa ON a.area_id = sa.area_id
        JOIN 
            dynamic_content.forums f ON sa.sub_area_id = f.sub_area_id
        JOIN 
            centers.offices ro ON f.office_id = ro.office_id
        GROUP BY 
            a.title, ro.city;
        --ORDER BY forum_count DESC;

        `);
};
const create_sp_get_forum_discussions_by_city = async () => {
  await db.sequelize.query(`
        CREATE OR REPLACE FUNCTION "admin".sp_get_forum_discussions_by_city(_city TEXT)
        RETURNS TABLE (
            category TEXT,
            forum_count BIGINT,
            city TEXT
        ) AS $$
        BEGIN
            -- Validate the city
            IF NOT fn_is_city_valid(city) THEN
                RAISE EXCEPTION 'Invalid city passed as SP parameter.'
                USING ERRCODE = '70000', MESSAGE = 'Invalid city';
            END IF;

            -- Select from the view
            RETURN QUERY
            SELECT category, forum_count, city
            FROM vw_forum_discussions
            WHERE city = _city;
        END;
        $$ LANGUAGE plpgsql;

        `);
};
const create = async () => {
  await db.sequelize.query(`
       
        `);
};

module.exports = {
  create_spEngagementMetrics,
  create_spGetContentValidationStatusByAdmin,
  create_spGetContentValidationStatus,
  create_spGetActiveDiscussions,
  create_view_content_validation_status,
  create_view_active_discussions,
  create_usersView,

  create_fn_is_city_valid,
  create_sp_get_users_by_city,
  create_vw_post_counts,
  create_sp_get_post_counts_by_city,
  create_vw_events,
  create_sp_get_events_by_city,
  create_vw_forum_discussions,
  create_sp_get_forum_discussions_by_city,
};
