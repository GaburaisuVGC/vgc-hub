const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Readable } = require('stream');
const conn = mongoose.connection;
const { ObjectID } = require('mongodb');

router.get('/:filename', async (req, res) => {
    const gfs = conn.db.collection('avatars.files');
  
    const filename = req.params.filename;
  
    try {
      const file = await gfs.findOne({ filename: filename });
  
      if (!file) {
        return res.status(404).json({ message: 'Avatar non trouvé.' });
      }
  
      const fileId = file._id;
  
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'avatars' });
      const downloadStream = bucket.openDownloadStream(fileId);
  
      // Configurer les en-têtes de la réponse
      res.set('Content-Type', file.contentType);
      res.set('Content-Length', file.length); // Assurez-vous que la longueur du contenu est définie
      res.set('Cache-Control', 'public, max-age=86400'); // Exemple de cache pour une journée (86400 secondes)
  
      // Stream le contenu du fichier dans la réponse HTTP
      const readableStream = new Readable().wrap(downloadStream);
      readableStream.pipe(res);
    } catch (error) {
      return res.status(500).json({ error: 'Une erreur est survenue lors de la récupération de l\'avatar.' });
    }
  });
  

module.exports = router;
