const express = require('express');
const router = express.Router();
const controller = require('../controllers/EventController.js');
const {validation} = require('../controllers/jwt_middlewareController.js');

router.post('/create', validation, controller.create_event);
router.get('/get-participants/:eventId', validation, controller.get_participants);
router.get('/get-participants-adm/:eventId', validation, controller.get_participants_adm);
// router.post('/event_participation_cleanup', validation, controller.event_participation_cleanup);
router.post('/register-user/:userId/event/:eventId', validation, controller.register_user_for_event);
router.delete('/unregister-user/:userId/event/:eventId', validation, controller.unregister_user_from_event); //in doubt cause makes 2 deletes 1 update
router.get('/state/:eventId', validation, controller.get_event_state);
router.patch('/edit/:eventId', validation, controller.edit_event); 
//router.get('/get/:eventId', validation, controller.get_event);

router.get('/get-event-score/:event_id', validation, controller.getEventScoreByID);
module.exports = router;
