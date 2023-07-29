// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const upload = require('../middlewares/uploadPostMiddleware');
const mongoose = require('mongoose');
const { Readable } = require('stream');
const conn = mongoose.connection;

// Route pour ajouter un nouveau post
router.post('/', authController.verifyJwt, upload, postController.createPost);

// Route pour afficher tous les posts
router.get('/', postController.getPosts);

// Route pour afficher tous les posts de l'utilisateur
router.get('/:username', postController.getUserPosts);

// Route pour afficher un post par son ID
router.get('/post/:postId', postController.getPostById);

// Route pour mettre à jour un post par son ID
router.put('/:postId', authController.verifyJwt, postController.updatePost);

// Route pour supprimer un post par son ID
router.delete('/:postId', authController.verifyJwt, postController.deletePost);

// Route pour afficher un media
router.get('/media/:filename', async (req, res) => {
    const gfs = conn.db.collection('posts.files');
  
    const filename = req.params.filename;
  
    try {
      const file = await gfs.findOne({ filename: filename });
  
      if (!file) {
        return res.status(404).json({ message: 'Média non trouvé.' });
      }
  
      const fileId = file._id;
  
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'posts' });
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
