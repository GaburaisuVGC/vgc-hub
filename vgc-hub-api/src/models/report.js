const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // ID du post signalé (optionnel)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID de l'utilisateur signalé (optionnel)
  comment: { type: String, required: true }, // Raison du signalement
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID de l'utilisateur qui a effectué le signalement
  createdAt: { type: Date, default: Date.now }, // Date de création du signalement
});

const Report = mongoose.model('Report', reportSchema, 'reports');

module.exports = Report;
