// ForgotPasswordPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/forgot-password', { email });
      toast.success(response.data.message);
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erreur lors de la demande de réinitialisation du mot de passe.');
      }
    }
  };

  return (
    <div>
      <h2>Mot de passe oublié</h2>
      <form onSubmit={handleForgotPassword}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="on"
        />
        <button type="submit">Envoyer un email de réinitialisation</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default ForgotPasswordPage;
