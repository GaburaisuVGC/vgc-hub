// services/followNotificationService.js
const User = require("../models/user");
const Notification = require('../models/notification');
const { connectedSockets } = require('../socket');

class FollowNotificationService {
  async handleFollow(followedUserId, followerUserId) {
    try {
      const followedUser = await User.findById(followedUserId);
      if (!followedUser) {
        return { status: 404, data: { message: "Followed user not found" } };
      }

      const notification = new Notification({
        user: followedUserId,
        type: 'follow',
        follower: followerUserId,
      });
      await notification.save();

      const recipientSocket = connectedSockets.get(followedUserId);

      if (recipientSocket) {
        recipientSocket.emit('notification', notification);
      }

      return { status: 200, data: { message: "Follow notification sent successfully" } };
    } catch (error) {
      console.error("Error sending follow notification:", error);
      return { status: 500, data: { message: "Internal server error" } };
    }
  }
}

module.exports = FollowNotificationService;
