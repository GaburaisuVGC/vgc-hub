import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Header = () => {
  const [loggedInUserId, setLoggedInUserId] = useState('');
  const [user, setUser] = useState(null);
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

  // Check if the user is logged in (simulated here with a loggedInUsername variable)
  const loggedInUsername = localStorage.getItem('loggedInUsername');

  // Function to handle clicking on user avatar or username
  const handleUserInfoClick = () => {
    if (loggedInUsername) {
      navigate(`/${loggedInUsername}`);
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
              />
              <p className="user-username text-white ml-2 cursor-pointer">@{loggedInUsername}</p>
            </div>
            <div>
              {user.role === 'admin' && (
                <Link to="/admin" className="navbar-button bg-gray-700 px-4 py-2 rounded-full ml-4">Admin Panel</Link>
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
      <ToastContainer />
    </header>
  );
};

export default Header;
