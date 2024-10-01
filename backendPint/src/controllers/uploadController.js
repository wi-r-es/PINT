const multer = require('multer');

/**
 * @description Configures the storage settings for multer.
 * 
 * The storage settings define the destination directory and the naming 
 * convention for uploaded files. Files are stored in the './src/uploads/' 
 * directory, and their filenames are prefixed with the current date and time.
 * Spaces in filenames are replaced with underscores.
 * 
 * @constant {Object} storage
 */
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './src/uploads/'); 
  },
  filename: function(req, file, cb) {
    const originalName = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
    cb(null, new Date().toISOString().replace(/:/g, '-') + originalName);
  }
});

/**
 * @description Middleware for handling multipart/form-data, primarily for file uploads.
 * 
 * This middleware uses the configured storage settings to handle file uploads.
 * 
 * @constant {Object} upload
 */
const upload = multer({ storage: storage });

/**
 * @description Handles the response after a file has been uploaded.
 * 
 * This function sends a success message and the file details as a JSON response if 
 * the file was uploaded successfully. If no file is present in the request, it sends 
 * a 400 error response.
 * 
 * @function upload_create
 * @route {POST} /upload/upload
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.file - The uploaded file object.
 * @param {Object} res - The HTTP response object.
 */
const upload_create = (req, res) => {
    if (req.file) {
        res.json({ success:true,  message: 'Imagem carregada com sucesso!', file: req.file });
    } else {
        res.status(400).json({success:false, message:'Erro no upload da imagem',});
    }
};

module.exports = { upload_create, upload };
