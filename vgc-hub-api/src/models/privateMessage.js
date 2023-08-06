// backend/models/privateMessage.js

const mongoose = require('mongoose');

const privateMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Remplacez 'User' par le nom de votre modèle d'utilisateur
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Remplacez 'User' par le nom de votre modèle d'utilisateur
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

const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);

module.exports = PrivateMessage;
