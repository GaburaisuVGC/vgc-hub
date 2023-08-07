const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Yup = require("yup");
const { ValidationError } = require("yup");
const mongoose = require("mongoose");
const grid = require("gridfs-stream");

// Contrôleur pour mettre à jour le profil de l'utilisateur (modification)
exports.updateProfile = async (req, res) => {
  const userId = req.params.userId;
  const { username, email, password, role, avatar } = req.body;

  try {
    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si l'utilisateur est autorisé à modifier le profil (admin ou utilisateur authentifié)
    if (
      user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
    }

    // Check if the username is valid
    const usernameRegex = /^[a-zA-Z0-9_]{1,20}$/; // Allow letters (a-z, A-Z), numbers (0-9), and underscore (_) with a maximum length of 20 characters
    if (username && !username.match(usernameRegex)) {
      return res
        .status(400)
        .json({
          message:
            "Le nom d'utilisateur doit contenir entre 1 et 20 caractères alphanumériques (lettres, chiffres et underscore)",
        });
    }

    // Check if the username is already taken
    if (username && (await User.findOne({ username }))) {
      return res
        .status(409)
        .json({ message: "Le nom d'utilisateur est déjà utilisé" });
    }

    // Mettre à jour les champs si les valeurs sont fournies dans la requête
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role && req.user.role === "admin") user.role = role;
    if (avatar && req.user.role === "admin") user.avatar = avatar;

    await user.save();

    return res.json({ message: "Profil mis à jour avec succès", user });
  } catch (err) {
    return res
      .status(500)
      .json({
        message: "Une erreur est survenue lors de la mise à jour du profil",
        error: err,
      });
  }
};

// Contrôleur pour afficher le profil de l'utilisateur (consultation)
exports.getProfile = async (req, res) => {
  const username = req.params.username;

  try {
    const user = await User.findOne({ username }).select(
      "_id username plainName email isVerified avatar role likes reposts followers following blockedUsers status"
    );

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Récupérer les posts de l'utilisateur
    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });

    return res.json({ user, posts });
  } catch (err) {
    return res
      .status(500)
      .json({
        message: "Une erreur est survenue lors de la consultation du profil",
        error: err,
      });
  }
};

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connexion à la base de données MongoDB
const conn = mongoose.createConnection(
  process.env.MONGODB_URI,
  mongooseOptions
);
let gfs;
let gfs2;

conn.once("open", () => {
  // Initialiser l'instance de GridFSStream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "avatars",
  });
  gfs2 = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "posts",
  });
});

