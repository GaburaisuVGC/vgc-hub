const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const conn = mongoose.connection;
Grid.mongo = mongoose.mongo;

// Endpoint pour récupérer un avatar par son nom de fichier
router.get('/:filename', (req, res) => {
  const gfs = Grid(conn.db);
  const filename = req.params.filename;

  // Rechercher le fichier dans la collection avatar.files
  gfs.collection('avatar.files').findOne({ filename }, (err, file) => {
    if (err) {
      return res.status(500).json({ error: 'Une erreur est survenue lors de la récupération de l\'avatar.' });
    }

    if (!file) {
      return res.status(404).json({ message: 'Avatar non trouvé.' });
    }

    // Récupérer le contenu du fichier à partir de la collection avatar.chunks
    const readStream = gfs.createReadStream({ filename });
    readStream.pipe(res);
  });
});

module.exports = router;