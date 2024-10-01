const db = require("../models");
const { QueryTypes } = require("sequelize");

const {
  spCreateEvent,
  spEventParticipationCleanup,
  spRegisterUserForEvent,
  spUnregisterUserFromEvent,
  fnGetEventState,
  spEditEvent,
  spGetParticipants,
  spGetParticipants_adm,
  getEventNameById,
  getEventCreator,
} = require("../database/logic_objects/eventProcedures");

const {
  sendEventRegistrationNotification,
  sendEventAlterationNotificationForParticipants,
  sendEventUnregistrationNotification,
} = require("../utils/realTimeNotifications");

const {
  getUserFullName,
} = require("../database/logic_objects/usersProcedures");

const validator = require("validator");
const controllers = {};

controllers.create_event = async (req, res) => {
  const {
    officeId,
    subAreaId,
    name,
    description,
    eventDate,
    startTime,
    endTime,
    recurring = false,
    recurring_pattern = '{"key": ""}',
    max_participants = null,
    location,
    publisher_id,
    filePath,
  } = req.body;
  console.log(publisher_id.toString());
  console.log("no tosrtring: " + publisher_id.toString());

  if (!validator.isInt(publisher_id.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid admin ID" });
  }
  if (!validator.isInt(officeId.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid office ID" });
  }
  if (!validator.isInt(subAreaId.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid sub-area ID" });
  }
  console.log(req.query);
  try {
    var eventId = await spCreateEvent(
      officeId,
      subAreaId,
      name,
      description,
      eventDate,
      startTime,
      endTime,
      recurring,
      recurring_pattern,
      max_participants,
      location,
      publisher_id,
      filePath
    );
    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: eventId,
    });
  } catch (error) {
    console.log(error);
    //exit(-1);
    res.status(500).json({
      success: false,
      message: "Error creating Event: " + error.message,
    });
  }
};

//function INSIDE CONTROLLER TO BE CALLED AFTER SETTING AN USER INACTIVE
/* controllers.event_participation_cleanup = async (req, res) => {
    const { } = req.query; 
    console.log(req.query);
    try {
        await spEventParticipationCleanup(subAreaId, title, description, publisher_id, eventId);
        res.status(201).send('Events participation cleaned up succesffuly.');
    } catch (error) {
        res.status(500).send('Error cleaning event participation: ' + error.message);
    }
};
*/

controllers.register_user_for_event = async (req, res) => {
  const { userId, eventId } = req.params;
  console.log(req.params);
  try {
    await spRegisterUserForEvent(userId, eventId);
    var creator_id = await getEventCreator(eventId);
    var username = await getUserFullName(userId);
    var fullname = username.firstName + " " + username.lastName;
    console.log("going to send notification");
    await sendEventRegistrationNotification(creator_id, eventId, fullname);
    console.log("going to send notification finished");
    res
      .status(201)
      .json({ success: true, message: "Registered for event successfully." });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error registering for event: " + error.message,
    });
  }
};

controllers.unregister_user_from_event = async (req, res) => {
  const { userId, eventId } = req.params;
  console.log(req.params);
  try {
    await spUnregisterUserFromEvent(userId, eventId);
    var creator_id = await getEventCreator(eventId);
    var username = await getUserFullName(userId);
    var fullname = username.firstName + " " + username.lastName;
    await sendEventUnregistrationNotification(creator_id, eventId, fullname);
    res.status(201).json({
      success: true,
      message: "Unregistered from event successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unregistering from event: " + error.message,
    });
  }
};

controllers.get_event_state = async (req, res) => {
  const { eventId } = req.params;
  console.log(req.params);
  try {
    const state = await fnGetEventState(eventId);
    res.status(201).json({
      success: true,
      message: "Got event state successfully.",
      data: state,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting event state: " + error.message,
    });
  }
};

controllers.edit_event = async (req, res) => {
  const { eventId } = req.params;
  const {
    subAreaId = null,
    officeId = null,
    adminId = null,
    name = null,
    description = null,
    eventDate = null,
    startTime = null,
    endTime = null,
    eventLocation = null,
    filePath = null,
    recurring = null,
    recurringPattern = null,
    maxParticipants = null,
    currentParticipants = null,
  } = req.body;
  console.log(req.query);
  try {
    await spEditEvent(
      eventId,
      subAreaId,
      officeId,
      adminId,
      name,
      description,
      eventDate,
      startTime,
      endTime,
      eventLocation,
      filePath,
      recurring,
      recurringPattern,
      maxParticipants,
      currentParticipants
    );

    const state = await fnGetEventState(eventId);
    console.log("ESTADO DO EVENTO");
      console.log(state);
    if (state == "Validated") {
      console.log("ESTADO DO EVENTO");
      console.log(state);
      const participants = await spGetParticipants(eventId);
      const eventName = await getEventNameById(eventId);
      await sendEventAlterationNotificationForParticipants(
        eventId,
        participants,
        eventName,
        "Event details were altered"
      );
    }

    res
      .status(201)
      .json({ success: true, message: "Event edited successfully." });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error creating Event: " + error.message,
    });
  }
};

/*
controllers.get_event = async (req, res) => {
  const { eventId } = req.params;
  console.log(req.params);
  try {
    const event = await spGetEvent(eventId);
    res
      .status(201)
      .json({ success: true, message: "Got event successfully.", data: event });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting event: " + error.message,
    });
  }
};
*/

controllers.get_participants = async (req, res) => {
  const { eventId } = req.params;
  console.log(req.params);
  try {
    const participants = await spGetParticipants(eventId);
    res.status(201).json({
      success: true,
      message: "Got participants successfully.",
      data: participants,
    });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error getting participants: " + error.message,
    });
  }
};

controllers.get_participants_adm = async (req, res) => {
  const { eventId } = req.params;
  console.log(req.params);
  try {
    const participants = await spGetParticipants_adm(eventId);
    res.status(200).json({
      success: true,
      message: "Got participants successfully.",
      data: participants,
    });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error getting participants: " + error.message,
    });
  }
};

controllers.getEventScoreByID = async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await db.sequelize.query(
      `
      SELECT 
        sc."score"
      FROM  "dynamic_content"."scores" sc
      WHERE sc."event_id" = :event_id
      `,
      {
        replacements: { event_id },
        type: QueryTypes.SELECT,
      }
    );
    if (result.length > 0) {
      res.status(200).json({ success: true, data: result[0].score });
    } else {
      res.status(404).json({ success: false, message: "Event not found" });
    }
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving Event: " + error.message,
    });
  }
};
module.exports = controllers;
