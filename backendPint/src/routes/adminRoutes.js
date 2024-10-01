const express = require('express');
const router = express.Router();
const {validation, validation_server_admin,validation_admins  } = require('../controllers/jwt_middlewareController.js');
const controller = require('../controllers/adminController.js');


router.patch('/validate-content/:contentType/:contentID/:adminID', validation ,controller.validate_content);
router.patch('/reject-content/:contentType/:contentID/:adminID', validation ,controller.reject_content);

router.get('/user-engagement-metrics', validation_admins, controller.getUserEngagementMetrics);
router.get('/content-validation-status/admin/:adminID', validation_admins, controller.getContentValidationStatusByadmin);
router.get('/content-validation-status', validation_admins,  controller.getContentValidationStatus);
router.get('/active-discussions', validation_admins, controller.getActiveDiscussions);
router.post('/create-warnings', validation_admins, controller.createWarnings);
router.get('/active-warnings', validation_admins, controller.getActiveWarnings);
router.get('/get-all-warnings', validation_admins, controller.getAllWarnings);
router.patch('/update-warning/:warning_id', validation_admins, controller.updateWarning);
router.get('/content-center-to-be-validated/:center_id', validation_admins, controller.getContentCenterToBeValidated);


router.get('/get-all-centers', controller.getCenters);



//validate operations for users
router.patch('/validate-user', validation_admins, controller.validate_user);
router.patch('/deactivate-user', validation_admins, controller.deactivate_user);

router.delete('/delete-admin/:user_id', validation_server_admin, controller.delete_user)

//server admin only
router.post('/create-center-admin', validation_server_admin, controller.register_admin);
router.post('/create-center', validation_server_admin, controller.createCenter);
router.delete('/delete-center/:center_id', validation_server_admin, controller.deleteCenter);
router.patch('/update-center/:center_id', validation_server_admin, controller.updateCenter);

//reports
router.get('/get-reports', validation_admins, controller.getReports);
router.delete('/delete-report/:reportID', validation_admins, controller.deleteReport);

module.exports = router;