import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EmailVerificationError from './components/EmailVerificationError';
import EmailVerificationConfirmation from './components/EmailVerificationConfirmation';
import VerifyEmail from './components/VerifyEmail';
import EditUser from './components/EditUser';
import ResetPasswordPage from './components/ResetPasswordPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import Home from './pages/Home';
import UserProfile from './pages/profile/UserProfile';
import PostInfo from './pages/posts/PostInfo';
import PostEdit from './pages/posts/PostEdit';
import UserProfileEdit from './pages/profile/UserProfileEdit';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import Panel from './pages/admin/Panel';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/:username" element={<UserProfile />} />
        <Route exact path="/post/:postId" element={<PostInfo />} />
        <Route exact path="/post/:postId/edit" element={<PostEdit />} />
        <Route exact path="/edit/:username" element={<UserProfileEdit />} />
        <Route exact path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/email-verification-error" element={<EmailVerificationError />} />
        <Route path="/email-verification-confirmation" element={<EmailVerificationConfirmation />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/admin" element={<Panel />} />
        <Route exact path="/admin/edit/:username" element={<EditUser />} />
        {/* Ajoutez d'autres routes ici pour d'autres pages */}
      </Routes>
    </Router>
  );
}

export default App;
