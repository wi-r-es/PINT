const {
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
} = require("../database/logic_objects/commentsProcedures");

const { getPostCreator } = require("../database/logic_objects/postProcedures");
const {
  getForumCreator,
  checkIfForumBelongsToEvent,
  getEventIdByForumId,
} = require("../database/logic_objects/forumProcedures");

const {
  getEventNameById,
  spGetParticipants
} = require("../database/logic_objects/eventProcedures");

const {
  getUserFullName,
} = require("../database/logic_objects/usersProcedures");

const {
  sendNewCommentNotification,
  sendLikeNotification,
  sendNewCommentNotificationForEventsParticipants
} = require("../utils/realTimeNotifications");

const validator = require("validator");
const controllers = {};

// const {
//   sendCommentforumNotif,
//   sendCommentpostNotif,
// } = require("../websockets");

controllers.add_comment = async (req, res) => {
  const {
    parentCommentID = null,
    contentID,
    contentType,
    //userID,
    commentText,
  } = req.body;
  console.log(req.query);

  // Validate inputs
  if (parentCommentID && !validator.isInt(parentCommentID.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid parent comment ID" });
  }
  if (!validator.isInt(contentID.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid content ID" });
  }
  if (!validator.isIn(contentType, ["Post", "Forum"])) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid content type" });
  }
  // if (!validator.isInt(userID.toString())) {
  //   return res.status(400).json({ success: false, message: "Invalid user ID" });
  // }
  if (validator.isEmpty(commentText)) {
    return res
      .status(400)
      .json({ success: false, message: "Comment text cannot be empty" });
  }
  const userID = req.user.id; // Extracted from JWT
  //const intContID = parseInt(contentID);
  var flag = false;
  try {
    var id = await spAddComment({
      parentCommentID,
      contentID,
      contentType,
      userID,
      commentText,
    });
    var ownerID;
    if (contentType == "Post") {
      ownerID = await getPostCreator(contentID);
    }
    if (contentType == "Forum") {
      ownerID = await getForumCreator(contentID);
      var belongsToEvent = await checkIfForumBelongsToEvent(contentID);
      if (belongsToEvent) {
        flag = true;
      }
    }

    var username = await getUserFullName(userID);
    var fullname =
      username.firstName.toString() + " " + username.lastName.toString();
    if (flag) {
      var eventID = await getEventIdByForumId(contentID);
      const eventName = await getEventNameById(eventID);
      const contentString = "Forum of Event: " + eventName;
      const eventparticipants = await spGetParticipants(eventID);

      // Remove the owner ID from the participants list
      const filteredParticipants = eventparticipants.filter(
        participant => participant.user_id !== ownerID
      );
      
      await sendNewCommentNotificationForEventsParticipants(
        contentID,
        filteredParticipants,
        fullname,
        eventName
      );
      await sendNewCommentNotification(
        ownerID,
        contentID,
        contentType,
        fullname
      );
    } else {
      await sendNewCommentNotification(
        ownerID,
        contentID,
        contentType,
        fullname
      );
    }
    res
      .status(201)
      .json({ success: true, message: "Comment added successfully." });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error adding Comment: " + error.message,
    });
  }
};

controllers.get_comments_tree = async (req, res) => {
  const { contentID, contentType } = req.params;
  console.log(req.params);

  // Validate inputs
  if (!validator.isInt(contentID.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid content ID" });
  }
  if (!validator.isIn(contentType, ["post", "forum"])) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid content type" });
  }

  try {
    const comments = await getCommentTree(contentID, contentType);
    res.status(201).json({
      success: true,
      data: comments,
      message: "Got comments tree successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting comments tree: " + error.message,
    });
  }
};

controllers.like_comment = async (req, res) => {
  const { commentID } = req.body;
  console.log(req.body);
  const userID = req.user.id; // Extracted from JWT
  try {
    const comments = await likeComment(commentID, userID);
    var username = await getUserFullName(userID);
    var fullname = username.firstName + " " + username.lastName;
    const commentOwnerId = await getCommentPublisher(commentID);
    await sendLikeNotification(commentOwnerId, fullname);

    res.status(201).json({
      success: true,
      data: comments,
      message: "Liked comment successfuly.",
    });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error liking comment: " + error.message,
    });
  }
};
controllers.unlike_comment = async (req, res) => {
  const { commentID } = req.body;
  console.log(req.body);
  const userID = req.user.id; // Extracted from JWT
  try {
    const comments = await unlikeComment(commentID, userID);
    res.status(201).json({
      success: true,
      data: comments,
      message: "Unliked comment successfuly.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unliking comment: " + error.message,
    });
  }
};

controllers.report_comment = async (req, res) => {
  const { contentID, contentType } = req.params;
  const { commentID, reporterID, observation } = req.body;
  console.log(req.body);

  try {
    const comments = await reportComment(commentID, reporterID, observation);
    res.status(201).json({
      success: true,
      data: comments,
      message: "Reported comment successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reporting comment: " + error.message,
    });
  }
};

controllers.likes_per_content = async (req, res) => {
  const { contentID, contentType } = req.params;
  const user_id = req.user.id; // Extracted from JWT

  // Validate inputs
  if (!validator.isInt(contentID.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid content ID" });
  }
  if (!validator.isIn(contentType, ["post", "forum"])) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid content type" });
  }
  try {
    const comments = await getCommentTree_forlikes(contentID, contentType);
    const likedComments = await likes_per_content(comments, user_id);
    return res.status(201).json({
      success: true,
      data: likedComments,
      message: "Got comments likes succesfuly per user.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reporting comment: " + error.message,
    });
  }
};

controllers.delete_comment = async (req, res) => {
  const { commentID } = req.params;
  console.log(req.params);
  try {
    const comments = await deleteComment(commentID);
    res.status(200).json({
      success: true,
      data: comments,
      message: "Deleted comment successfuly.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment: " + error.message,
    });
  }
};

controllers.likes_per_user = async (req, res) => {
  const { userID } = req.params;
  console.log(req.params);

  // Validate inputs
  if (!validator.isInt(userID.toString())) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  try {
    const comments = await likes_per_user(userID);
    res.status(200).json({
      success: true,
      data: comments,
      message: "Got likes per user successfuly.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting likes per user: " + error.message,
    });
  }
};

module.exports = controllers;
