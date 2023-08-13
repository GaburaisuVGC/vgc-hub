// services/repostService.js
const Post = require("../models/post");
const User = require("../models/user");
const Notification = require('../models/notification');
const { connectedSockets } = require('../socket');

class RepostService {
  async handleRepost(postId, userId) {
    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return { status: 404, data: { message: "Original post not found" } };
    }

    const existingRepost = originalPost.reposts.some(
      (repost) => repost.toString() === userId
    );

    if (existingRepost) {
      const user = await User.findById(userId);
      if (user) {
        user.reposts = user.reposts.filter(
          (repost) => repost.post.toString() !== postId
        );
        await user.save();
      }

      originalPost.reposts = originalPost.reposts.filter(
        (repost) => repost.toString() !== userId
      );
      await originalPost.save();

        // Supprimer la notification associée
        await Notification.findOneAndDelete({ user: originalPost.user, type: 'repost', follower: userId, postId });


      return { status: 200, data: { message: "Repost removed successfully" } };
    }

    const user = await User.findById(userId);
    if (user) {
      user.reposts.push({ post: postId, repostedAt: Date.now() });
      await user.save();
    }

    originalPost.reposts.push(userId);
    await originalPost.save();

    // Créer une notification pour le repost (si vous le souhaitez)
    const notification = new Notification({
      user: originalPost.user,
      type: 'repost',
      postId,
      follower: userId,
    });
    await notification.save();

    const recipientSocket = connectedSockets.get(originalPost.user.toString());
    if (recipientSocket) {
      recipientSocket.emit('notification', notification);
    }

    return { status: 201, data: { message: "Post reposted successfully" } };
  }
}

module.exports = RepostService;
