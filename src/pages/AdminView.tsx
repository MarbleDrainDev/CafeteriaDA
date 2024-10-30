import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminViewProps {
  onLogout: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/src/assets/images/admin-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div
        className="relative flex flex-col items-center justify-center p-10 rounded-lg"
        style={{
          width: '500px',
          height: '600px',
        }}
      >
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            backgroundImage: "url('/src/assets/images/admin-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)',
            zIndex: 0,
          }}
        ></div>
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Bree Serif' }}>THE WILD CUP</h1>
          <h3 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h3>
          <hr className="w-3/4 border-t-2 border-white mb-6" />
          <div className="grid grid-cols-2 gap-6">
            <button
              className="text-white flex flex-col items-center mb-6 hover:text-gray-300 hover:scale-105 transition-transform duration-200"
              onClick={() => navigate('/productos')}
            >
              <img src="/src/assets/images/productos.svg" alt="Productos" className="w-8 h-8 mb-2" />
              Productos
            </button>
            <button className="text-white flex flex-col items-center mb-6 hover:text-gray-300 hover:scale-105 transition-transform duration-200">
              <img src="/src/assets/images/monitoring.svg" alt="Métricas" className="w-8 h-8 mb-2" />
              Métricas
            </button>
            <button className="text-white flex flex-col items-center mb-6 col-span-2 hover:text-gray-300 hover:scale-105 transition-transform duration-200">
              <img src="/src/assets/images/newspaper.svg" alt="NewsPaper" className='w-8 h-8 mb-2' />
              Noticias
            </button>
            <button 
              className="text-white flex flex-col items-center mb-6 hover:text-gray-300 hover:scale-105 transition-transform duration-200"
              onClick={() => navigate('/admin/roles')}>
              <img src="/src/assets/images/roles.svg" alt="Roles" className="w-8 h-8 mb-2" />
              Gestión de Roles
            </button>
            <button 
              className="text-white flex flex-col items-center mb-6 hover:text-gray-300 hover:scale-105 transition-transform duration-200"
              onClick={() => navigate('/admin/sedes')}>
              <img src="/src/assets/images/sedes.svg" alt="Sedes" className="w-8 h-8 mb-2" />
              Gestión por Sedes
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminView;