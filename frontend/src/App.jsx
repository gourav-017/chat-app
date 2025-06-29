import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const App = () => {
  const { authUser, loading } = useContext(AuthContext);

  // 🔄 Show loader while checking auth
  if (loading) {
  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="w-48 h-6 bg-gradient-to-r from-gray-700 via-gray-900 to-gray-700 animate-pulse rounded"></div>
    </div>
  );
}


  return (
    <div className="bg-[url('./bgImage.svg')] bg-cover bg-center min-h-screen">
      <Toaster />
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;
