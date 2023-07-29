const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');



const storage = new GridFsStorage({
    url: process.env.MONGODB_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
      // Définir un nom de fichier personnalisé (vous pouvez utiliser un ID unique ici)
      return {
        filename: 'avatar-' + Date.now(),
        bucketName: 'avatars', // Nom du seau (bucket) dans MongoDB GridFS
        contentType: file.mimetype,
      };
    },
  });
  
  // Initialiser l'instance de Multer pour gérer les fichiers
  const upload = multer({ storage });

module.exports = upload;