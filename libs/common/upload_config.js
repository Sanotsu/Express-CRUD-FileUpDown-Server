let multer = require('multer');
const config = require('../../config');

let Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, config.upload_destination);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

module.exports = {
    Storage
}
