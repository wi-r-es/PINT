const express = require('express');
const router = express.Router();
const {validation} = require('../controllers/jwt_middlewareController.js');
const controller = require('../controllers/commentsController.js');

router.post('/add-comment', validation, controller.add_comment);
router.get('/get-comment-tree/content/:contentType/id/:contentID', validation, controller.get_comments_tree);
router.delete('/delete-comment/:commentID', validation, controller.delete_comment);
router.post('/add-like', validation, controller.like_comment);
router.delete('/remove-like', validation, controller.unlike_comment);
router.patch('/remove-like', validation, controller.unlike_comment);
router.post('/report-coment', validation, controller.report_comment);
router.get('/get-likes-per-user/:userID', validation, controller.likes_per_user);
router.get('/get-likes-per-content/content/:contentType/id/:contentID/', validation, controller.likes_per_content);

module.exports = router;
