const express = require('express');
const router = express.Router();
const {validation} = require('../controllers/jwt_middlewareController.js');
const controller = require('../controllers/mediaController.js');


router.post('/create-album', validation, controller.create_album);
router.post('/add-photo/album/:albumId/:publisherId', validation, controller.add_photograph);
router.post('/add-photo/area/:area_id/:publisherId', validation, controller.add_photograph_area_album);
router.post('/add-photo-event/:eventID/:publisherId', validation, controller.add_photograph_event);
router.get('/get-albums', validation, controller.get_albums);
router.get('/get-album-photo/:photo_id', validation, controller.get_album_photo);

router.get('/get-album/event/:eventID', validation, controller.get_event_photos);
//router.get('get-albumid-area/:area_id', validation, controller.getter_area_album_id);
router.get('/get-album/area/:area_id', validation, controller.get_area_photos);
router.get('/get-areas-albums_IDS', validation, controller.get_albums_of_areas);
router.get('/get-area-photos/:albumID', validation, controller.get_photos_of_areas_albums);
module.exports = router;