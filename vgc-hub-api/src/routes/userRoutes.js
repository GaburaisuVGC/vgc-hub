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

// Follow a user
router.post('/follow/:userId', authController.verifyJwt, userController.followUser);

// Unfollow a user
router.post('/unfollow/:userId', authController.verifyJwt, userController.unfollowUser);

// Get followers and followings
router.get("/:userId/followers", userController.getFollowers);
router.get("/:userId/followings", userController.getFollowings);

// Block a user
router.post('/block/:userId', authController.verifyJwt, userController.blockUser);

// Unblock a user
router.post('/unblock/:userId', authController.verifyJwt, userController.unblockUser);

// ban a user
router.post('/ban/:userId', authController.verifyJwt, userController.banUser);

// unban a user
router.post('/unban/:userId', authController.verifyJwt, userController.unbanUser);

// Route pour rechercher un utilisateur par nom d'utilisateur
router.get('/search/:username', userController.searchUserByUsername);

module.exports = router;
