import React from 'react';

interface MeseroViewProps {
  onLogout: () => void;
}

const MeseroView: React.FC<MeseroViewProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-green-500 mb-4">Hola Mesero</h1>
      <button
        onClick={onLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default MeseroView;