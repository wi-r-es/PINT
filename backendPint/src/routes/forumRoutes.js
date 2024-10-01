const express = require('express');
const router = express.Router();
const {validation} = require('../controllers/jwt_middlewareController.js');
const controller = require('../controllers/ForumController.js');

router.post('/create', validation, controller.create_forum);
//router.post('/create-forum-event', validation, controller.create_forum_for_event);
router.get('/state/:id', validation, controller.get_forum_state);
router.patch('/change-state/:forumId', validation, controller.change_forum_state);
router.patch('/edit/:forumId', validation, controller.edit_forum); 
router.delete('/delete/:forumId', validation, controller.delete_forum);
//router.get('/get/:forumId', validation, controller.get_forum);
module.exports = router;
