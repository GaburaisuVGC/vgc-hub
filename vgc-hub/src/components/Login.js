import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { set } from 'mongoose';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (en vérifiant la présence du jeton JWT)
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
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

      // Stocker le jeton JWT dans le localStorage
      localStorage.setItem('jwtToken', response.data.token);
      localStorage.setItem("loggedInUsername", username.toLowerCase());

      // Rediriger vers la page du profil utilisateur après une connexion réussie
      navigate(`/${username}`);

    } catch (error) {
      // Si erreur, afficher le message d'erreur renvoyé par le backend
      if (error.response.data.error) {
          toast.error(error.response.data.error);
        } else {
              toast.error('Erreur lors de la connexion. Veuillez vérifier vos identifiants.');
            }
      // Afficher un message d'erreur ou faire autre chose en cas d'échec
    }
  };

  return (
    <div className="w-64 mx-auto mt-4 text-center">
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
        S'inscrire
      </Link>
      <Link to="/forgot-password" className="text-blue-500 hover:underline block mt-2">
        Mot de passe oublié
      </Link>
      <ToastContainer />
    </div>
  );
};

export default Login;
