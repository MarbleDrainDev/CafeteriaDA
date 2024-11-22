import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MeseroViewProps {
  onLogout: () => void;
  idMesero: number;
}

const MeseroView: React.FC<MeseroViewProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/src/assets/images/CafeteriaInterior.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div
        className="relative flex flex-col items-center justify-center rounded-lg group"
        style={{ width: '400px', height: '600px' }}
      >
        <div
          className="absolute inset-0 rounded-lg transition-shadow group-hover:shadow-[0_0_30px_rgba(255,255,255,0.7)]"
          style={{
            background: 'linear-gradient(135deg, #e0d4b0 0%, #d9d9d9 100%)',
            //filter: 'blur(2px)',
            zIndex: 0,
          }}
        ></div>
        <div className="relative z-10 flex flex-col items-center w-full">
          <h1 className="text-5xl font-bold text-black mb-6" style={{ fontFamily: 'Bree Serif' }}>THE WILD CUP</h1>
          <h3 className="text-3xl font-bold text-black mb-6">Mesero</h3>
          <hr className="w-3/4 border-t-2 border-black mb-6" />
          <div
            className="grid gap-6 w-full"
            // className="grid gap-6 rounded w-full"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          >
            <button
              onClick={() => navigate('/mesero/mesas')}
              className="text-white px-4 py-2 rounded transition-transform hover:scale-105"
              style={{ backgroundColor: 'transparent' }}
            >
              Mesas
            </button>
            <button
              onClick={() => navigate('/mesero/productos')}
              className="text-white px-4 py-2 rounded transition-transform hover:scale-105"
              style={{ backgroundColor: 'transparent' }}
            >
              Productos
            </button>
          </div>
          <p className="text-black mt-9 uppercase">"DONDE EL CAFE RUGE CON SABOR"</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-4"
      >
        Logout
      </button>
    </div>
  );
};

export default MeseroView;