const express = require('express');
const router = express.Router();
const dynamicController = require('../controllers/dynamic_contentController');
const {validation} = require('../controllers/jwt_middlewareController');
const { route } = require('./uploadRoute');

router.get('/posts-by-city/:city_id', validation, dynamicController.getPostsByCity);
router.get('/forums-by-city/:city_id', validation, dynamicController.getForumsByCity);
router.get('/events-by-city/:city_id', validation, dynamicController.getEventsByCity);
router.get('/all-content', validation, dynamicController.getAllContent);
router.get('/all-content-per/:city_id', validation, dynamicController.getAllContentByCity);
router.get('/get-event-by-date/:date', validation, dynamicController.getEventByDate);
router.get('/user-info/:user_id', validation, dynamicController.getUserInfo);
router.get('/get-users', validation, dynamicController.getUsers);
router.post('/update-user-office', validation, dynamicController.updateUserOffice);
//router.get('/user-preferences', dynamicController.getUserPreferences);

router.get('/get-post/:post_id', validation, dynamicController.getPostById);
router.get('/get-event/:event_id', validation, dynamicController.getEventById);
router.get('/get-forum/:forum_id', validation, dynamicController.getForumById);

router.get('/posts', validation, dynamicController.getPosts);
router.get('/forums', validation, dynamicController.getForums);
router.get('/events', validation, dynamicController.getEvents);




module.exports = router;