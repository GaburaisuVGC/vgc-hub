const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence à votre modèle d'utilisateur
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', // Référence à votre modèle de post
  },
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence à votre modèle d'utilisateur
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
