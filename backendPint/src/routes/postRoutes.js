const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController.js');
const {validation} = require('../controllers/jwt_middlewareController.js');

router.post('/create', validation, controller.create_post);
router.get('/state/:postId', validation, controller.get_post_state);
router.patch('/edit/:postId', validation, controller.edit_post); 
router.delete('/delete/:postId', validation, controller.delete_post);
router.get('/get-post-score/:post_id', validation, controller.getPostScoreByID);
module.exports = router;
