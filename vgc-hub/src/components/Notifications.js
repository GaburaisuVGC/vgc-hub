import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { Link } from 'react-router-dom';
import Post from "./Post";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState("");

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      const decodedToken = jwt_decode(jwtToken);
      setLoggedInUserId(decodedToken.userId);
    }
  }, []);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/notifications/${loggedInUserId}`);
        const userNotifications = response.data.notifications;

        for (let i = 0; i < userNotifications.length; i++) {
          const notification = userNotifications[i];
          const followerResponse = await axios.get(`${BACKEND_URL}/users/id/${notification.follower}`);
          const follower = followerResponse.data.user;

          let postContent = '';
          let postFullInfo = null;
          if (notification.type === 'like' || notification.type === 'repost') {
            const postResponse = await axios.get(`${BACKEND_URL}/posts/post/${notification.postId}`);
            postContent = postResponse.data.post.content;
            postContent = postContent.length > 20 ? `${postContent.substring(0, 20)}...` : postContent;
          } else if (notification.type === 'reply' || notification.type === 'quote' || notification.type === 'mention') {
            const postResponse = await axios.get(`${BACKEND_URL}/posts/post/${notification.postId}`);
            postFullInfo = postResponse.data.post;
          }

          // Gérer les notifications reçues ici
          setNotifications((prevNotifications) => [
            {
              ...notification,
              follower,
              postContent,
              postFullInfo,
            },
            ...prevNotifications,
          ]);

          // sort notifications by date
            setNotifications((prevNotifications) => {
                const sortedNotifications = [...prevNotifications];
                sortedNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                return sortedNotifications;
            });
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (loggedInUserId) {
      fetchUserNotifications();
    }
  }, [loggedInUserId]);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      extraHeaders: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    });

    socket.on('notification', async (notification) => {
      const followerResponse = await axios.get(`${BACKEND_URL}/users/id/${notification.follower}`);
      const follower = followerResponse.data.user;

      let postContent = '';
      let postFullInfo = null;
      if (notification.type === 'like' || notification.type === 'repost') {
        const postResponse = await axios.get(`${BACKEND_URL}/posts/post/${notification.postId}`);
        postContent = postResponse.data.post.content;
        postContent = postContent.length > 20 ? `${postContent.substring(0, 20)}...` : postContent;
      } else if (notification.type === 'reply' || notification.type === 'quote' || notification.type === 'mention') {
        const postResponse = await axios.get(`${BACKEND_URL}/posts/post/${notification.postId}`);
        postFullInfo = postResponse.data.post;
      }

      // Gérer les notifications reçues ici
      setNotifications((prevNotifications) => [
        {
          ...notification,
          follower,
          postContent,
          postFullInfo,
        },
        ...prevNotifications,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      // Envoyer une requête au backend pour marquer la notification comme lue
      await axios.patch(`${BACKEND_URL}/notifications/mark-as-read/${notificationId}`);
  
      // Mettre à jour l'état de lecture de la notification dans l'état local
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatCreatedAt = (createdAt) => {
    const now = new Date();
    const diffInMilliseconds = now - new Date(createdAt);
    const diffInSeconds = diffInMilliseconds / 1000;

    if (diffInSeconds < 60) {
      return `${Math.floor(diffInSeconds)} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  };

  const getNotificationText = (notification) => {
    const followerInfo = (
      <Link to={`/${notification.follower.username}`} className="flex items-center">
        <img src={`${BACKEND_URL}/avatars/${notification.follower.avatar}`} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
        <span className="font-semibold">{notification.follower.plainName}</span>
      </Link>
    );

    const postInfo = (
      <Link to={`/post/${notification.postId}`} className="text-blue-500">
        {notification.postContent}
      </Link>
    );

    const postFullInfo = notification.postFullInfo;

    const createdAt = new Date(notification.createdAt);
    const formattedCreatedAt = formatCreatedAt(createdAt);

    return (
        <div className="border p-4 mb-4 bg-white rounded shadow-md">
          <div className="flex items-center mb-2">
            {followerInfo}
            <span className="ml-auto text-gray-500">{formattedCreatedAt}</span>
          </div>
          {notification.type === 'reply' || notification.type === 'quote' ? (
            <>
              <div className="mb-2">
                replied to your post
              </div>
              <Post post={postFullInfo} />
            </>
          ) : notification.type === 'repost' ? (
            <>
              <div className="mb-2">
                reposted your post
              </div>
              {postInfo}
            </>
          ) : notification.type === 'like' ? (
            <>
              <div className="mb-2">
                liked your post
              </div>
              {postInfo}
            </>
          ) : notification.type === 'follow' ? (
            <>
            <div className="mb-2">
                follows you
            </div>
          </>
          ) : notification.type === 'mention' ? (
            <>
            <div className="mb-2">
                mentioned you in a post
            </div>
            <Post post={postFullInfo} />
            </>
          ) : null
        }
        </div>
      );
      
  };

  return (
    <div className="container-1 mx-auto px-4 py-8 flex flex-col min-h-screen"
    style={{ paddingTop: "100px" }}
    >
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
      <ul>
        {notifications.map((notification, index) => (
                  <li
                  key={index}
                  className={`${
                    notification.isRead ? 'bg-gray-100' : 'bg-white'
                  } border p-4 mb-4 rounded shadow-md`}
                  onClick={() => markNotificationAsRead(notification._id)}
                >{getNotificationText(notification)}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
