import React, { useEffect } from 'react';
import EmailResendForm from './EmailResendForm';
import { useNavigate } from 'react-router-dom';

const EmailVerificationError = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in. If not, redirect to the login page.
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="w-64 mx-auto mt-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Email Verification Error</h2>
      <p className="mb-4">You are not verified. Please check your email or</p>
      <EmailResendForm />
    </div>
  );
};

export default EmailVerificationError;
