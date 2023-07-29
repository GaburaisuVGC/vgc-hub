const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');

// Fonction pour générer un nom de fichier unique avec des caractères aléatoires
const generateFilename = (file) => {
  const originalName = file.originalname;
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const filename = `post-${Date.now()}-${randomBytes}-${originalName}`;
  return filename;
};

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: generateFilename(file),
      bucketName: 'posts', // Nom du seau (bucket) dans MongoDB GridFS pour les posts
      contentType: file.mimetype,
    };
  },
});

// Initialiser l'instance de Multer pour gérer les fichiers
// entre 1 à 4 fichiers
const upload = multer({ storage }).array('media', 4);

module.exports = upload;
