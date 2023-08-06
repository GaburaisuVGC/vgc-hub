// backend/models/groupMessage.js

const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Remplacez 'User' par le nom de votre modèle d'utilisateur
      required: true,
    },
    groupChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupChat', // Remplacez 'GroupChat' par le nom de votre modèle de chat groupé
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    media: {
      type: String, // Vous pouvez stocker l'URL du média ou utiliser un autre moyen pour stocker le fichier (par exemple, GridFS)
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

module.exports = GroupMessage;