// Contrôleur pour supprimer le compte de l'utilisateur
exports.deleteAccount = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si l'utilisateur est autorisé à supprimer le compte (admin ou utilisateur authentifié)
    if (
      user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
    }

    // Supprimer les replies des posts, les replies étant des posts de l'utilisateur
    // il faut trouver tous les posts de l'utilisateur et update tous les posts qui ont un postid qui correspond à un des posts de l'utilisateur dans replies
    const posts = await Post.find({ user: userId });
    await Post.updateMany(
      { replies: { $in: posts } },
      { $pull: { replies: { $in: posts } } }
    );

    // supprimer les replyTo des posts, les replyTo étant des posts de l'utilisateur
    // il faut trouver tous les posts de l'utilisateur et update tous les posts qui ont un postid qui correspond à un des posts de l'utilisateur dans replyTo
    // replyTo n'est pas un array mais contient un seul postid
    await Post.updateMany(
      { replyTo: { $in: posts } },
      { $unset: { replyTo: 1 } }
    );

    // supprimer les médias attachés aux posts de l'utilisateur
    // il faut trouver tous les posts de l'utilisateur et supprimer les médias attachés avec gridfs
    for (const post of posts) {
      if (post.media && post.media.length > 0) {
        for (const filename of post.media) {
          console.log(filename);
          // Supprimer le fichier de GridFS
          const fileToDelete = await gfs2
            .find({ filename: filename })
            .toArray();
          if (fileToDelete.length > 0) {
            await gfs2.delete(fileToDelete[0]._id);
          }
        }
      }
    }

    // Supprimer les posts de l'utilisateur
    // Use deleteMany() to delete all the posts of the user
    await Post.deleteMany({ user: userId });

    // Supprimer les reposts et les likes de l'utilisateur
    // Use updateMany() to remove the user from the likes and reposts arrays of all the posts
    await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });
    await Post.updateMany({ reposts: userId }, { $pull: { reposts: userId } });

    // Supprimer l'avatar de l'utilisateur dans gridfs
    // Vérifier si l'utilisateur a déjà un avatar
    if (user.avatar && user.personalAvatar === true) {
      // Supprimer l'ancien avatar de GridFS
      const fileToDelete = await gfs.find({ filename: user.avatar }).toArray();
      console.log(fileToDelete);
      if (fileToDelete.length > 0) {
        await gfs.delete(fileToDelete[0]._id);
      }
    }

    // Supprimer followers et followings
    // Use updateMany() to remove the user from the followers and following arrays of all the users
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );

    // Supprimer blockedUsers
    // Use updateMany() to remove the user from the blockedUsers arrays of all the users
    await User.updateMany(
      { blockedUsers: userId },
      { $pull: { blockedUsers: userId } }
    );

    // Use deleteOne() to delete the user document
    await User.deleteOne({ _id: userId });

    return res.json({ message: "Compte supprimé avec succès" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({
        message: "Une erreur est survenue lors de la suppression du compte",
        error: err,
      });
  }
};

// Contrôleur pour afficher tous les utilisateurs (admin seulement)
exports.getAllUsers = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est autorisé à consulter tous les utilisateurs (admin seulement)
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
    }

    const users = await User.find().select(
      "_id username plainName email isVerified avatar role followers following blockedUsers status"
    );

    return res.json({ users });
  } catch (err) {
    return res
      .status(500)
      .json({
        message:
          "Une erreur est survenue lors de la récupération des utilisateurs",
        error: err,
      });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findOne({ _id: userId }).select(
      "_id username plainName avatar likes reposts followers following blockedUsers role status"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Error fetching user by ID" });
  }
};

// Contrôleur pour mettre à jour le rôle d'un utilisateur (admin seulement)
exports.updateUserRole = async (req, res) => {
  const userId = req.params.userId;
  const { role } = req.body;

  try {
    // Vérifier si l'utilisateur est autorisé à mettre à jour le rôle (admin seulement)
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
    }

    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mettre à jour le rôle de l'utilisateur
    user.role = role;
    await user.save();

    return res.json({
      message: "Rôle de l'utilisateur mis à jour avec succès",
      user,
    });
  } catch (err) {
    return res
      .status(500)
      .json({
        message:
          "Une erreur est survenue lors de la mise à jour du rôle de l'utilisateur",
        error: err,
      });
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
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Check if the current password matches the user's actual password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Le mot de passe actuel est incorrect" });
    }

    // Validate the new password with the same schema used during signup
    const validationSchema = Yup.object().shape({
      password: Yup.string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Le mot de passe doit contenir au moins une majuscule et un chiffre"
        )
        .required("Le mot de passe est requis"),
    });

    await validationSchema.validate({ password: newPassword });

    // Check if the new password matches the confirmation password
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({
          error:
            "Le nouveau mot de passe et la confirmation du mot de passe ne correspondent pas",
        });
    }

    // Update the user's password in the database
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (err) {
    // Check if the error is a validation error from Yup
    if (err instanceof ValidationError) {
      // If it's a validation error, send the specific validation error message
      const errorMessage = err.errors[0];
      return res.status(400).json({ error: errorMessage });
    }

    // For other errors, send a generic 500 error message
    return res
      .status(500)
      .json({
        error: "Une erreur est survenue lors du changement de mot de passe",
      });
  }
};

