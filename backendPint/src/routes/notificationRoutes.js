const express = require('express');
const router = express.Router();
const {validation} = require('../controllers/jwt_middlewareController');
const controller = require('../controllers/notificationController');


router.post('/trigger-notifications', validation, controller.triggerNotifications);
router.post('/notify-event-changes', validation, controller.notifyEventChanges);
router.post('/notify-event-comments', validation, controller.notifyEventComments);
router.post('/notify-event-creator', validation, controller.notifyEventCreator);
router.post('/notify-event-interactions', validation, controller.notifyEventInteractions);

module.exports = router;
