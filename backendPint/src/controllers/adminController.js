const validator = require("validator");

const {validateInput_register} = require("../utils/inputValidators");

const {
  getUserEngagementMetrics,
  getContentValidationStatusByadmin,
  getContentValidationStatus,
  getActiveDiscussions,
  spValidateContent,
  rejectContent,
  getActiveWarnings,
  getContentCenterToBeValidated,
  createCenter,
  deleteCenter,
  getCenters,
  makeCenterAdmin,
  updateCenter,
  getReports,
  deleteReport,
  getAllWarnings,
  createWarnings,
  updateWarnings,
  getCityNameByOfficeId
} = require("../database/logic_objects/adminProcedures");
const {
  spSetCenterAdmin,
  spDeactivateUser,
  spActivateUser,
  spDeleteUser,
  spRegisterNewUser,
  spCreatePassword,
} = require("../database/logic_objects/securityProcedures");
const {
  spEventParticipationCleanup,
} = require("../database/logic_objects/eventProcedures");

const { getUserRole } = require("../database/logic_objects/usersProcedures");
const controllers = {};

controllers.validate_content = async (req, res) => {
  const { contentType, contentID, adminID } = req.params;
  console.log(req.params);
  // Validate inputs
  if (!validator.isIn(contentType, ["post", "event", "forum"])) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid content type" });
  }
  if (!validator.isInt(contentID.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid content ID" });
  }
  if (!validator.isInt(adminID.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid admin ID" });
  }
  console.log(req.params);
  try {
    await spValidateContent(contentType, contentID, adminID);

    res
      .status(201)
      .json({ success: true, message: "Content validated successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error validating content: " + error.message,
    });
  }
};

controllers.reject_content = async (req, res) => {
  const { contentType, contentID, adminID } = req.params;
  // Validate inputs
  if (!validator.isIn(contentType, ["post", "event", "forum"])) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid content type" });
  }
  if (!validator.isInt(contentID.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid content ID" });
  }
  if (!validator.isInt(adminID.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid admin ID" });
  }
  console.log(req.params);
  try {
    await rejectContent(contentType, contentID, adminID);

    res
      .status(201)
      .json({ success: true, message: "Content rejected successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting content: " + error.message,
    });
  }
};

// Get user engagement metrics
controllers.getUserEngagementMetrics = async (req, res) => {
  try {
    const results = await getUserEngagementMetrics();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user engagement metrics: " + error.message,
    });
  }
};

// Get content validation status by admin
controllers.getContentValidationStatusByadmin = async (req, res) => {
  const { adminID } = req.params;
  // Validate Inputs
  if (!validator.isInt(adminID.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid admin ID" });
  }
  try {
    const results = await getContentValidationStatusByadmin(adminID);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Error fetching content validation status by admin: " + error.message,
    });
  }
};

// Get content validation status
controllers.getContentValidationStatus = async (req, res) => {
  try {
    const results = await getContentValidationStatus();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching content validation status: " + error.message,
    });
  }
};

// Get active discussions
controllers.getActiveDiscussions = async (req, res) => {
  try {
    const results = await getActiveDiscussions();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching active discussions: " + error.message,
    });
  }
};
// Get active warnings
controllers.getActiveWarnings = async (req, res) => {
  try {
    const results = await getActiveWarnings();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching active warnings: " + error.message,
    });
  }
};

controllers.getAllWarnings = async (req, res) => {
  try {
    const results = await getAllWarnings();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching active warnings: " + error.message,
    });
  }
};

// Get content center to be validated
controllers.getContentCenterToBeValidated = async (req, res) => {
  const { center_id } = req.params;
  // Validate Inputs
  if (!validator.isInt(center_id.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid center ID" });
  }
  try {
    const results = await getContentCenterToBeValidated(center_id);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Error fetching content center to be validated: " + error.message,
    });
  }
};

// Create center
controllers.createCenter = async (req, res) => {
  const { city, admin, officeImage } = req.body;
  // Validate inputs
  if (validator.isEmpty(city)) {
    return res
      .status(400)
      .json({ success: false, message: "City is required" });
  }
  if (!validator.isInt(admin.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid admin ID" });
  }
  if (validator.isEmpty(officeImage)) {
    return res
      .status(400)
      .json({ success: false, message: "Office image is required" });
  }
  try {
    await createCenter(city, admin, officeImage);
    res
      .status(201)
      .json({ success: true, message: "Center created successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating center: " + error.message,
    });
  }
};

// Delete center
controllers.deleteCenter = async (req, res) => {
  const { center_id } = req.params;
  // Validate Inputs
  if (!validator.isInt(center_id.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid center ID" });
  }
  try {
    await deleteCenter(center_id);
    res
      .status(200)
      .json({ success: true, message: "Center deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting center: " + error.message,
    });
  }
};

controllers.getCenters = async (req, res) => {
  try {
    const results = await getCenters();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching centers: " + error.message,
    });
  }
};

