import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Signup from './components/Signup';
import Login from './components/Login';
import Profile from './components/Profile';
import EmailVerificationError from './components/EmailVerificationError';
import EmailVerificationConfirmation from './components/EmailVerificationConfirmation';
import VerifyEmail from './components/VerifyEmail';
import AdminPanel from './components/AdminPanel';
import EditUser from './components/EditUser';
import ProfilePage from './components/ProfilePage';
import HomePage from './components/HomePage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import PostPage from './components/PostPage';
import EditPost from './components/EditPost';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/:username" element={<ProfilePage />} />
        <Route exact path="/post/:postId" element={<PostPage />} />
        <Route exact path="/post/:postId/edit" element={<EditPost />} />
        <Route exact path="/edit/:username" element={<Profile />} />
        <Route exact path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verification-error" element={<EmailVerificationError />} />
        <Route path="/email-verification-confirmation" element={<EmailVerificationConfirmation />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route exact path="/admin/edit/:username" element={<EditUser />} />
        {/* Ajoutez d'autres routes ici pour d'autres pages */}
      </Routes>
    </Router>
  );
}

export default App;
