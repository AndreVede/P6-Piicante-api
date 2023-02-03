const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        // Retirer les espaces des noms de fichier image.
        const name = file.originalname.split(' ').join('_');

        // Applique la bonne extension de fichier.
        const extension = MIME_TYPES[file.mimetype];

        callback(null, name + Date.now() + '.' + extension);
    },
});

module.exports = multer({ storage }).single('image');
