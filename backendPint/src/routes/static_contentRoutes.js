const express = require('express');
const router = express.Router();
const static_contentController = require('../controllers/Static_contentController.js');
const {validation} = require('../controllers/jwt_middlewareController.js');

router.post('/create-category', validation, static_contentController.create_category);
router.post('/create-sub-category', validation, static_contentController.create_sub_category);
router.get('/get-areas',  static_contentController.get_all_areas);
router.get('/get-sub-areas',  static_contentController.get_all_sub_areas);
router.patch('/update-category/:categoryID', validation, static_contentController.update_category);
router.patch('/update-sub-category/:subCategoryID', validation, static_contentController.update_sub_category);
router.delete('/delete-category/:categoryID', validation, static_contentController.delete_category);
router.delete('/delete-sub-category/:subCategoryID', validation, static_contentController.delete_sub_category);

router.get('/get-offices',  static_contentController.getAllCenters);
module.exports = router;
