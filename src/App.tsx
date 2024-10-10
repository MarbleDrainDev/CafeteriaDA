import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import AdminView from './pages/AdminView';
import CajeroView from './pages/CajeroView';
import MeseroView from './pages/MeseroView';

function App() {
  const [user, setUser] = useState<string | null>(null);

  const handleLogin = (username: string) => {
    if (['Admin', 'Cajero', 'Mesero'].includes(username)) {
      setUser(username);
    } else {
      alert('Acceso no autorizado o Usuario incorrecto');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {user === 'Admin' && <AdminView onLogout={handleLogout} />}
      {user === 'Cajero' && <CajeroView onLogout={handleLogout} />}
      {user === 'Mesero' && <MeseroView onLogout={handleLogout} />}
    </div>
  );
}

export default App;