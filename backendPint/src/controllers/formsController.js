const {
  addCustomFieldsToEventForm,
  createEventForm,
  createEventFormWeb,
  editEventFormField,
  getFormSchema,
  getFormSchemaAsJson,

  insertFormAnswers,
  deleteEventFormField,
  getFormAnswersByEvent,
  getFormAnswersByEventWeb,
  getFormAnswersByEventAndUser,
  getAllEventsWithForms,
} = require("../database/logic_objects/formsProcedures");

const {
  spRegisterUserForEvent,
  spGetParticipants,
  getEventNameById,
  getEventCreator,
} = require("../database/logic_objects/eventProcedures");

const { getUserFullName } = require("../database/logic_objects/usersProcedures");

const {
  sendEventAlterationNotificationForParticipants,
  sendEventRegistrationNotification
} = require("../utils/realTimeNotifications");

const controllers = {};

//to create a new form for a new event
controllers.create_event_form = async (req, res) => {
  const { eventID, customFieldsJson } = req.body;
  console.log(req.body);
  try {
    await createEventForm(eventID, customFieldsJson);

    res
      .status(201)
      .json({ success: true, message: "Form for event created successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating form: " + error.message,
    });
  }
};

controllers.create_event_form_web = async (req, res) => {
  const { eventID, customFieldsJson } = req.body;
  console.log(req.body);
  try {
    await createEventFormWeb(eventID, customFieldsJson);

    res
      .status(201)
      .json({ success: true, message: "Form for event created successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating form: " + error.message,
    });
  }
};

//to add more fields to a form while event isnt approved
controllers.add_fields_event_form = async (req, res) => {
  const { eventID, customFieldsJson } = req.body;
  console.log(req.body);
  try {
    await addCustomFieldsToEventForm(eventID, customFieldsJson);

    const participants = await spGetParticipants(eventID);
    const eventName = await getEventNameById(eventID);
    await sendEventAlterationNotificationForParticipants(
      eventID,
      participants,
      eventName,
      "Fields were added to form"
    );

    res
      .status(201)
      .json({ success: true, message: "Form fields added successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding fields to form: " + error.message,
    });
  }
};

// to edit already existing fields of a form
controllers.edit_fields_event_form = async (req, res) => {
  const { eventID } = req.params;
  const { customFieldsJson } = req.body;
  console.log(req.query);
  try {
    await editEventFormField(eventID, customFieldsJson);

    const participants = await spGetParticipants(eventID);
    const eventName = await getEventNameById(eventID);
    await sendEventAlterationNotificationForParticipants(
      eventID,
      participants,
      eventName,
      "Form Fields were altered"
    );

    res
      .status(201)
      .json({ success: true, message: "Form fields edited successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error editing form fields: " + error.message,
    });
  }
};

//get raw form
controllers.get_event_form = async (req, res) => {
  const { eventID } = req.params;
  console.log(req.params);
  try {
    const form = await getFormSchema(eventID);

    res
      .status(201)
      .json({ success: true, message: "Got form successfully.", data: form });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting form: " + error.message,
    });
  }
};

//get form as json
controllers.get_event_json_form = async (req, res) => {
  const { eventID } = req.params;
  console.log(req.params);
  try {
    const json_form = await getFormSchemaAsJson(eventID);

    res.status(201).json({
      success: true,
      message: "Got JSON form successfully.",
      data: json_form,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting form: " + error.message,
    });
  }
};

//insert answer to field
// controllers.add_answer = async (req, res) => {
//   const { userID, eventID } = req.params;
//   const { fieldID, answer } = req.body;
//   console.log(req.query);
//   try {

//     await insertFormAnswer(userID, eventID, fieldID, answer);

//     await spRegisterUserForEvent(userID, eventID);

//     res
//       .status(201)
//       .json({ success: true, message: "Added answer to form field." });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Error adding answer: " + error.message,
//       });
//   }
// };
//insert answers to form
controllers.add_answers = async (req, res) => {
  const { userID, eventID } = req.params;
  const { answersJson } = req.body;
  console.log(req.query);
  try {
    await insertFormAnswers(userID, eventID, answersJson);

    await spRegisterUserForEvent(userID, eventID);
    const eventOwner = await getEventCreator(eventID);
    const registrantName = await getUserFullName(userID);
    var fullname =
    registrantName.firstName.toString() + " " + registrantName.lastName.toString();
    console.log('full anme notifications');
    console.log(fullname);
    console.log('going to send notificationaaaaaaaaaaaaaaaaaa');
    await sendEventRegistrationNotification(eventOwner, eventID, fullname);
    console.log('going to send notification finishedaaaaaaaaaaaaaa');
    res.status(201).json({ success: true, message: "Added answers to form." });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error adding answers: " + error.message,
    });
  }
};

//delete fields from form
controllers.delete_field_from_form = async (req, res) => {
  const { eventID, fieldID } = req.params;
  console.log(req.params);
  try {
    await deleteEventFormField(eventID, fieldID);
    const participants = await spGetParticipants(eventID);
    const eventName = await getEventNameById(eventID);
    await sendEventAlterationNotificationForParticipants(
      eventID,
      participants,
      eventName,
      "Form Field deleted"
    );
    res
      .status(201)
      .json({ success: true, message: "Deleted form field successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting field from form: " + error.message,
    });
  }
};

controllers.get_all_event_with_forms = async (req, res) => {
  try {
    var events = await getAllEventsWithForms();

    res.status(201).json({
      success: true,
      data: events,
      message: "Got all events with forms successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting events with forms: " + error.message,
    });
  }
}

controllers.get_event_answers = async (req, res) => {
  const { eventID } = req.params;
  console.log(req.params);
  try {
    var answers = await getFormAnswersByEvent(eventID);

    res.status(201).json({
      success: true,
      data: answers,
      message: "Got answers for event successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting answers from event: " + error.message,
    });
  }
};
controllers.get_event_answers_web = async (req, res) => {
  const { eventID } = req.params;
  console.log(req.params);
  try {
    var answers = await getFormAnswersByEventWeb(eventID);

    res.status(201).json({
      success: true,
      data: answers,
      message: "Got answers for event successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting answers from event: " + error.message,
    });
  }
};
controllers.get_event_answers_for_user = async (req, res) => {
  const { eventID } = req.params;
  const userID = req.user.id; // Extracted from JWT
  console.log(req.params);
  try {
    var answers = await getFormAnswersByEventAndUser(eventID, userID);

    res.status(201).json({
      success: true,
      data: answers,
      message: "Got answers for event successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting answers from event: " + error.message,
    });
  }
};
controllers.get_event_answers_for_users = async (req, res) => {
  const { eventID, userID } = req.params;
  console.log(req.params);
  try {
    var answers = await getFormAnswersByEventAndUser(eventID, userID);

    res.status(201).json({
      success: true,
      data: answers,
      message: "Got answers for event successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error getting answers from event: " + error.message,
    });
  }
};

module.exports = controllers;
