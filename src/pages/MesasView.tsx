import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';

// Define la interfaz para Mesa
interface Mesa {
    id: number;
    numero_mesa: number;
    estado: string;
}

// Define la interfaz para Producto
interface Producto {
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
}

const MesasView = () => {
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMesaId, setSelectedMesaId] = useState<number | null>(null);
    const navigate = useNavigate(); // Inicializar useNavigate

    // Obtener el sedeId del localStorage y convertir a número
    const sedeId = Number(localStorage.getItem("sedeId")); // Convertir a número

    // Conectar al servidor SignalR
    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://192.168.1.2:7096/mesahub")
            .build();

        connection.on("mesasActualizadas", (nuevasMesas: Mesa[]) => {
            console.log("Mesas actualizadas recibidas:", nuevasMesas);
            setMesas(nuevasMesas);
        });

        connection.start().then(() => console.log("Conexión a SignalR establecida")).catch(err => console.error("Error al conectar con SignalR", err.toString()));

        return () => {
            connection.stop()
            .then(() => console.log("Conexión a SignalR detenida"))
            .catch(err => console.error("Error al detener la conexión a SignalR:", err.toString()));
        };
    }, []);

    // Asegúrate de que el sedeId sea válido antes de hacer la petición
    useEffect(() => {
        if (isNaN(sedeId) || sedeId <= 0) {
            console.error("sedeId no es válido");
            return;
        }
        fetchMesas();
    }, [sedeId]);

    // Función para obtener las mesas de una sede
    const fetchMesas = async () => {
        try {
            const response = await axios.get(`https://192.168.1.2:7096/api/Mesa?sedeId=${sedeId}`);
            setMesas(response.data);
        } catch (error) {
            console.error("Error al obtener las mesas", error);
        }
    };

    // Función para obtener los productos de la sede
    const fetchProductos = async () => {
        try {
            const response = await axios.get(`https://192.168.1.2:7096/api/Producto/sede/${sedeId}`);
            setProductos(response.data);
        } catch (error) {
            console.error("Error al obtener los productos", error);
        }
    };

    // Función para manejar el click en una mesa
    const handleMesaClick = (mesa: Mesa) => {
        if (mesa.estado === 'Ocupada') {
            navigate(`/mesero/productos/${mesa.id}`);
        } else {
            setSelectedMesaId(mesa.id); // Establecer ID de la mesa seleccionada
            fetchProductos(); // Cargar productos al abrir el modal
            setIsModalOpen(true); // Abrir el modal
        }
    };

    // Función para cerrar el modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMesaId(null); // Limpiar el ID de la mesa seleccionada
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Mesas de la Sede {sedeId}</h2>
            <div className="flex flex-wrap gap-4">
                {mesas.length > 0 ? (
                    mesas.map((mesa) => (
                        <div
                            key={mesa.id}
                            className={`p-4 rounded shadow cursor-pointer ${mesa.estado === 'Ocupada' ? 'bg-red-500' : 'bg-green-500'} text-white`}
                            onClick={() => handleMesaClick(mesa)}
                        >
                            <p>Mesa {mesa.numero_mesa}</p>
                            <p>{mesa.estado}</p>
                        </div>
                    ))
                ) : (
                    <p>No se encontraron mesas.</p>
                )}
            </div>

            {/* Modal para el menú */}

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Menú para la Mesa {selectedMesaId}</h2>
                        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500">X</button>
                        {/* Contenedor para los productos con scroll */}
                        <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
                            {productos.length > 0 ? (
                                productos.map((producto) => (
                                    <div key={producto.id} className="p-4 border rounded shadow">
                                        <h3 className="font-bold">{producto.nombre}</h3>
                                        <p>Precio: ${producto.precio.toFixed(2)}</p>
                                        <p>{producto.descripcion}</p>
                                        <button className="text-green-500">
                                            <img src="./src/assets/images/anadir-al-carrito.png" alt="Añadir al carrito" className="w-8 h-8" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No se encontraron productos para esta sede.</p>
                            )}
                        </div>
                        <button onClick={closeModal} className="mt-4 p-2 bg-blue-500 text-white rounded">Cerrar</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MesasView;