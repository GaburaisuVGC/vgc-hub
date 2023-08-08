import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast} from 'react-toastify';
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

      // Display a success message or navigate to the login page after successful password reset
      toast.success(response.data.message);
      // Redirect to the login page
      navigate('/login');
    } catch (error) {
      // Display an error message if password reset fails
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error while resetting the password.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Password Reset</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="on"
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="on"
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
          Reset Password
        </button>
      </form>
       
    </div>
  );
};

export default ResetPasswordPage;
