import React from 'react';

interface ProductItemProps {
  name: string;
  price: string;
  description: string;
  stock: number;
  hideEditDeleteButtons?: boolean;
  onDelete: () => void;
  onEdit: () => void; // Agrega la función onEdit
  onAdd: () => void;
}
  
const ProductItem: React.FC<ProductItemProps> = ({ name, price, description, stock, hideEditDeleteButtons, onDelete, onEdit, onAdd }) => {
  return (
    <li className="flex items-center p-6 mb-4 bg-gray-700 rounded-lg">
      <div className="w-16 h-16 bg-green-500 rounded-lg mr-4"></div>
      <div className="flex-1">
        <p className="text-lg font-bold">{name}</p>
        <p className="text-sm">{price}</p>
        <p className="text-sm">{description}</p>
      </div>
      <div className="w-24 text-center">
        <p className="font-bold">Stock: {stock}</p>
      </div>
      {!hideEditDeleteButtons && (
        <div className="flex space-x-2">
          <button className="text-white" onClick={onEdit}>
            <img src="./src/assets/images/lapiz.png" alt="Editar" className="w-7 h-7" />
          </button>
          {/* <button className="text-red-500"> */}
          <button className="text-red-500" onClick={onDelete}>
            <img src="./src/assets/images/papelera-de-reciclaje.png" alt="Eliminar" className="w-8 h-8" />
          </button>
        </div>
      )}
      <button className="text-green-500" onClick={onAdd}>
        <img src="./src/assets/images/anadir-al-carrito.png" alt="Añadir al carrito" className="w-8 h-8" />
      </button>
    </li>
  );
};

export default ProductItem;
