const express = require('express');
const router = express.Router();
const controller = require('../controllers/ratingController.js');
const {validation} = require('../controllers/jwt_middlewareController.js');

router.post('/eval/:contentType/:contentId', validation, controller.add_evaluation);

module.exports = router;
