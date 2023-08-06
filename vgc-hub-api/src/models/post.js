// models/post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: false },
  media: [{ type: String }],
  edited: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Utilisateurs qui ont liké ce post
  reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Utilisateurs qui ont reposté ce post
  repost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Référence au post original en cas de repost
  quoteOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Référence au post original en cas de quote
  quotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Références aux posts qui ont quoté ce post
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema, 'posts');

module.exports = Post;
