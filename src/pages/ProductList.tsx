import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductItem from './ProductItem';
import axios from 'axios';

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    sedeId: number;
}

interface Mesa {
    id: number;
    numero_mesa: number;
    estado: string;
}

const ProductList: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [newProduct, setNewProduct] = useState({ id: 0, nombre: '', precio: '', descripcion: '', stock: 0, sedeId: 0 });
    const [showModal, setShowModal] = useState(false);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false); // Determina si es agregar o editar
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [selectedMesaId, setSelectedMesaId] = useState<number | null>(null);
    const [cantidad, setCantidad] = useState(1);
    const [detalles, setDetalles] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    // Submit para agregar o actualizar
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                // Si es modo edición, usa PATCH para actualizar el producto
                await axios.put(`https://192.168.1.2:7096/api/Producto/${newProduct.id}`, newProduct);
                console.log('Producto actualizado correctamente');
            } else {
                // Si es modo agregar, usa POST para crear un nuevo producto
                await axios.post('https://192.168.1.2:7096/api/Producto', newProduct);
                console.log('Producto agregado correctamente');
            }
            setShowModal(false);
            obtenerProductos(); // Actualiza la lista de productos
        } catch (error) {
            console.error('Error al guardar el producto:', error);
        }
    };

    // Para abrir el modal en modo edición
    const handleEdit = (product: Producto) => {
        setNewProduct(product); // Carga los datos del producto en el modal
        setIsEditMode(true);    // Asegúrate de que estás en modo edición
        setShowModal(true);
    };

    // Para abrir el modal en modo agregar
    const handleAddProduct = () => {
        setNewProduct({ id: 0, nombre: '', descripcion: '', precio: '', stock: 0, sedeId: 0 }); // Limpia los campos del producto
        setIsEditMode(false);   // Cambia al modo agregar
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`https://192.168.1.2:7096/api/Producto/${id}`);
            console.log('Producto eliminado correctamente');
            obtenerProductos(); // Actualiza la lista de productos
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    };

    const handleAddToCart = (product: Producto) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setSelectedMesaId(null);
        setCantidad(1);
        setDetalles('');
    };

    const handleConfirmAddToCart = async () => {
        if (!selectedProduct || !selectedMesaId) return;

        const detallePedido = {
            id_producto: selectedProduct.id,
            cantidad,
            precio_unitario: selectedProduct.precio,
            detalles,
        };

        try {
            const response = await axios.post(`https://192.168.1.2:7096/api/mesa/${selectedMesaId}/productos`, detallePedido);
    
            if (response.status === 200) {
                alert('Producto agregado al pedido.');
                closeModal();
            } else {
                alert(`Error: ${response.data}`);
            }
        } catch (error) {
            alert(`Error: ${error.response ? error.response.data : error.message}`);
        }
    };

    const filteredProducts = productos.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    async function obtenerProductos(): Promise<Producto[]> {
        try {
            const response = await axios.get<Producto[]>('https://192.168.1.2:7096/api/Producto');
            setProductos(response.data);
            console.log('Productos:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    }

    useEffect(() => {
        obtenerProductos();
    }, []);

    useEffect(() => {
        // Fetch mesas
        const fetchMesas = async () => {
            try {
                const response = await axios.get('https://192.168.1.2:7096/api/Mesa?sedeId=1'); // Cambia la URL según sea necesario
                setMesas(response.data);
            } catch (error) {
                console.error('Error al obtener las mesas:', error);
            }
        };

        fetchMesas();
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f1e6ca' }}>
            <header className="flex justify-between items-center mb-4 bg-black w-full p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Regresar
                </button>
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-2 border rounded flex-grow mx-2"
                />
                <button
                    onClick={handleAddProduct} // Usa esta función para agregar producto
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Agregar Producto
                </button>
            </header>

            {showModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-md w-96">
                        <h2 className="text-2xl font-bold mb-4">
                            {isEditMode ? 'Editar Producto' : 'Agregar Producto'}
                        </h2>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre"
                            value={newProduct.nombre}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <input
                            type="text"
                            name="descripcion"
                            placeholder="Descripción"
                            value={newProduct.descripcion}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <input
                            type="number"
                            name="precio"
                            placeholder="Precio"
                            value={newProduct.precio}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <input
                            type="number"
                            name="stock"
                            placeholder="Stock"
                            value={newProduct.stock}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <input
                            type="number"
                            name="sedeId"
                            placeholder="Sede ID"
                            value={newProduct.sedeId}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                {isEditMode ? 'Actualizar' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ul className="p-4 flex flex-col items-center">
                {filteredProducts.map((product, index) => (
                    <li key={index} className="w-full max-w-screen-lg mb-4">
                        <ProductItem
                            name={product.nombre}
                            price={product.precio.toString()}
                            description={product.descripcion}
                            stock={product.stock}
                            hideEditDeleteButtons={false}
                            onDelete={() => handleDelete(product.id)}
                            onEdit={() => handleEdit(product)} // Llama a la edición
                            onAdd={() => handleAddToCart(product)} // Llama a la función para añadir al carrito
                        />
                    </li>
                ))}
            </ul>

            {/* Modal */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Añadir {selectedProduct.nombre} al pedido</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mesa">
                                Mesa
                            </label>
                            <select
                                id="mesa"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={selectedMesaId || ''}
                                onChange={(e) => setSelectedMesaId(Number(e.target.value))}
                            >
                                <option value="" disabled>Selecciona una mesa</option>
                                {mesas.map((mesa) => (
                                    <option key={mesa.id} value={mesa.id}>
                                        Mesa {mesa.numero_mesa}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cantidad">
                                Cantidad
                            </label>
                            <input
                                id="cantidad"
                                type="number"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                                min="1"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="detalles">
                                Detalles
                            </label>
                            <textarea
                                id="detalles"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={detalles}
                                onChange={(e) => setDetalles(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={closeModal}
                                className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmAddToCart}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
