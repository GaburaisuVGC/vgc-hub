import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/verify/${token}`);
        toast.success(response.data.message);
        navigate('/email-verification-confirmation');
      } catch (error) {
        toast.error('Erreur lors de la vérification de l\'e-mail.');
        navigate('/email-verification-error');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>Vérification de l'e-mail en cours...</p>
    </div>
  );
};

export default VerifyEmail;