exports.updateAvatar = async (req, res) => {
  const userId = req.params.userId;
  const avatarFile = req.file;

  try {
    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si l'utilisateur a déjà un avatar
    if (user.avatar && user.personalAvatar === true) {
      // Supprimer l'ancien avatar de GridFS
      const fileToDelete = await gfs.find({ filename: user.avatar }).toArray();
      console.log(fileToDelete);
      if (fileToDelete.length > 0) {
        await gfs.delete(fileToDelete[0]._id);
      }
    }

    // Mettre à jour le champ "avatar" de l'utilisateur avec le nom du fichier stocké dans GridFS
    user.avatar = avatarFile.filename;
    user.personalAvatar = true;
    await user.save();

    return res.json({ message: "Avatar mis à jour avec succès" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({
        error: "Une erreur est survenue lors de la mise à jour de l'avatar",
      });
  }
};

// followUser controller
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user; // Assuming you have the logged-in user available in req.user

    // Check if the authenticated user is trying to follow themselves
    if (currentUser._id.toString() === userId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    // Check if the user is already following the user they are trying to follow
    if (currentUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are already following this user." });
    }

    // Check if the user is blocked by the user they are trying to follow
    // Assuming you have a "blockedUsers" array in your User model
    if (currentUser.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: "You cannot follow this user." });
    }

    const followedUser = await User.findById(userId);

    // Check if the followed user has blocked the user who is trying to follow them
    if (followedUser.blockedUsers.includes(currentUser._id)) {
      return res.status(400).json({ message: "You cannot follow this user." });
    }

    // Add the userId to the following array of the logged-in user
    currentUser.following.push(userId);
    await currentUser.save();

    // Add the logged-in user's ID to the followers array of the followed user
    followedUser.followers.push(currentUser._id);
    await followedUser.save();

    res.status(200).json({ message: "Successfully followed the user." });
  } catch (error) {
    res.status(500).json({ message: "Error following the user.", error });
  }
};

// unfollowUser controller
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user; // Assuming you have the logged-in user available in req.user

    // Remove the userId from the following array of the logged-in user
    currentUser.following = currentUser.following.filter(
      (followedUserId) => followedUserId.toString() !== userId
    );
    await currentUser.save();

    // Remove the logged-in user's ID from the followers array of the followed user
    const followedUser = await User.findById(userId);
    followedUser.followers = followedUser.followers.filter(
      (followerId) => followerId.toString() !== currentUser._id.toString()
    );
    await followedUser.save();

    res.status(200).json({ message: "Successfully unfollowed the user." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error unfollowing the user.", error });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "followers",
      "username plainName avatar"
    );
    res.status(200).json({ followers: user.followers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching followers.", error });
  }
};

exports.getFollowings = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "following",
      "username plainName avatar"
    );
    res.status(200).json({ followings: user.following });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching followings.", error });
  }
};

exports.blockUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user;

  try {
    // Vérifier que l'utilisateur n'est pas en train de se bloquer lui-même
    if (userId === currentUser._id.toString()) {
      console.log("blocking yourself");
      return res.status(400).json({ message: "You cannot block yourself." });
    }

    // Vérifier que l'utilisateur n'est pas déjà bloqué
    const findCurrentUser = await User.findById(currentUser._id.toString());
    if (findCurrentUser.blockedUsers.includes(userId)) {
      console.log("user is not a user or is already blocked");
      return res.status(400).json({ message: "You cannot block this user." });
    }

    // Vérifier que l'utilisateur à bloquer existe
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      console.log("user to block not found");
      return res.status(404).json({ message: "User to block not found." });
    }

    // Vérifier que l'utilisateur à bloquer n'a pas le rôle admin
    if (userToBlock.role === "admin") {
      console.log("user to block is an admin");
      return res
        .status(400)
        .json({ message: "You cannot block an admin user." });
    }

    // Ajouter l'utilisateur bloqué à la liste des utilisateurs bloqués
    findCurrentUser.blockedUsers.push(userId);
    await findCurrentUser.save();

    // Retirer l'utilisateur bloqué des listes de followers et de following
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { followers: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: { following: currentUser._id },
    });

    // Retirer l'utilisateur courant de la liste de followers et following de l'utilisateur bloqué
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUser._id },
    });
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: userId },
    });

    res.json({ message: "User blocked successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while blocking the user." });
  }
};

