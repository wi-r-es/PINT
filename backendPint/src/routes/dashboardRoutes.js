const express = require("express");
const {validation} = require('../controllers/jwt_middlewareController')
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/toValidate", validation, dashboardController.toValidate);
router.get("/validated", validation, dashboardController.validated);
router.get("/postsbycity", validation, dashboardController.postsbycity);
router.get("/eventsbycity", validation, dashboardController.eventsbycity);
router.get("/comments_by_city", validation, dashboardController.comments_by_city);

module.exports = router;
