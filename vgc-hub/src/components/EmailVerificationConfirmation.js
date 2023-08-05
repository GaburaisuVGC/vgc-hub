import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmailVerificationConfirmation = () => {
  const navigate = useNavigate();

  // Automatically redirect to the home page after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="w-64 mx-auto mt-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Email Verification Confirmation</h2>
      <p>Your email has been verified. You will be redirected to the home page in 5 seconds.</p>
    </div>
  );
};

export default EmailVerificationConfirmation;
