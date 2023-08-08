import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in (by checking the presence of the JWT token)
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      // Redirect to the home page if the user is already logged in
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setUsername(username.toLowerCase());
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/login`, {
        username,
        password
      });

      // Store the JWT token in localStorage
      localStorage.setItem('jwtToken', response.data.token);
      localStorage.setItem("loggedInUsername", username.toLowerCase());

      // Redirect to the user profile page after successful login
      navigate(`/${username.toLowerCase()}`);

    } catch (error) {
      // If error, display the error message returned by the backend
      if (error.response.data.error) {
          toast.error(error.response.data.error);
        } else {
              toast.error('Error during login. Please check your credentials.');
            }
      // Display an error message or do something else on failure
    }
  };

  return (
    <div className="w-64 mx-auto mt-4 text-center"
    style={{ paddingTop: "100px" }}
    >
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="on"
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="on"
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Login
        </button>
      </form>
      <Link to="/signup" className="text-blue-500 hover:underline block mt-2">
        Sign Up
      </Link>
      <Link to="/forgot-password" className="text-blue-500 hover:underline block mt-2">
        Forgot Password
      </Link>
      <ToastContainer />
    </div>
  );
};

export default Login;
