const {
  getUserPreferences,
  updateUserPreferences,
  updateUserPreferencesv2,
  updateAccessOnLogin,
  createUserPreferencesv2,
  getUserRole,
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  getUserByRole,
  updateAccStatus,
  createUserPreferences,
  getUsersToValidate,
  updateProfile,
  getUserPublications,
  getUserRegisteredEvents,
  updateUserPassword,
} = require("../database/logic_objects/usersProcedures");
const validator = require("validator");

const controllers = {};

controllers.get_user_preferences = async (req, res) => {
  //const { userID } = req.params;
  const user_id = req.user.id; // Extracted from JWT
  try {
    const userPreferences = await getUserPreferences(user_id);

    if (userPreferences) {
      res.status(200).json({
        success: true,
        message: 'User preferences fetched successfully.',
        data: userPreferences,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User preferences not found.',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user preferences: ' + error.message,
    });
  }
};

controllers.create_user_preferences = async (req, res) => {
  //const { userID } = req.params;
  const user_id = req.user.id; // Extracted from JWT
  const {
    notificationsTopic,  
    receiveNotifications = null,
    languageID = null,
    additionalPreferences = null,
  } = req.body;
  console.log('inside notifications topic');
  console.log(notificationsTopic);
  try {
    await createUserPreferencesv2(
      user_id,
      notificationsTopic
    );
    res.status(201).send("User preferences created successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating user preferences: " + error.message);
  }
};
controllers.create_user_preferences_id = async (req, res) => {
  const { userID } = req.params;
  const {
    notificationsTopic,  // New field to receive notifications topic as JSON
    receiveNotifications = null,
    languageID = null,
    additionalPreferences = null,
  } = req.body;

  try {
    await createUserPreferences(
      userID,
      notificationsTopic,  // Pass the notifications topic JSON
      receiveNotifications,
      languageID,
      additionalPreferences
    );
    res.status(201).send("User preferences created successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating user preferences: " + error.message);
  }
};

/* @DEPRECATED
controllers.update_user_preferences = async (req, res) => {
  const { userID } = req.params;
  const {
    preferredLanguageID = null,
    preferredAreas = null,
    preferredSubAreas = null,
    receiveNotifications = null,
  } = req.body;
  console.log(req.query);
  try {
    await updateUserPreferences(
      userID,
      preferredLanguageID,
      preferredAreas,
      preferredSubAreas,
      receiveNotifications
    );
    res.status(201).send("Updated User successfully.");
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error updating user preferences: " + error.message);
  }
};
*/
controllers.update_user_preferences = async (req, res) => {
  //const { userID } = req.params;
  const user_id = req.user.id; // Extracted from JWT
  const {
    preferredLanguageID = null,
    receiveNotifications = null,
    preferences = null
  } = req.body;
  
  try {
    await updateUserPreferencesv2(
      user_id,
      // preferredLanguageID,
      // receiveNotifications,
      preferences
    );
    res.status(201).send("Updated User successfully.");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error updating user preferences: " + error.message);
  }
};
controllers.update_user_preferences_id = async (req, res) => {
  const { userID } = req.params;
  const {
    preferredLanguageID = null,
    receiveNotifications = null,
    preferences = null
  } = req.body;
  
  try {
    await updateUserPreferences(
      userID,
      preferredLanguageID,
      receiveNotifications,
      preferences
    );
    res.status(201).send("Updated User successfully.");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error updating user preferences: " + error.message);
  }
};

// controllers.update_user_preferences = async (req, res) => {
//   const { userID } = req.params;
//   const {
//     preferredLanguageID = null,
//     preferredAreas = null,
//     preferredSubAreas = null,
//     receiveNotifications = null,
//     notificationsTopic = null, // Add notificationsTopic field
//   } = req.body;

//   try {
//     await updateUserPreferences(
//       userID,
//       preferredLanguageID,
//       preferredAreas,
//       preferredSubAreas,
//       receiveNotifications,
//       notificationsTopic // Pass notificationsTopic to the function
//     );
//     res.status(201).send("Updated User successfully.");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error updating user preferences: " + error.message);
//   }
// };
/* @DEPRECATED
controllers.createUserPreferences = async (req, res) => {
  const { userID } = req.params;
  const {
    areas,
    subAreas,
    receiveNotifications,
    languageID = null,
    additionalPreferences = null,
  } = req.body;

  console.log(req.query);
  try {
    await createUserPreferences(
      userID,
      areas,
      subAreas,
      receiveNotifications,
      languageID,
      additionalPreferences
    );
    res.status(201).send("User preferences created successfully.");
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error creating user preferences: " + error.message);
  }
};
*/
/* @DEPECRATED
controllers.update_access_on_login = async (req, res) => {
  const { userID } = req.params;
  console.log(req.params);
  try {
    await updateAccessOnLogin(userID);
    res.status(201).send(" Update user last access login successfully.");
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res
      .status(500)
      .send("Error updating user last access on login: " + error.message);
  }
};
*/

controllers.get_user_role = async (req, res) => {
  const { userID } = req.params;
  console.log(req.query);
  try {
    data = await getUserRole(userID);
    res
      .status(201)
      .json({
        success: true,
        data: data,
        message: " Got User Role successfully.",
      });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error getting user role: " + error.message);
  }
};

controllers.get_user_by_role = async (req, res) => {
  const { role } = req.params;
  console.log(req.params);
  try {
    data = await getUserByRole(role);
    res
      .status(201)
      .json({
        success: true,
        data: data,
        message: " Got User by Role successfully.",
      });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error getting user by role: " + error.message);
  }
};

controllers.add_bookmark = async (req, res) => {
  const { userID, contentID, contentType } = req.body;
  console.log(req.body);
  try {
    await addBookmark(userID, contentID, contentType);
    res.status(201).send("bookmark added successfully.");
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error adding bookmark: " + error.message);
  }
};

controllers.remove_bookmark = async (req, res) => {
  const { userID, contentID, contentType } = req.params;
  console.log(req.params);
  try {
    await removeBookmark(userID, contentID, contentType);
    res.status(201).send("bookmard removed successfully.");
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error removing bookmark: " + error.message);
  }
};

controllers.get_user_bookmarks = async (req, res) => {
  const { userID } = req.params;
  console.log(req.params);
  try {
    await getUserBookmarks(userID);
    res.status(201).send("getting user bookmars.");
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error getting user bookmarks: " + error.message);
  }
};

controllers.update_acc_status = async (req, res) => {
  const { status, user_id } = req.body;
  try {
    await updateAccStatus(user_id, status);
    res.status(201).send("User updated successfully.");
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error updating account status: " + error.message);
  }
};

controllers.get_users_to_validate = async (req, res) => {
  try {
    const aux = await getUsersToValidate();
    res
      .status(200)
      .json({
        success: true,
        data: aux,
        message: "Got users to validate successfully.",
      });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error getting users to validate: " + error.message);
  }
};

controllers.update_profile = async (req, res) => {
  const user = req.user.id;
  const { firstName, lastName, profile_pic } = req.body;

  try {
    await updateProfile(user, firstName, lastName, profile_pic);
    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error updating profile: " + error.message);
  }
};

controllers.get_user_content = async (req, res) => {
  try {
    const user = req.user.id;
    const aux = await getUserPublications(user);
    console.log(aux);
    res
      .status(200)
      .json({
        success: true,
        data: aux,
        message: "Got content posted by user.",
      });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error getting user content: " + error.message);
  }
};

controllers.get_user_registeredEvents = async (req, res) => {
  try {
    const user = req.user.id;
    const aux = await getUserRegisteredEvents(user);
    console.log(aux);
    res
      .status(200)
      .json({
        success: true,
        data: aux,
        message: "Got events registered by user.",
      });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res
      .status(500)
      .send("Error getting events: registered by user " + error.message);
  }
};

controllers.update_user_password = async (req, res) => {
  const { password, user } = req.body;
  if (!validator.isStrongPassword(password)) {
    return res
      .status(400)
      .json({ success: false, message: "Password is not strong enough" });
  }
  try {
    await updateUserPassword(user, password);
    res
      .status(200)
      .json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).send("Error updating password: " + error.message);
  }
};

module.exports = controllers;
