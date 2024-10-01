const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController.js');
const {validation} = require('../controllers/jwt_middlewareController.js');

//BOOKMARK ROUTES
router.post('/add-bookmark/:userID/:contentType/:contentID', validation, controller.add_bookmark);
router.get('/get-bookmarks/:userID', validation, controller.get_user_bookmarks);
router.delete('/remove-bookmark/:userID/:contentType/:contentID', validation, controller.remove_bookmark);

//PREFERENCES ROUTES
router.patch('/update-user-preferences', validation, controller.update_user_preferences);
router.post('/create-user-preferences', validation, controller.create_user_preferences);
router.patch('/update-user-preferences/:userID', validation, controller.update_user_preferences_id);
router.post('/create-user-preferences/:userID', validation, controller.create_user_preferences_id);
router.get('/get-user-preferences/', validation, controller.get_user_preferences);

router.get('/get-user-role/:userID', validation, controller.get_user_role);
router.get('/get-user-by-role/:role', validation, controller.get_user_by_role);

// @DEPRECATED router.patch('/update-acess-on-login/:userID', validation, controller.update_access_on_login); 

router.put('/update-acc-status', validation, controller.update_acc_status);
router.get('/get-users-to-validate', validation, controller.get_users_to_validate);
router.patch('/update-profile', validation, controller.update_profile);

router.get('/get-content', validation, controller.get_user_content);
router.get('/get-registered-events', validation, controller.get_user_registeredEvents);
router.patch('/update-user-password', validation, controller.update_user_password);




module.exports = router;








