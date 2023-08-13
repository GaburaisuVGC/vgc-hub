// services/postService.js
const Post = require("../models/post");
const User = require("../models/user");
const Notification = require('../models/notification');
const { connectedSockets } = require('../socket');

class PostService {
  async createPost(content, quoteOf, user, files) {
    try {
      if (files && files.length > 4) {
        return { status: 400, data: { message: "You can upload only 4 images or 1 video per post" } };
      }

      if (!user) {
        return { status: 401, data: { message: "You must be logged in to create a post" } };
      }

      if (!content && (!files || files.length === 0)) {
        return { status: 400, data: { message: "Please provide content for the post" } };
      }

      if (quoteOf) {
        const quotePost = await Post.findById(quoteOf);
        if (!quotePost) {
          return { status: 404, data: { message: "Post to quote not found" } };
        }
      }

      const post = new Post({
        user: user._id,
        content,
        media: files ? files.map((file) => file.filename) : [],
        quoteOf: quoteOf ? quoteOf : null,
      });

      await post.save();

      if (quoteOf) {
        const quotePost = await Post.findById(quoteOf);
        if (quotePost) {
          quotePost.quotes.push(post._id);
          await quotePost.save();

              // Créer une notification pour le repost (si vous le souhaitez)
              // Seulement si le reposteur est différent de l'auteur du post original

                if (quotePost.user.toString() !== user._id.toString()) {
    const notification = new Notification({
        user: quotePost.user,
        type: 'quote',
        postId: post._id,
        follower: user._id,
      });
      await notification.save();

            const recipientSocket = connectedSockets.get(quotePost.user.toString());

            if (recipientSocket) {
              recipientSocket.emit('notification', notification);
            }

        }
        }
      }

      const mentionRegex = /@([a-zA-Z0-9_]+)/g;
        let mentions = content.match(mentionRegex);
        mentions = mentions ? mentions.map((mention) => mention.substring(1)) : null;
        if (mentions) {
          const users = await User.find({ username: { $in: mentions } });
          if (users) {
            users.forEach(async (mentionnedUser) => {
                // Only if the mentionned user is not the post author
                if (mentionnedUser._id.toString() === user._id.toString()) {
                  return;
                }
                const notification = new Notification({
                    user: mentionnedUser._id,
                    type: 'mention',
                    postId: post._id,
                    follower: user._id,
                });

                await notification.save();

                const recipientSocket = connectedSockets.get(mentionnedUser._id.toString());

              if (recipientSocket) {
                recipientSocket.emit('notification', notification);
              }
            });
          }
        }




      return { status: 200, data: { message: "Post added successfully", post } };
    } catch (error) {
      console.error(error);
      return { status: 500, data: { message: "An error occurred while adding the post", error } };
    }
  }
}

module.exports = PostService;
