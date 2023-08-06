const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const privateMessageController = require('../controllers/privateMessageController');
const upload = require('../middlewares/uploadPrivateMiddleware');

// Route pour envoyer un message privé
router.post('/', authController.verifyJwt, upload.single('media'), privateMessageController.sendMessage);

// Route pour afficher un média attaché à un message privé
router.get('/media/:filename', privateMessageController.getPrivateMessageMedia);


module.exports = router;
