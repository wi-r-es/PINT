const { spCreateAlbum, 
        spAddPhotograph, 
        spGetAlbums,
        spGetAlbumPhoto,
        getAlbumIdByEventId,
        getPhotosByAlbumId,
        getAlbumsWithNonNullAreaId,
        getAlbumOfAreaID

    } = require('../database/logic_objects/mediaProcedures');

const controllers = {};

controllers.create_album = async (req, res) => {
    const { eventId, subAreaId, title } = req.body; 
    console.log(req.query);
    try {
        await spCreateAlbum(eventId, subAreaId, title);
        res.status(201).json({success:true, message:'ALBUM created successfully.'});
    } catch (error) {
        res.status(500).json({success:false, message:'Error creating ALBUM: ' + error.message});
    }
};

controllers.add_photograph_area_album = async (req, res) => {
    const { area_id, publisherId } = req.params; 
    const {filePath} = req.body;
    console.log(req.query);
    try {
        const albumId = await getAlbumOfAreaID(area_id);
        await spAddPhotograph(albumId, publisherId, filePath);
        res.status(201).json({success:true, message:'Photograph added successfully.'});
    } catch (error) {
        res.status(500).json({success:false, message:'Error adding photograph: ' + error.message});
    }
};
controllers.add_photograph = async (req, res) => {
    const { albumId, publisherId } = req.params; 
    const {filePath} = req.body;
    console.log(req.query);
    try {
        await spAddPhotograph(albumId, publisherId, filePath);
        res.status(201).json({success:true, message:'Photograph added successfully.'});
    } catch (error) {
        res.status(500).json({success:false, message:'Error adding photograph: ' + error.message});
    }
};
controllers.add_photograph_event = async (req, res) => {
    const { eventID, publisherId } = req.params; 
    const {filePath} = req.body;
    console.log(req.query);

    try {
        const albumId = await getAlbumIdByEventId(eventID);
        await spAddPhotograph(albumId, publisherId, filePath);
        res.status(201).json({success:true, message:'Photograph added successfully to event.'});
    } catch (error) {
        console.log(error);
        console.log(error.message);
        res.status(500).json({success:false, message:'Error adding photograph to event: ' + error.message});
    }
};

controllers.get_albums = async (req, res) => {

    try {
        const albums = await spGetAlbums();
        res.status(200).json({success:true, albums});
    } catch (error) {
        res.status(500).json({success:false, message:'Error fetching albums: ' + error.message});
    }
};

controllers.get_album_photo = async (req, res) => {
    const { photo_id } = req.params; 
    console.log(req.query);
    try {
        const photo = await spGetAlbumPhoto(photo_id);
        res.status(200).json({success:true, message:'Photo fetched successfully.', data:photo});
    } catch (error) {
        res.status(500).json({success:false, message:'Error fetching photograph: ' + error.message});
    }
};

controllers.get_event_photos = async (req, res) => {
    const { eventID } = req.params; 
    console.log(req.query);
    try {
        const albumID = await getAlbumIdByEventId(eventID);
        const photos = await getPhotosByAlbumId(albumID);

        res.status(200).json({success:true, message:'Photos fetched successfully.', data: photos});
    } catch (error) {
        console.log(error);
        console.log(error.message);
        res.status(500).json({success:false, message:'Error fetching photographs: ' + error.message});
    }
};

controllers.get_area_photos = async (req, res) => {
    const { area_id } = req.params; 
    console.log(req.query);
    try {
        const albumID = await getAlbumOfAreaID(area_id);
        const photos = await getPhotosByAlbumId(albumID);

        res.status(200).json({success:true, message:'Photos fetched successfully.', data: photos});
    } catch (error) {
        console.log(error);
        console.log(error.message);
        res.status(500).json({success:false, message:'Error fetching photographs: ' + error.message});
    }
};

controllers.get_albums_of_areas = async (req,res) => {
    try{
        const albums_ids = await getAlbumsWithNonNullAreaId();
        // const albumsWithPhotos = {};

        // for (const albumID of albums_ids) {
        //   const photos = await getPhotosByAlbumId(albumID);
        //   albumsWithPhotos[albumID] = photos;  // Store photos in the map with albumID as the key
        // }

        res.status(200).json({success:true, message:'Albums Ids of areas fetched successfully.', data: albums_ids});
    }
    catch (error) {
        console.log(error);
        console.log(error.message);
        res.status(500).json({success:false, message:'Error fetching photographs: ' + error.message});
    }
}

controllers.get_photos_of_areas_albums = async (req,res) => {
    try {
        const { albumID } = req.params; 

        const photos = await getPhotosByAlbumId(albumID);

        res.status(200).json({success:true, message:'Photos fetched successfully.', data: photos});
    }
    catch (error) {
        console.log(error);
        console.log(error.message);
        res.status(500).json({success:false, message:'Error fetching photographs: ' + error.message});
    }
}


// controllers.getter_area_album_id = async (req, res) => {
//     const { area_id } = req.params; 
//     console.log(req.query);

//     try {
//         const albumId = await getAlbumOfAreaID(area_id);
       
//         res.status(201).json({success:true, message:'Fetched Album Id for given area ID.', data: albumId});
//     } catch (error) {
//         console.log(error);
//         console.log(error.message);
//         res.status(500).json({success:false, message:'Error fetching album id: ' + error.message});
//     }
// };

module.exports = controllers;