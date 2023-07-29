const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Yup = require('yup');
const { ValidationError } = require('yup');
const mongoose = require('mongoose');
const grid = require('gridfs-stream');

// Contrôleur pour mettre à jour le profil de l'utilisateur (modification)
exports.updateProfile = async (req, res) => {
  const userId = req.params.userId;
  const { username, email, password, role, avatar } = req.body;

  try {
    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur est autorisé à modifier le profil (admin ou utilisateur authentifié)
    if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à effectuer cette action' });
    }

    // Check if the username is valid
    const usernameRegex = /^[a-zA-Z0-9_]{1,20}$/; // Allow letters (a-z, A-Z), numbers (0-9), and underscore (_) with a maximum length of 20 characters
    if (username && !username.match(usernameRegex)) {
      return res.status(400).json({ message: 'Le nom d\'utilisateur doit contenir entre 1 et 20 caractères alphanumériques (lettres, chiffres et underscore)' });
    }

    // Check if the username is already taken
    if (username && (await User.findOne({ username }))) {
      return res.status(409).json({ message: 'Le nom d\'utilisateur est déjà utilisé' });
    }

    // Mettre à jour les champs si les valeurs sont fournies dans la requête
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role && req.user.role === 'admin') user.role = role;
    if (avatar && req.user.role === 'admin') user.avatar = avatar;

    await user.save();

    return res.json({ message: 'Profil mis à jour avec succès', user });
  } catch (err) {
    return res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour du profil', error: err });
  }
};
  

// Contrôleur pour afficher le profil de l'utilisateur (consultation)
exports.getProfile = async (req, res) => {
    const username = req.params.username;
  
    try {
        const user = await User.findOne({ username }).select('_id username email isVerified avatar role');
  
      // Vérifier si l'utilisateur existe
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      return res.json({ user });
    } catch (err) {
      return res.status(500).json({ message: 'Une erreur est survenue lors de la consultation du profil', error: err });
    }
  };

// Contrôleur pour supprimer le compte de l'utilisateur
exports.deleteAccount = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur est autorisé à supprimer le compte (admin ou utilisateur authentifié)
    if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à effectuer cette action' });
    }

    // Use deleteOne() to delete the user document
    await User.deleteOne({ _id: userId });

    return res.json({ message: 'Compte supprimé avec succès' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Une erreur est survenue lors de la suppression du compte', error: err });
  }
};

// Contrôleur pour afficher tous les utilisateurs (admin seulement)
exports.getAllUsers = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est autorisé à consulter tous les utilisateurs (admin seulement)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à effectuer cette action' });
    }

    const users = await User.find().select('_id username email isVerified avatar role');;

    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des utilisateurs', error: err });
  }
};

// Contrôleur pour mettre à jour le rôle d'un utilisateur (admin seulement)
exports.updateUserRole = async (req, res) => {
  const userId = req.params.userId;
  const { role } = req.body;

  try {
    // Vérifier si l'utilisateur est autorisé à mettre à jour le rôle (admin seulement)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à effectuer cette action' });
    }

    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le rôle de l'utilisateur
    user.role = role;
    await user.save();

    return res.json({ message: 'Rôle de l\'utilisateur mis à jour avec succès', user });
  } catch (err) {
    return res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour du rôle de l\'utilisateur', error: err });
  }
};

// Route for changing user password
exports.changePassword = async (req, res) => {
  const userId = req.params.userId;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Check if the current password matches the user's actual password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Le mot de passe actuel est incorrect' });
    }

    // Validate the new password with the same schema used during signup
    const validationSchema = Yup.object().shape({
      password: Yup.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule et un chiffre')
        .required('Le mot de passe est requis'),
    });

    await validationSchema.validate({ password: newPassword });

    // Check if the new password matches the confirmation password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Le nouveau mot de passe et la confirmation du mot de passe ne correspondent pas' });
    }

    // Update the user's password in the database
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    // Check if the error is a validation error from Yup
    if (err instanceof ValidationError) {
      // If it's a validation error, send the specific validation error message
      const errorMessage = err.errors[0];
      return res.status(400).json({ error: errorMessage });
    }

    // For other errors, send a generic 500 error message
    return res.status(500).json({ error: 'Une erreur est survenue lors du changement de mot de passe' });
  }
};

exports.updateAvatar = async (req, res) => {
  const userId = req.params.userId;
  const avatarFile = req.file;

  try {
    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le champ "avatar" de l'utilisateur avec le nom du fichier stocké dans GridFS
    user.avatar = avatarFile.filename;
    await user.save();

    return res.json({ message: 'Avatar mis à jour avec succès' });
  } catch (err) {
    return res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de l\'avatar' });
  }
};