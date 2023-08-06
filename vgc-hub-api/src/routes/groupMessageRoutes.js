const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const groupMessageController = require('../controllers/groupMessageController');
const upload = require('../middlewares/uploadPrivateMiddleware');

// Route pour envoyer un message de groupe
router.post('/', authController.verifyJwt, upload.single('media'), groupMessageController.sendMessage);

// Route pour afficher un média attaché à un message de groupe
router.get('/media/:filename', groupMessageController.getGroupMessageMedia);

module.exports = router;
