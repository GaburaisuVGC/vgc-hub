// services/replyService.js
const Post = require("../models/post");
const Notification = require('../models/notification');
const { connectedSockets } = require('../socket');

class ReplyService {
  async createReply(postId, content, user, files) {
    try {
      const parentPost = await Post.findById(postId);
      if (!parentPost) {
        return { status: 404, data: { message: "Post to reply not found" } };
      }

      if (!user) {
        return { status: 401, data: { message: "You must be logged in to reply to a post" } };
      }

      if (files && files.length > 4) {
        return { status: 400, data: { message: "You can upload only 4 images or 1 video per post" } };
      }

      if (!content && (!files || files.length === 0)) {
        return { status: 400, data: { message: "Please provide content for the post" } };
      }

      const replyPost = new Post({
        user: user._id,
        content,
        media: files ? files.map((file) => file.filename) : [],
        replyTo: parentPost._id,
      });

      await replyPost.save();

      parentPost.replies.push(replyPost._id);
      await parentPost.save();

    // Créer une notification pour la reply (si vous le souhaitez)
    const notification = new Notification({
        user: parentPost.user,
        type: 'reply',
        postId,
        follower: user._id,
      });
      await notification.save();
  
      const recipientSocket = connectedSockets.get(parentPost.user.toString());
      if (recipientSocket) {
        recipientSocket.emit('notification', notification);
      }

      return { status: 201, data: { message: "Reply added successfully", replyPost } };
    } catch (error) {
      console.error(error);
      return { status: 500, data: { message: "An error occurred while adding the reply", error } };
    }
  }
}

module.exports = ReplyService;
