const Post = require("../models/post");
const User = require("../models/user");
const Notification = require('../models/notification');
const { connectedSockets } = require('../socket'); // Importer connectedSockets depuis le fichier socket.js

class LikeNotificationService {
  async handleLike(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      return { status: 404, data: { message: "Post not found" } };
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
      const user = await User.findById(userId);
      if (user) {
        user.likes.pull(postId);
        await user.save();
      }
      // Supprimer la notification associée
        await Notification.findOneAndDelete({ user: post.user, type: 'like', follower: userId, postId });
    } else {
      post.likes.push(userId);
      const user = await User.findById(userId);
      if (user) {
        user.likes.push(postId);
        await user.save();

        // Créer une notification pour le like (si vous le souhaitez)
        // Seulement si le liker est différent de l'auteur du post

        if (post.user.toString() !== userId) {
        const notification = new Notification({
          user: post.user,
          type: 'like',
          follower: userId,
          postId,
        });
        await notification.save();

        const recipientSocket = connectedSockets.get(post.user.toString());

        if (recipientSocket) {
          recipientSocket.emit('notification', notification);
        }
    }
      }
    }

    await post.save();

    return { status: 200, data: { message: "Like updated successfully", post } };
  }
}

module.exports = LikeNotificationService;
