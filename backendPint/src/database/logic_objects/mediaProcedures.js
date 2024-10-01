const { QueryTypes } = require("sequelize");
const db = require("../../models");

async function spCreateAlbum(eventId, subAreaId, title) {
  const transaction = await db.sequelize.transaction();
  try {
    await db.sequelize.query(
      `INSERT INTO "dynamic_content"."albums" ("event_id", "sub_area_id", "creation_date", "title")
        VALUES (:eventId, :subAreaId, CURRENT_TIMESTAMP, :title)`,
      {
        replacements: { eventId, subAreaId, title },
        type: QueryTypes.RAW,
        transaction,
      }
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

//Procedure to Add a Photograph
async function spAddPhotograph(albumId, publisherId, filePath) {
  const transaction = await db.sequelize.transaction();
  try {
    await db.sequelize.query(
      `INSERT INTO "dynamic_content"."photographs" ("album_id", "publisher_id", "filepath", "upload_date")
        VALUES (:albumId, :publisherId, :filePath, CURRENT_TIMESTAMP)`,
      {
        replacements: { albumId, publisherId, filePath },
        type: QueryTypes.RAW,
        transaction,
      }
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function spGetAlbums() {
  const albums = await db.sequelize.query(
    `SELECT * FROM "dynamic_content"."albuns"`,
    { type: QueryTypes.SELECT }
  );

  return albums;
}

async function spGetAlbumPhoto(photo_id) {
  const photo = await db.sequelize.query(
    ` SELECT p.filepath, u.first_name, u.last_name 
      FROM "dynamic_content"."photographs" p
      JOIN "hr"."users" u ON u.user_id = p.publisher_id 
      WHERE p.album_id = :photo_id`,
    { replacements: { photo_id }, type: QueryTypes.SELECT }
  );

  return photo;
}

async function getAlbumIdByEventId(eventID) {
  try {
    const result = await db.sequelize.query(
      `SELECT 
          a."album_id"
       FROM "dynamic_content"."albuns" a
       WHERE a."event_id" = :eventID`,
      {
        replacements: { eventID },
        type: QueryTypes.SELECT,
      }
    );

    if (result.length === 0) {
      throw new Error("No album found for the event.");
    }

    return result[0].album_id;
  } catch (error) {
    console.error("Error retrieving album ID:", error.message);
    throw error;
  }
}

async function getAlbumOfAreaID(area_id) {
  try {
    const result = await db.sequelize.query(
      `SELECT 
          a."album_id"
       FROM "dynamic_content"."albuns" a
       WHERE a."area_id" = :area_id`,
      {
        replacements: { area_id },
        type: QueryTypes.SELECT,
      }
    );

    if (result.length === 0) {
      throw new Error("No album found for the event.");
    }

    return result[0].album_id;
  } catch (error) {
    console.error("Error retrieving albums for given area_id:", error.message);
    throw error;
  }
}

async function getPhotosByAlbumId(albumID) {
  try {
    const photos = await db.sequelize.query(
      `SELECT 
          p."photo_id",
          p."album_id",
          p."publisher_id",
          p."filepath",
          p."upload_date"
       FROM "dynamic_content"."photographs" p
       WHERE p."album_id" = :albumID`,
      {
        replacements: { albumID },
        type: QueryTypes.SELECT,
      }
    );

    if (photos.length === 0) {
      throw new Error("No photos found for the album.");
    }

    return photos;
  } catch (error) {
    console.error("Error retrieving photos for the album:", error.message);
    throw error;
  }
}

async function getAlbumsWithNonNullAreaId() {
  try {
    const albums = await db.sequelize.query(
      `SELECT 
          a."album_id"
       FROM "dynamic_content"."albuns" a
       WHERE a."area_id" IS NOT NULL`,
      {
        type: QueryTypes.SELECT,
      }
    );

    if (albums.length === 0) {
      throw new Error("No albums found with a non-null area_id.");
    }

    return albums.map(album => album.album_id);
  } catch (error) {
    console.error("Error retrieving albums with non-null area_id:", error.message);
    throw error;
  }
}


module.exports = {
  spCreateAlbum,
  spAddPhotograph,
  spGetAlbums,
  spGetAlbumPhoto,
  getAlbumIdByEventId,
  getPhotosByAlbumId,
  getAlbumsWithNonNullAreaId,
  getAlbumOfAreaID
};
