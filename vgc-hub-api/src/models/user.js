const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false }, // Champ pour indiquer si l'e-mail est vérifié ou non
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Ajoutez le champ role avec les valeurs possibles 'user' ou 'admin'
  avatar: {
    type: String,
    default: '/default-avatar.png', // Définissez une image par défaut pour les utilisateurs qui n'ont pas d'avatar
  },
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
