import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ResetPasswordPage = () => {
  const { resetToken } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/reset-password/${resetToken}`, {
        newPassword,
        confirmPassword,
      });

      // Afficher un message de succès ou rediriger vers la page de connexion après la réinitialisation du mot de passe réussie
      toast.success(response.data.message);
      // Rediriger vers la page de connexion
        navigate('/login');

      // Ici, tu peux rediriger l'utilisateur vers la page de connexion après la réinitialisation du mot de passe réussie
    } catch (error) {
      // Afficher un message d'erreur en cas d'échec de la réinitialisation du mot de passe
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erreur lors de la réinitialisation du mot de passe.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Réinitialisation du Mot de Passe</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="on"
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="on"
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
          Réinitialiser le mot de passe
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default ResetPasswordPage;