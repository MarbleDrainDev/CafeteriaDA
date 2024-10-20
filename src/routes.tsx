import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage'; 

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" component={LoginPage} />
          {/* Agrega más rutas según sea necesario */}
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;