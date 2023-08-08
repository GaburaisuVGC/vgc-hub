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
import BannedRouteGuard from "./components/BannedRouteGuard";
import AboutVgcHub from './pages/infos/About';
import QuestionsAndAnswers from './pages/infos/QandA';
import PrivacyPage from './pages/infos/Privacy';
import GDPRPage from './pages/infos/GDPR';
require('dotenv').config();

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BannedRouteGuard><Home /></BannedRouteGuard>} />
        <Route path="/:username" element={<UserProfile />} />
        <Route path="/post/:postId" element={<BannedRouteGuard><PostInfo /></BannedRouteGuard>} />
        <Route path="/post/:postId/edit" element={<BannedRouteGuard><PostEdit /></BannedRouteGuard>} />
        <Route path="/edit/:username" element={<UserProfileEdit />} />
        <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/email-verification-error" element={<EmailVerificationError />} />
        <Route path="/email-verification-confirmation" element={<EmailVerificationConfirmation />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/admin" element={<Panel />} />
        <Route path="/admin/edit/:username" element={<EditUser />} />
        <Route path="/about" element={<AboutVgcHub />} />
        <Route path="/qa" element={<QuestionsAndAnswers />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/gdpr" element={<GDPRPage />} />
        {/* Add other routes here for other pages */}
      </Routes>
    </Router>
  );
}

export default App;
