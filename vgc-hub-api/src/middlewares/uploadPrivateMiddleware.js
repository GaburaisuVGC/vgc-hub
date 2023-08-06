const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: 'pm-' + Date.now(),
      bucketName: 'pms', // Nom du seau (bucket) dans MongoDB GridFS
      contentType: file.mimetype,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