//WIP
controllers.makeCenterAdmin = async (req, res) => {
  try {
    const { office_id, admin_id } = req.params;
    //const results = await makeCenterAdmin(office_id, admin_id);
    const results = await spSetCenterAdmin(office_id, admin_id);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error setting admin: " + error.message,
    });
  }
};

controllers.updateCenter = async (req, res) => {
  const { center_id } = req.params;
  const { city, officeImage } = req.body;
  // Validate inputs
  if (validator.isEmpty(city)) {
    return res
      .status(400)
      .json({ success: false, message: "City is required" });
  }

  try {
    await updateCenter(center_id, city, officeImage);
    res
      .status(201)
      .json({ success: true, message: "Center updated successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating center: " + error.message,
    });
  }
};

controllers.validate_user = async (req, res) => {
  const { user_id } = req.body;
  // Validate inputs
  if (!validator.isInt(user_id.toString())) {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }
  if (validator.isEmpty(user_id.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  try {
    await spActivateUser(user_id);
    res
      .status(201)
      .json({ success: true, message: "User validated successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error validating user: " + error.message,
    });
  }
};
controllers.deactivate_user = async (req, res) => {
  const { user_id } = req.body;
  // Validate inputs
  if (!validator.isInt(user_id.toString())) {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }
  if (validator.isEmpty(user_id.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  try {
    await spDeactivateUser(user_id);
    await spEventParticipationCleanup();
    res
      .status(201)
      .json({ success: true, message: "User deactivated successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deactivating user: " + error.message,
    });
  }
};

controllers.delete_user = async (req, res) => {
  const { user_id } = req.params;
  console.log("req.params:", req.params);
  // Check if user_id is provided and valid
  if (user_id === undefined || user_id === null) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  // Validate if user_id is a valid integer
  if (!validator.isInt(user_id.toString())) {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }

  try {
    await spDeleteUser(user_id);
    res
      .status(201)
      .json({ success: true, message: "User deactivated successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deactivating user: " + error.message,
    });
  }
};


controllers.register_admin = async (req, res) => {
  const { email, firstName, lastName, centerId } = req.body;
  console.log("req.body:", req.body);

  const validationResult = validateInput_register(email, firstName, lastName);
  if (!validationResult.valid) {
    return res
      .status(400)
      .json({ success: false, message: validationResult.message });
  }

  const user_role = await getUserRole(req.user.id);
  console.log("user_role:", user_role);
  if ( user_role != 'ServerAdmin' ){
    return res
      .status(404) //could be a 404 for unforbidden but we dont want to let it know of this possibility to outsiders
      .json({ success: false});
  }
  try {
    const user = await spRegisterNewUser(firstName, lastName, email, centerId);
    
    console.log("user:", user);
    const id = user[0].user_id
    const city_name = await getCityNameByOfficeId(centerId);
    const passwd = '123456@Softshares-' + city_name;
    await spCreatePassword(id,passwd);
    await spActivateUser(id);
    await spSetCenterAdmin(id, centerId);

      res.status(201).json({
        success: true,
        message:
          "Admin created successfully.",
      });
   // }
  } catch (error) {
    console.error("CREATING ADMIN:", error);
    console.log(error.message);
    res
      .status(500)
      .json({ success: false, message: "Internal server error: " + error });
  }
};

controllers.getReports = async (req, res) => {
  try {
    const results = await getReports();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reports: " + error.message,
    });
  }
};
controllers.deleteReport = async (req, res) => {
  const { reportID } = req.params;
  // Validate Inputs
  if (!validator.isInt(reportID.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid report ID" });
  }
  try {
    await deleteReport(reportID);
    res
      .status(200)
      .json({ success: true, message: "Report deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting report: " + error.message,
    });
  }
};


controllers.createWarnings = async (req, res) => {
  const {warning_level, description, admin_id, office_id} = req.body;
  // Validate inputs
  // if (!validator.isInt(warning_level.toString())) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Invalid warning level" });
  // }
  // if (validator.isEmpty(description)) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Description is required" });
  // }
  // if (!validator.isBoolean(state)) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Invalid state" });
  // }

  // if (!validator.isInt(admin_id.toString())) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Invalid admin ID" });
  // }

  // if (!validator.isInt(office_id.toString())) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Invalid office ID" });
  // }

  try {
    await createWarnings(warning_level, description, true, admin_id, office_id);
    res
      .status(201)
      .json({ success: true, message: "Warning created successfully." });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating warning: " + error.message,
    });
  }

};

controllers.updateWarning = async (req, res) => {

  const { warning_id } = req.params;
  console.log(`Warning ID: ${warning_id}`);
  
  const { warning_level, description, state } = req.body;
  console.log(`Received data - Warning Level: ${warning_level}, Description: ${description}, State: ${state}`);
  
  
  try{
   await updateWarnings(warning_id, warning_level, description, state);
    res
      .status(201)
      .json({ success: true, message: "Warning updated successfully." });
  }catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating warning: " + error.message,
    });
  }
}

module.exports = controllers;
