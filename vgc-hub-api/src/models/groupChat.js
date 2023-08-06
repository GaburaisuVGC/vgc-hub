// backend/models/groupChat.js

const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Remplacez 'User' par le nom de votre modèle d'utilisateur
        required: true,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const GroupChat = mongoose.model('GroupChat', groupChatSchema);

module.exports = GroupChat;
