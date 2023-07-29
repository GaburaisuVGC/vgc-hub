const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');

// Route pour mettre à jour le profil de l'utilisateur (modification)
router.put('/:userId', authController.verifyJwt, userController.updateProfile);

// Route pour afficher le profil de l'utilisateur (consultation)
router.get('/:username', userController.getProfile);

// Route pour afficher le profil de l'utilisateur par son ID
router.get('/id/:userId', userController.getUserById);

// Route pour supprimer le compte de l'utilisateur
router.delete('/:userId', authController.verifyJwt, userController.deleteAccount);

// Routes admin pour afficher tous les utilisateurs, mettre à jour le rôle d'un utilisateur
router.get('/admin/users', authController.verifyJwt, userController.getAllUsers);
router.put('/admin/users/:userId', authController.verifyJwt, userController.updateUserRole);

// Route pour changer le mot de passe
router.put('/:userId/change-password', authController.verifyJwt, userController.changePassword);

router.put(
    '/:userId/avatar',
    authController.verifyJwt,
    upload.single('avatar'),
    userController.updateAvatar
  );

module.exports = router;
