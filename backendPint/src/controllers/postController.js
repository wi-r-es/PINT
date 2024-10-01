const {
  spCreatePost,
  fnGetPostState,
  spEditPost,
  spDeletePost,
  spGetPost,
} = require("../database/logic_objects/postProcedures");
const db = require("../models");
const { QueryTypes } = require("sequelize");
const controllers = {};

controllers.create_post = async (req, res) => {
  const {
    subAreaId,
    officeId,
    publisher_id,
    title,
    content = null,
    pLocation = null,
    filePath = null,
    type = "N",
    rating = null,
    price = null,
  } = req.body;
  console.log(req.body);
  try {
    await spCreatePost(
      subAreaId,
      officeId,
      publisher_id,
      title,
      content,
      pLocation,
      filePath,
      type,
      rating,
      price
    );
    res
      .status(201)
      .json({ success: true, message: "Post created successfully." });
  } catch (error) {
    console.log("Error: " + error);
    //exit(-1);
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating Post: " + error.message,
      });
  }
};

controllers.edit_post = async (req, res) => {
  const { postId } = req.params;
  const {
    subAreaId = null,
    officeId = null,
    adminId = null,
    title = null,
    content = null,
    pLocation = null,
    filePath = null,
    type = null,
    price = null,
    rating = null,
  } = req.body;
  console.log(req.query);
  try {
    await spEditPost(
      postId,
      subAreaId,
      officeId,
      adminId,
      title,
      content,
      pLocation,
      filePath,
      type,
      price,
      rating
    );
    res
      .status(201)
      .json({ success: true, message: "Post edited successfully." });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error editing Post: " + error.message,
      });
  }
};

controllers.get_post_state = async (req, res) => {
  const { postId } = req.params;
  console.log(req.params);
  try {
    const state = await fnGetPostState(postId);
    res
      .status(201)
      .json({
        success: true,
        message: "Got post state successfully.",
        data: state,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error getting Post state: " + error.message,
      });
  }
};

controllers.delete_post = async (req, res) => {
  const { postId } = req.params;
  console.log(req.params);
  try {
    await spDeletePost(postId);
    res
      .status(201)
      .json({ success: true, message: "Forum deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting Forum: " + error.message,
    });
  }
};


controllers.getPostScoreByID = async (req, res) => {
  const { post_id } = req.params;
  
  try {
    const result = await db.sequelize.query(
      `
      SELECT 
        sc."score"
      FROM  "dynamic_content"."scores" sc
      WHERE sc."post_id" = :post_id
      `,
      {
        replacements: { post_id },
        type: QueryTypes.SELECT,
      }
    );
    if (result.length > 0) {
      res.status(200).json({ success: true, data: result[0].score });
    } else {
      res.status(404).json({ success: false, message: "Post not found" });
    }
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving post: " + error.message,
    });
  }
};


module.exports = controllers;
