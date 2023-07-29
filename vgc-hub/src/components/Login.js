import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        username,
        password
      });

      // Stocker le jeton JWT dans le localStorage
      localStorage.setItem('jwtToken', response.data.token);
      localStorage.setItem("loggedInUsername", username);

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
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="on"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="on"
        />
        <button type="submit">Login</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
