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
    <div className="w-64 mx-auto mt-4 text-center">
    <h2 className="text-2xl font-bold mb-4">Mot de passe oublié</h2>
    <form onSubmit={handleForgotPassword}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="on"
        className="w-full px-4 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
      >
        Envoyer un email de réinitialisation
      </button>
    </form>
    <ToastContainer />
  </div>
);
};

export default ForgotPasswordPage;
