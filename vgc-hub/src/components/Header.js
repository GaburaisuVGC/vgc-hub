import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import io from 'socket.io-client';
import { Link, useNavigate } from 'react-router-dom';
import { toast} from 'react-toastify';
import { FaBell } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Header = () => {
  const [loggedInUserId, setLoggedInUserId] = useState('');
  const [user, setUser] = useState(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      const decodedToken = jwt_decode(jwtToken);
      setLoggedInUserId(decodedToken.userId);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const jwtToken = localStorage.getItem('jwtToken');
      if (jwtToken) {
        const username = localStorage.getItem('loggedInUsername');
        try {
          const response = await axios.get(`${BACKEND_URL}/users/${username.toLowerCase()}`);
          setUser(response.data.user);
        } catch (error) {
          // Handle profile retrieval error, for example, show an error message or redirect to an error page
          toast.error('Error retrieving profile.');
        }
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUnreadNotificationCount = async () => {
      if (loggedInUserId) {
        try {
          const response = await axios.get(`${BACKEND_URL}/notifications/${loggedInUserId}`);
          setUnreadNotificationCount(response.data.notifications.filter((notification) => !notification.isRead).length);
        } catch (error) {
          console.error('Error fetching unread notification count:', error);
        }
      }
    };

    fetchUnreadNotificationCount();
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
      let message = '';
      if (notification.type === 'like') {
        message = `${follower.plainName} liked your post.`;
      } else if (notification.type === 'reply') {
        message = `${follower.plainName} replied to your post.`;
      } else if (notification.type === 'repost') {
        message = `${follower.plainName} reposted your post.`;
      } else if (notification.type === 'quote') {
        message = `${follower.plainName} quoted your post.`;
      } else if (notification.type === 'follow') {
        message = `${follower.plainName} follows you.`;
      } else if (notification.type === 'mention') {
        message = `${follower.plainName} mentioned you in a post.`;
      } else {
        message = `${follower.plainName} sent you a notification.`;
      }
      // Gérer les notifications reçues ici
      setUnreadNotificationCount((prevCount) => prevCount + 1);
      toast.info(message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Check if the user is logged in (simulated here with a loggedInUsername variable)
  const loggedInUsername = localStorage.getItem('loggedInUsername');

  // Function to handle clicking on user avatar or username
  const handleUserInfoClick = () => {
    if (loggedInUsername) {
      navigate(`/${loggedInUsername}`);
    }
  };

  const handleNotificationClick = () => {
    if (loggedInUsername) {
      navigate(`/notifications`);
    }
  };

  return (
    <header className='navbar flex justify-between items-center p-4 bg-gray-800 text-white h-20 fixed top-0 w-full'
    style={{ zIndex: "1000" }}
    >
      <div className="navbar-left">
        <Link to="/" className="navbar-logo text-3xl text-white">VGC Hub</Link>
      </div>
      <div className="navbar-right flex items-center ml-auto">
        {loggedInUserId && user && loggedInUserId === user._id ? (
          <div className="flex items-center">
            <div className="user-info flex items-center" onClick={handleUserInfoClick}>
              {/* Display user's avatar and username */}
              <img
  src={`${BACKEND_URL}/avatars/${user?.avatar}`}
  alt="Avatar"
  className="user-avatar w-10 h-10 rounded-full cursor-pointer"
  style={{ background: user?.color || '' }}
/>
              <p className="user-username text-white ml-2 cursor-pointer">@{loggedInUsername}</p>
            </div>
            <div className="relative ml-4">
              <div
                className="notification-icon cursor-pointer"
                onClick={handleNotificationClick}
              >
                {/* Icone de notification, par exemple : */}
                <FaBell className="h-6 w-6 text-gray-300 hover:text-gray-500" />
                
                {/* Badge pour le nombre de notifications non lues */}
                {unreadNotificationCount > 0 && (
                  <span className="badge absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">{unreadNotificationCount}</span>
                )}
              </div>
            </div>
            <div>
              {user.role === 'admin' && (
                <Link to="/admin" className="navbar-button bg-gray-700 px-4 py-2 rounded-full ml-4">Admin</Link>
              )}
            </div>
          </div>
        ) : (
          <div className="navbar-buttons flex items-center">
            {/* Display navigation links for Login and Signup pages */}
            <Link to="/login" className="navbar-button bg-gray-700 px-4 py-2 rounded-full mr-2">Login</Link>
            <Link to="/signup" className="navbar-button bg-gray-700 px-4 py-2 rounded-full">Signup</Link>
          </div>
        )}
      </div>
       
    </header>
  );
};

export default Header;
