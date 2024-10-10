import React from 'react';

interface CajeroViewProps {
  onLogout: () => void;
}

const CajeroView: React.FC<CajeroViewProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-orange-500 mb-4">Hola Cajero</h1>
      <button
        onClick={onLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default CajeroView;