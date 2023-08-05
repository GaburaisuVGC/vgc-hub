// models/post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: false },
  media: [{ type: String }],
  edited: { type: Boolean, default: false },
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema, 'posts');

module.exports = Post;
