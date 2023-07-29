const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.authenticate, authController.login);

const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Route pour la vérification d'e-mail
router.get('/verify/:token', async (req, res) => {
  const token = req.params.token;
  try {
    // Vérifiez le jeton de vérification d'e-mail
    const decodedToken = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    const userId = decodedToken.userId;

    // Mettez à jour le champ isVerified de l'utilisateur dans la base de données
    await User.findByIdAndUpdate(userId, { isVerified: true });

    // res pour confirmer la vérification
    return res.status(200).json({ message: 'Votre compte a été vérifié avec succès' });
  } catch (err) {
    // res pour gérer les erreurs
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Le lien de vérification a expiré. Veuillez vous inscrire à nouveau.' });
    }
    return res.status(500).json({ error: 'Erreur lors de la vérification de l\'e-mail' });
  }
});

// Route for resending verification email
router.post('/resend-verification', authController.resend);

module.exports = router;