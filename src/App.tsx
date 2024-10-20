  import React, { useState } from 'react';
  import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
  import LoginPage from './pages/LoginPage';
  import AdminView from './pages/AdminView';
  import CajeroView from './pages/CajeroView';
  import MeseroView from './pages/MeseroView';
  import ProductList from './pages/ProductList';
  import MeseroProductList from './pages/MeseroProductList'; 
  import MesasView from './pages/MesasView';

  function App() {
    const [user, setUser] = useState<{ username: string; rol: number, sedeId?: number } | null>(null); // Agregar sedeId

    const handleLogin = (token: string, rol: number, sedeId: number) => {
      if (rol === 1) {
        setUser({ username: 'Admin', rol });
      } else if (rol === 2) {
        setUser({ username: 'Mesero', rol, sedeId });
        localStorage.setItem("sedeId", sedeId.toString()); // Almacena el sedeId en localStorage
      } else if (rol === 3) {
        setUser({ username: 'Cajero', rol });
      } else {
        alert('Acceso no autorizado o Usuario incorrecto');
      }
    };
    
    
    

    const handleLogout = () => {
      setUser(null);
    };

    return (
      <Router>
        <Routes>
          {!user ? (
            <Route path="/" element={<LoginPage onLoginSuccess={handleLogin} />} />
          ) : (
            <>
              {user.rol === 1 && ( // Admin
                <Route path="/" element={<AdminView onLogout={handleLogout} />} />
              )}
              {user.rol === 2 && (
                  <>
                      <Route path="/" element={<MeseroView onLogout={handleLogout} />} />
                      <Route path="/mesero/productos" element={<MeseroProductList sedeId={user.sedeId!} />} />
                      <Route path="/mesero/mesas" element={<MesasView sedeId={user.sedeId!} />} /> {/* Pasar sedeId como prop */}
                  </>
              )}
              {user.rol === 3 && ( // Cajero
                <Route path="/" element={<CajeroView onLogout={handleLogout} />} />
              )}
              <Route path="/productos" element={<ProductList />} />
              <Route path="/mesas" element={<MesasView sedeId={user.sedeId!} />} /> {/* Pasar sedeId */}
            </>
          )}
        </Routes>
      </Router>
    );
  }

  export default App;