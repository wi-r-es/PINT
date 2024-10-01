const db = require("../models");
const { QueryTypes } = require("sequelize");

// Function to get all warnings given an office ID
async function getWarningsByOfficeID(officeID) {
    try {
      const warnings = await db.sequelize.query(
        `
        SELECT 
          w.warning_id, 
          w.warning_level, 
          w.description, 
          w.state, 
          w.creation_date, 
          w.admin_id, 
          u.first_name || ' ' || u.last_name as admin_name,
          w.office_id 
        FROM "control"."warnings" w
        JOIN "hr"."users" u ON w.admin_id = u.user_id
        WHERE w.office_id = :officeID AND w."state" = TRUE
        ORDER BY w.creation_date DESC
        `,
        {
          replacements: { officeID },
          type: QueryTypes.SELECT,
        }
      );
      
      return warnings;
    } catch (error) {
      console.error('Error fetching warnings:', error);
      throw error;
    }
  }

  const controllers = {};
  controllers.warnings_per_office = async (req, res) => {
    const { office_ID } = req.params;
  
    try {
      const warnings = await getWarningsByOfficeID(office_ID);
      return res.status(201).json({
        success: true,
        data: warnings,
        message: "Got warnings succesfuly.",
      });
    } catch (error) {
        console.log(error);
      res.status(500).json({
        success: false,
        message: "Error getting warnings: " + error.message,
      });
    }
  };

  module.exports = controllers;