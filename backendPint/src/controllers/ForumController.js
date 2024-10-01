const {
  spCreateForum,
  spCreateForumForEvent,
  fnGetForumState,
  spChangeForumState,
  spEditForum,
  spDeleteForum,
  spGetForum,
} = require("../database/logic_objects/forumProcedures");

const controllers = {};

controllers.create_forum = async (req, res) => {
  const {
    officeID,
    subAreaId,
    title,
    publisher_id,
    description = null,
  } = req.body;
  console.log(req.body);
  try {
    await spCreateForum(officeID, subAreaId, title, description, publisher_id);
    res
      .status(201)
      .json({ success: true, message: "Forum created successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating Forum: " + error.message,
      });
  }
};

/** @deprecated */
/*
controllers.create_forum_for_event = async (req, res) => {
    const { subAreaId, title, description, publisher_id, eventId } = req.body; 
    console.log(req.body);
    try {
        await spCreateForumForEvent(subAreaId, title, description, publisher_id, eventId);
        res.status(201).json({success:true, message:'Forum for event created successfully.'});
    } catch (error) {
        res.status(500).json({success:false, message:'Error creating Forum for event: ' + error.message});
    }
};
*/
controllers.get_forum_state = async (req, res) => {
  const { forumId } = req.params;
  console.log(req.params);
  try {
    const state = await fnGetForumState(forumId);
    res
      .status(201)
      .json({
        success: true,
        message: "Got Forum state successfully.",
        data: state,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error getting Forum state: " + error.message,
      });
  }
};

controllers.edit_forum = async (req, res) => {
  const { forumId } = req.params;
  const {
    subAreaId = null,
    officeId = null,
    adminId = null,
    title = null,
    content = null,
    eventId = null,
  } = req.body;
  console.log(req.params);
  try {
    await spEditForum(
      forumId,
      subAreaId,
      officeId,
      adminId,
      title,
      content,
      eventId
    );
    res
      .status(201)
      .json({ success: true, message: "Forum edited successfully." });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating Forum: " + error.message,
      });
  }
};

controllers.change_forum_state = async (req, res) => {
  const { forumId } = req.params;
  const { state } = req.body;
  console.log(req.params);
  try {
    await spChangeForumState(forumId, state);
    res
      .status(201)
      .json({ success: true, message: "Forum state changed successfully." });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error changing Forum state: " + error.message,
      });
  }
};

controllers.delete_forum = async (req, res) => {
  const { forumId } = req.params;
  console.log(req.params);
  try {
    await spDeleteForum(forumId);
    res
      .status(201)
      .json({ success: true, message: "Forum deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting Forum: " + error.message,
      });
  }
};
// controllers.get_forum = async (req, res) => {
//   const { forumId } = req.params;
//   console.log(req.params);
//   try {
//     const forum = await spGetForum(forumId);
//     res
//       .status(201)
//       .json({ success: true, message: "Got event successfully.", data: forum });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error getting event: " + error.message,
//     });
//   }
// };

module.exports = controllers;
