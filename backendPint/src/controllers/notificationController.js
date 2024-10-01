const {
    triggerNotifications,
    notifyEventChanges,
    notifyEventComments,
    notifyEventCreator,
    notifyEventInteractions
                                } = require('../database/logic_objects/notificationsProcedures');
  
  const controllers = {};
  
  // Trigger notifications
  controllers.triggerNotifications = async (req, res) => {
    const { eventID, postID, areaID, subAreaID } = req.body;
    try {
      await triggerNotifications({ eventID, postID, areaID, subAreaID });
      res.status(200).json({success:true, message:'Notifications triggered successfully.'});
    } catch (error) {
      res.status(500).json({success:false, message:'Error triggering notifications: ' + error.message});
    }
  };
  
  // Notify event changes
  controllers.notifyEventChanges = async (req, res) => {
    const { eventID, subAreaID } = req.body;
    try {
      await notifyEventChanges(eventID, subAreaID);
      res.status(200).json({success:true, message:'Event changes notified successfully.'});
    } catch (error) {
      res.status(500).json({success:false, message:'Error notifying event changes: ' + error.message});
    }
  };
  
  // Notify event comments
  controllers.notifyEventComments = async (req, res) => {
    const { commentID, forumID } = req.body;
    try {
      await notifyEventComments(commentID, forumID);
      res.status(200).json({success:true, message:'Event comments notified successfully.'});
    } catch (error) {
      res.status(500).json({success:false, message:'Error notifying event comments: ' + error.message});
    }
  };
  
  // Notify event creator
  controllers.notifyEventCreator = async (req, res) => {
    const { eventID, interactionDescription } = req.body;
    try {
      await notifyEventCreator(eventID, interactionDescription);
      res.status(200).json({success:true, message:'Event creator notified successfully.'});
    } catch (error) {
      res.status(500).json({success:false, message:'Error notifying event creator: ' + error.message});
    }
  };
  
  // Notify event interactions
  controllers.notifyEventInteractions = async (req, res) => {
    const { eventID } = req.body;
    try {
      await notifyEventInteractions(eventID);
      res.status(200).json({success:true, message:'Event interactions notified successfully.'});
    } catch (error) {
      res.status(500).json({success:false, message:'Error notifying event interactions: ' + error.message});
    }
  };
  
  module.exports = controllers;
  