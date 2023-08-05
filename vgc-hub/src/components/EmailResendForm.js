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
    <form onSubmit={handleResendVerification} className="w-64 mx-auto mt-4">
    <div className="mb-4">
      <label htmlFor="email" className="block mb-2 font-bold">Email:</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
      />
    </div>
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full py-2 text-white bg-blue-500 rounded-md ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-600'}`}
    >
      {isLoading ? 'Sending...' : 'Resend Verification Email'}
    </button>
  </form>
);
};

export default EmailResendForm;
