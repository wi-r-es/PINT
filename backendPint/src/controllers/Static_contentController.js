const {
  spCreateCategory,
  spCreateSubArea,
} = require("../database/logic_objects/categoryProcedures");
const db = require("../models");
const { QueryTypes } = require("sequelize");
const controllers = {};

controllers.create_category = async (req, res) => {
  const { title, icon } = req.body;
  try {
    await spCreateCategory(title, icon);
    res
      .status(201)
      .json({ success: true, message: "Category created successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating category: " + error.message,
    });
  }
};

controllers.create_sub_category = async (req, res) => {
  const { areaId, title } = req.body;
  try {
    await spCreateSubArea(areaId, title);
    res
      .status(201)
      .json({ success: true, message: "Category created successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating category: " + error.message,
    });
  }
};

controllers.get_all_areas = async (req, res) => {
  try {
    const areas = await db.sequelize.query(
      `SELECT * FROM "static_content"."area"`,
      {
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({ success: true, data: areas });
  } catch (error) {
    console.log("WTF IS WRONG: " + error);
    res.status(500).json({
      success: false,
      message: "Error retrieving content: " + error.message,
    });
  }
};

controllers.get_all_sub_areas = async (req, res) => {
  try {
    const sub_areas = await db.sequelize.query(
      `SELECT sa.sub_area_id, sa.title AS title, a.area_id, a.title AS area_title
FROM "static_content"."sub_area" sa
JOIN "static_content"."area" a ON a.area_id = sa.area_id;
`,
      {
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({ success: true, data: sub_areas });
  } catch (error) {
    console.log("WTF IS WRONG V2: " + error);
    res.status(500).json({
      success: false,
      message: "Error retrieving content: " + error.message,
    });
  }
};

controllers.update_category = async (req, res) => {
  const { title, icon } = req.body;
  const { categoryID } = req.params;

  try {
    await db.sequelize.query(
      `UPDATE "static_content"."area" 
             SET 
                title = COALESCE(:title, title), 
                icon_name = COALESCE(:icon, icon_name) 
             WHERE area_id = :categoryID`,
      {
        replacements: {
          categoryID,
          title: title !== undefined ? title : null,
          icon: icon !== undefined ? icon : null,
        },
        type: QueryTypes.UPDATE,
      }
    );
    res
      .status(200)
      .json({ success: true, message: "Category updated successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category: " + error.message,
    });
  }
};

controllers.delete_category = async (req, res) => {
  const { categoryID } = req.params;

  try {
    await db.sequelize.query(
      `DELETE FROM "static_content"."area" WHERE area_id = :categoryID`,
      {
        replacements: { categoryID },
        type: QueryTypes.DELETE,
      }
    );
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category: " + error.message,
    });
  }
};

controllers.update_sub_category = async (req, res) => {
  const { title } = req.body;
  const { subCategoryID } = req.params;

  try {
    await db.sequelize.query(
      `UPDATE "static_content"."sub_area" 
                 SET 
                    title = COALESCE(:title, title) 
                 WHERE sub_area_id = :subCategoryID`,
      {
        replacements: {
          subCategoryID,
          title: title !== undefined ? title : null,
        },
        type: QueryTypes.UPDATE,
      }
    );
    res
      .status(200)
      .json({ success: true, message: "Category updated successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category: " + error.message,
    });
  }
};

controllers.delete_sub_category = async (req, res) => {
  const { subCategoryID } = req.params;

  try {
    await db.sequelize.query(
      `DELETE FROM "static_content"."sub_area" WHERE sub_area_id = :subCategoryID`,
      {
        replacements: { subCategoryID },
        type: QueryTypes.DELETE,
      }
    );
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category: " + error.message,
    });
  }
};

controllers.getAllCenters = async (req, res) => {
  try {
    const centers = await db.sequelize.query(
      `
          SELECT "office_id", "city", "officeImage"
          FROM "centers"."offices"
          ORDER BY "city" ASC;
          `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Offices getter completed.", data:centers });
  } catch (error) {
    console.error("Error fetching centers:", error.message);
    res
    .status(500)
    .json({ success: true, message: "Error getting offices."});
    throw error;
  }
}
module.exports = controllers;