exports.unblockUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user;

  try {
    // Vérifier que l'utilisateur n'est pas en train de se débloquer lui-même
    if (userId === currentUser._id.toString()) {
      return res.status(400).json({ message: "You cannot unblock yourself." });
    }

    // Vérifier que l'utilisateur est déjà bloqué
    const findCurrentUser = await User.findById(currentUser._id.toString());
    if (!findCurrentUser.blockedUsers.includes(userId.toString())) {
      return res.status(400).json({ message: "You cannot unblock this user." });
    }

    // Vérifier que l'utilisateur à débloquer existe
    const userToUnblock = await User.findById(userId);
    if (!userToUnblock) {
      return res.status(404).json({ message: "User to unblock not found." });
    }

    // Retirer l'utilisateur à débloquer de la liste des utilisateurs bloqués
    findCurrentUser.blockedUsers = findCurrentUser.blockedUsers.filter(
      (blockedUserId) => blockedUserId.toString() !== userId
    );
    await findCurrentUser.save();

    res.json({ message: "User unblocked successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while unblocking the user." });
  }
};

exports.banUser = async (req, res) => {
  const { user } = req;
  const { userId } = req.params;

  try {
    // Vérifier que l'utilisateur n'est pas en train de se bannir lui-même
    if (user._id.toString() === userId) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas vous bannir vous-même." });
    }

    const userToBan = await User.findById(userId);

    // Vérifier que l'utilisateur à bannir existe
    if (!userToBan) {
      return res
        .status(404)
        .json({ message: "L'utilisateur à bannir n'existe pas." });
    }

    // Vérifier que l'utilisateur n'est pas déjà banni
    if (userToBan.status === "banned") {
      return res.status(400).json({ message: "L'utilisateur est déjà banni." });
    }

    // Vérifier que l'utilisateur à bannir n'a pas le rôle admin
    if (userToBan.role === "admin") {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas bannir un administrateur." });
    }

    // Changer le statut de l'utilisateur en "banned"
    userToBan.status = "banned";
    await userToBan.save();

    return res
      .status(200)
      .json({ message: "L'utilisateur a été banni avec succès." });
  } catch (error) {
    console.error("Erreur lors du bannissement de l'utilisateur :", error);
    return res
      .status(500)
      .json({ message: "Erreur lors du bannissement de l'utilisateur." });
  }
};

exports.unbanUser = async (req, res) => {
  const { user } = req;
  const { userId } = req.params;

  try {
    // Vérifier que l'utilisateur n'est pas en train de se débannir lui-même
    if (user._id.toString() === userId) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas vous débannir vous-même." });
    }

    // Vérifier que l'utilisateur à débannir existe
    const userToUnban = await User.findById(userId);
    if (!userToUnban) {
      return res
        .status(404)
        .json({ message: "L'utilisateur à débannir n'existe pas." });
    }

    // Vérifier que l'utilisateur est déjà banni
    if (userToUnban.status !== "banned") {
      return res
        .status(400)
        .json({ message: "L'utilisateur n'est pas banni." });
    }

    // Changer le statut de l'utilisateur en "default"
    userToUnban.status = "default";
    await userToUnban.save();

    return res
      .status(200)
      .json({ message: "L'utilisateur a été débanni avec succès." });
  } catch (error) {
    console.error("Erreur lors du débannissement de l'utilisateur :", error);
    return res
      .status(500)
      .json({ message: "Erreur lors du débannissement de l'utilisateur." });
  }
};
