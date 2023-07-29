import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmailResendForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResendVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/auth/resend-verification', {
        email,
      });

      toast.success(response.data.message);
      setEmail('');
    } catch (error) {
      if (error.response && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erreur lors de l\'envoi de l\'e-mail de vérification.');
      }
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleResendVerification}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Resend Verification Email'}
      </button>
    </form>
  );
};

export default EmailResendForm;
