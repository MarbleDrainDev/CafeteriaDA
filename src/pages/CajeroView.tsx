import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';

interface CajeroViewProps {
    onLogout: () => void;
    idMesero: number;
  }
interface Mesa {
    id: number;
    numero_mesa: number;
    estado: string;
}

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
}

interface DetallePedido {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

interface Pedido {
    id: number | null;
    id_mesero: number;
    id_cajero: number;
    id_mesa: number;
    estado: string;
    total: number;
    detalles: DetallePedido[];
}


const MesasView: React.FC<CajeroViewProps> = ({ onLogout }) => {
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [pedidoActual, setPedidoActual] = useState<Pedido | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMesaId, setSelectedMesaId] = useState<number | null>(null);
    const navigate = useNavigate();
    const sedeId = Number(localStorage.getItem("sedeId"));
    const meseroId = parseInt(localStorage.getItem("meseroId") || "0", 10);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://192.168.1.2:7096/mesahub")
            .build();

        connection.on("mesasActualizadas", (nuevasMesas: Mesa[]) => {
            setMesas(nuevasMesas);
        });

        connection.start()
            .then(() => console.log("Conexión a SignalR establecida"))
            .catch(err => console.error("Error al conectar con SignalR", err));

        return () => {
            connection.stop()
                .then(() => console.log("Conexión detenida"))
                .catch(err => console.error("Error al detener SignalR", err));
        };
    }, []);

    useEffect(() => {
        if (!isNaN(sedeId) && sedeId > 0) {
            fetchMesas();
        } else {
            console.error("sedeId no es válido");
        }
    }, [sedeId]);

    const fetchMesas = async () => {
        try {
            const response = await axios.get(`https://192.168.1.2:7096/api/Mesa?sedeId=${sedeId}`);
            setMesas(response.data);
        } catch (error) {
            console.error("Error al obtener las mesas", error);
        }
    };

    const fetchProductos = async () => {
        try {
            const response = await axios.get(`https://192.168.1.2:7096/api/Producto/sede/${sedeId}`);
            setProductos(response.data);
        } catch (error) {
            console.error("Error al obtener los productos", error);
        }
    };

    const fetchPedidoMesa = async (mesaId: number) => {
        try {
            const response = await axios.get(`https://192.168.1.2:7096/api/Mesa/${mesaId}/pedido`);
            const { pedido, detalles } = response.data;
            const pedidoCompleto = { ...pedido, detalles };
            setPedidoActual(pedidoCompleto);
        } catch (error) {
            console.error("Error al obtener el pedido", error);
        }
    };
    

    const handleMesaClick = async (mesa: Mesa) => {
        setSelectedMesaId(mesa.id);
        await fetchProductos();

        if (mesa.estado === 'Ocupada') {
            await fetchPedidoMesa(mesa.id);
        } else {
            setPedidoActual({
                id: null,
                id_mesero: meseroId,
                id_cajero: 0,
                id_mesa: mesa.id,
                estado: 'Abierto',
                total: 0,
                detalles: []
            });
        }
        setIsModalOpen(true);
    };

    const agregarProductoPedido = (producto: Producto) => {
        if (pedidoActual) {
            const productoExistente = pedidoActual.detalles.find(detalle => detalle.id_producto === producto.id);
            let nuevosDetalles;
            if (productoExistente) {
                nuevosDetalles = pedidoActual.detalles.map(detalle =>
                    detalle.id_producto === producto.id
                        ? { ...detalle, cantidad: detalle.cantidad + 1, subtotal: (detalle.cantidad + 1) * producto.precio }
                        : detalle
                );
            } else {
                nuevosDetalles = [...pedidoActual.detalles, {
                    id_producto: producto.id,
                    cantidad: 1,
                    precio_unitario: producto.precio,
                    subtotal: producto.precio
                }];
            }
            const nuevoTotal = nuevosDetalles.reduce((acc, detalle) => acc + detalle.subtotal, 0);
            setPedidoActual({
                ...pedidoActual,
                detalles: nuevosDetalles,
                total: nuevoTotal
            });
        }
    };

    const guardarPedido = async () => {
        if (pedidoActual && selectedMesaId) {
            if (!pedidoActual.id_mesero || pedidoActual.id_mesero <= 0) {
                alert("Por favor, selecciona un mesero válido.");
                return;
            }
            try {
                if (pedidoActual.id) {
                    await axios.put(`https://192.168.1.2:7096/api/mesa/${selectedMesaId}/actualizar`, {
                        IdMesero: pedidoActual.id_mesero,
                        IdCajero: pedidoActual.id_cajero,
                        Detalles: pedidoActual.detalles.map(detalle => ({
                            IdProducto: detalle.id_producto,
                            Cantidad: detalle.cantidad,
                            PrecioUnitario: detalle.precio_unitario
                        }))
                    });
                    alert("Pedido actualizado exitosamente");
                } else {
                    await axios.post('https://192.168.1.2:7096/api/mesa/pedido', {
                        IdMesero: pedidoActual.id_mesero,
                        IdCajero: pedidoActual.id_cajero,
                        IdMesa: pedidoActual.id_mesa,
                        Detalles: pedidoActual.detalles.map(detalle => ({
                            IdProducto: detalle.id_producto,
                            Cantidad: detalle.cantidad,
                            PrecioUnitario: detalle.precio_unitario
                        }))
                    });
                    alert("Pedido guardado exitosamente");
                }
                closeModal();
            } catch (error) {
                console.error("Error al guardar el pedido", error);
                alert("Ocurrió un error al guardar el pedido. Por favor, intenta nuevamente.");
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMesaId(null);
        setPedidoActual(null);
    };

    // Función para manejar la generación de la factura
    const generarFactura = async () => {
      if (pedidoActual) {
          try {
              const response = await axios.post(`https://192.168.1.2:7096/api/Mesa/${pedidoActual.id}/generarFactura`, {}, { responseType: 'blob' });
              const blob = new Blob([response.data], { type: 'application/txt' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `Factura_Pedido_${pedidoActual.id}.txt`;
              link.click();
              alert("Factura generada y descargada exitosamente.");
          } catch (error) {
              console.error("Error al generar la factura", error);
              alert("Error al generar la factura.");
          }
      } else {
          alert("No hay pedido para generar factura.");
      }
  };
  

    return (
        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-white">Mesas de la Sede {sedeId}</h2>
            <div className="flex flex-wrap gap-4">
            {mesas.length > 0 ? (
                mesas.map((mesa) => (
                <div
                    key={mesa.id}
                    className={`p-4 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105 ${mesa.estado === 'Ocupada' ? 'bg-red-600' : 'bg-green-600'} text-white`}
                    onClick={() => handleMesaClick(mesa)}
                >
                    <p className="text-lg font-semibold">Mesa {mesa.numero_mesa}</p>
                    <p>{mesa.estado}</p>
                </div>
                ))
            ) : (
                <p className="text-white">No se encontraron mesas.</p>
            )}
            <button
                onClick={onLogout}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300"
            >
                Regresar
            </button>
            </div>

            {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full relative">
                <h2 className="text-2xl font-bold mb-4">Mesa {selectedMesaId}</h2>
                <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-300">X</button>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <h3 className="font-bold mb-2">Menú</h3>
                    <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
                        {productos.length > 0 ? (
                        productos.map((producto) => (
                            <div key={producto.id} className="p-4 border rounded shadow hover:bg-gray-100 transition-colors duration-300">
                            <h3 className="font-bold">{producto.nombre}</h3>
                            <p>Precio: ${producto.precio.toFixed(2)}</p>
                            <p>{producto.descripcion}</p>
                            
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
                                onClick={() => agregarProductoPedido(producto)}
                            >
                                Agregar
                            </button>
                            </div>
                        ))
                        ) : (
                        <p>No hay productos disponibles.</p>
                        )}
                    </div>
                    </div>
                    <div>
                    <h3 className="font-bold mb-2">Pedido</h3>
                    <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
                        {pedidoActual && pedidoActual.detalles.length > 0 ? (
                        pedidoActual.detalles.map((detalle, index) => (
                            <div key={index} className="p-4 border rounded shadow hover:bg-gray-100 transition-colors duration-300">
                            <p>Producto ID: {detalle.id_producto}</p>
                            <p>Cantidad: {detalle.cantidad}</p>
                            <p>Subtotal: ${detalle.subtotal.toFixed(2)}</p>
                            </div>
                        ))
                        ) : (
                        <p>No hay productos en el pedido.</p>
                        )}
                    </div>
                    {pedidoActual && (
                        <p className="mt-4 font-bold">
                        Total: ${pedidoActual.total.toFixed(2)}
                        </p>
                    )}
                    </div>
                </div>

                <div className="mt-4 flex justify-between">
                    <button
                    onClick={guardarPedido}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors duration-300"
                    >
                    Guardar Pedido
                    </button>
                    <button
                    onClick={generarFactura}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors duration-300 ml-4"
                    >
                    Generar Factura
                    </button>

                    <button
                    onClick={closeModal}
                    className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
                    >
                    Cerrar
                    </button>
                </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default MesasView;
