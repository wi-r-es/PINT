
const express = require('express');
const router = express.Router();
const {validation} = require('../controllers/jwt_middlewareController');

const warningController = require('../controllers/warningController');

router.get('/:office_ID', validation, warningController.warnings_per_office);


module.exports = router;