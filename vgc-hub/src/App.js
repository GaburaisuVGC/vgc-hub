import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Signup from './components/Signup';
import Login from './components/Login';
import Profile from './components/Profile';
import EmailVerificationError from './components/EmailVerificationError';
import EmailVerificationConfirmation from './components/EmailVerificationConfirmation';
import VerifyEmail from './components/VerifyEmail';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/:username" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verification-error" element={<EmailVerificationError />} />
        <Route path="/email-verification-confirmation" element={<EmailVerificationConfirmation />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        {/* Ajoutez d'autres routes ici pour d'autres pages */}
      </Routes>
    </Router>
  );
}

export default App;
