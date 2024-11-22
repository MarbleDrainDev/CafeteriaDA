import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
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
    detalle?: string;
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
const EstadoMesas = ({ ocupadas, disponibles }: { ocupadas: number, disponibles: number }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'white',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxWidth: '200px',
            wordWrap: 'break-word'
        }}>
            <p>Mesas ocupadas: {ocupadas}</p>
            <p>Mesas disponibles: {disponibles}</p>
        </div>
    );
};

const MesasView = () => {
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [pedidoActual, setPedidoActual] = useState<Pedido | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMesaId, setSelectedMesaId] = useState<number | null>(null);

    const [ocupadas, setOcupadas] = useState(0);
    const [disponibles, setDisponibles] = useState(0);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);


    const navigate = useNavigate();
    const sedeId = Number(localStorage.getItem("sedeId"));
    const meseroId = parseInt(localStorage.getItem("meseroId") || "1", 10); // Convertir a número y verificar si es válido
    const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
    const [detalleTexto, setDetalleTexto] = useState("");
    const [detalleIndex, setDetalleIndex] = useState<number | null>(null);
    
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

    //--Algoritmo de Busqueda Binaria----------------------------------------------------------
    useEffect(() => {
        if (searchTerm) {
            const productosOrdenados = productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
            const nombres = productosOrdenados.map(p => p.nombre.toLowerCase());
            const index = binarySearch(nombres, searchTerm.toLowerCase());
            if (index !== -1) {
                setFilteredProductos([productosOrdenados[index]]);
            } else {
                setFilteredProductos([]);
            }
        } else {
            setFilteredProductos(productos);
        }
    }, [searchTerm, productos]);

    const binarySearch = (arr: number[], target: number): number => {
        let left = 0;
        let right = arr.length - 1;
    
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid] === target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    
        return -1;
    };

    //--Algoritmo de Búsqueda en Profundidad (DFS)-------------------------------------------------

    const dfs = (graph: Record<number, number[]>, start: number): number[] => {
        const stack = [start];
        const visited: Set<number> = new Set();
        const result: number[] = [];
    
        while (stack.length > 0) {
            const node = stack.pop();
            if (node !== undefined && !visited.has(node)) {
                visited.add(node);
                result.push(node);
                const neighbors = graph[node];
                for (let i = neighbors.length - 1; i >= 0; i--) {
                    stack.push(neighbors[i]);
                }
            }
        }
    
        return result;
    };
    const contarEstadosMesas = () => {
        const graph: Record<number, number[]> = {};
        mesas.forEach(mesa => {
            graph[mesa.id] = mesas.filter(m => m.id !== mesa.id).map(m => m.id);
        });
    
        const recorrido = dfs(graph, mesas[0]?.id || 0);
        let ocupadas = 0;
        let disponibles = 0;
    
        recorrido.forEach(id => {
            const mesa = mesas.find(m => m.id === id);
            if (mesa?.estado === 'Ocupada') {
                ocupadas++;
            } else if (mesa?.estado === 'Disponible') {
                disponibles++;
            }
        });
    
        setOcupadas(ocupadas);
        setDisponibles(disponibles);
    };
    useEffect(() => {
        if (mesas.length > 0) {
            contarEstadosMesas();
        }
    }, [mesas]);
    

    // useEffect(() => {
    //     if (mesas.length > 0) {
    //         const ocupadas = mesas.filter(mesa => mesa.estado === 'Ocupada').length;
    //         const disponibles = mesas.filter(mesa => mesa.estado === 'Disponible').length;
    //         setOcupadas(ocupadas);
    //         setDisponibles(disponibles);
    //     }
    // }, [mesas]);

    //--------------------------------------------------------------------------------

    
    const openDetalleModal = (index: number) => {
        if (pedidoActual && pedidoActual.detalles && index >= 0 && index < pedidoActual.detalles.length) {
            setDetalleIndex(index);
            setDetalleTexto(pedidoActual.detalles[index]?.detalle || ""); // Cargar texto si ya existe
            setIsDetalleModalOpen(true);
        } else {
            console.error("Índice inválido o pedidoActual no está definido.");
        }
    };
    
    const closeDetalleModal = () => {
        setDetalleIndex(null);
        setDetalleTexto("");
        setIsDetalleModalOpen(false);
    };

    const guardarDetalle = () => {
        if (detalleIndex !== null && detalleTexto.trim() !== "" && pedidoActual && pedidoActual.detalles) {
            const updatedDetalles = [...pedidoActual.detalles];
            if (detalleIndex >= 0 && detalleIndex < updatedDetalles.length) {
                updatedDetalles[detalleIndex] = {
                    ...updatedDetalles[detalleIndex],
                    detalle: detalleTexto,
                };
    
                setPedidoActual({
                    ...pedidoActual,
                    detalles: updatedDetalles,
                } as Pedido); // Asegúrate de que el objeto cumple con el tipo Pedido
            } else {
                console.error("Índice de detalle inválido.");
            }
        } else {
            console.error("Datos inválidos para guardar el detalle.");
        }
        closeDetalleModal();
    };

    const actualizarStockProductos = async () => {
        if (!pedidoActual || !pedidoActual.detalles) {
            console.error("No hay detalles de pedido para actualizar el stock.");
            return;
        }
    
        try {
            const cambiosStock = pedidoActual.detalles.map((detalle) => {
                console.log(`Producto ID: ${detalle.id_producto}, Cantidad: ${detalle.cantidad}`);
                return {
                    IdProducto: detalle.id_producto,
                    Cantidad: detalle.cantidad,
                };
            });
    
            console.log("Datos enviados:", cambiosStock);
    
            await axios.post('https://192.168.1.2:7096/api/Producto/actualizar-stock', cambiosStock);
        } catch (error) {
            console.error("Error al actualizar el stock:", error);
            alert("No se pudo actualizar el stock de los productos.");
        }
    };
    const fetchMesas = async () => {
        try {
            const response = await axios.get(`https://192.168.1.2:7096/api/Mesa?sedeId=${sedeId}`);
            setMesas(response.data);
        } catch (error) {
            console.error("Error al obtener las mesas", error);
            alert("No se pudo obtener las mesas.");
        }
    };

    //---Algoritmo de ordenamiento----------------------------------------------------------------
    const quickSort = (arr: Producto[]): Producto[] => {
        if (arr.length <= 1) return arr;
        const pivot = arr[Math.floor(arr.length / 2)];
        const left = arr.filter(x => x.precio < pivot.precio);
        const right = arr.filter(x => x.precio > pivot.precio);
        return [...quickSort(left), pivot, ...quickSort(right)];
    };

    const fetchProductos = async () => {
        try {
            const response = await axios.get(`https://192.168.1.2:7096/api/Producto/sede/${sedeId}`);
            const sortedProductos = quickSort(response.data);
            setProductos(sortedProductos);
        } catch (error) {
            console.error("Error al obtener los productos:", error);
        }
    };

    // const fetchProductos = async () => {
    //     try {
    //         const response = await axios.get(`https://192.168.1.2:7096/api/Producto/sede/${sedeId}`);
    //         setProductos(response.data);
    //     } catch (error) {
    //         console.error("Error al obtener los productos", error);
    //         alert("No se pudo obtener los productos.");
    //     }
    // };

    //-------------------------------------------------------------------------------------------

    
    const fetchPedidoMesa = async (mesaId: number) => {
        try {
            const response = await axios.get(`https://192.168.1.2:7096/api/Mesa/${mesaId}/pedido`);
            const { pedido, detalles } = response.data; 
            const pedidoCompleto = { ...pedido, detalles };
            setPedidoActual(pedidoCompleto);
        } catch (error) {
            console.error("Error al obtener el pedido", error);
            // alert("No se pudo obtener el pedido de la mesa.");
        }
    };
    const handleMesaClick = async (mesa: Mesa) => {
        setSelectedMesaId(mesa.id);
        await fetchProductos(); // Asegúrate de esperar a que se obtengan los productos
    
        if (mesa.estado === 'Ocupada') {
            // Obtener el pedido de la mesa ocupada
            await fetchPedidoMesa(mesa.id); // Asegúrate de que esta función se ejecute completamente antes de abrir el modal
        } else {
            // Si está abierta, crear un nuevo pedido vacío
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
    useEffect(() => {
        const fetchData = async () => {
            if (isModalOpen && selectedMesaId) {
                await fetchPedidoMesa(selectedMesaId); // Asegúrate de que esta función se ejecute completamente
            }
        };
        fetchData();
    }, [isModalOpen, selectedMesaId]);
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
                const pedidoRequest = {
                    idMesero: pedidoActual.id_mesero,
                    idCajero: pedidoActual.id_cajero,
                    idMesa: selectedMesaId,
                    detalles: pedidoActual.detalles.map(detalle => ({
                        idProducto: detalle.id_producto,
                        cantidad: detalle.cantidad,
                        precioUnitario: detalle.precio_unitario,
                        detalles: detalle.detalle || "",
                    })),
                };
    
                if (pedidoActual.id) {
                    await axios.put(`https://192.168.1.2:7096/api/mesa/${selectedMesaId}/actualizar`, pedidoRequest);
                    alert("Pedido actualizado exitosamente");
                } else {
                    await axios.post('https://192.168.1.2:7096/api/mesa/pedido', pedidoRequest);
                    alert("Pedido guardado exitosamente");
                    // Actualizar el estado de la mesa a "Ocupada"
                    await actualizarEstadoMesa(selectedMesaId, "Ocupada");
                }
    
                // Actualizar el stock después de guardar el pedido
                await actualizarStockProductos();
                closeModal();
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error("Error message:", error.message);
                    console.error("Error response:", error.response?.data);
                } else {
                    console.error("Unexpected error:", error);
                }
                alert("Ocurrió un error al guardar el pedido. Por favor, intenta nuevamente.");
            }
        }
    };
    
    
     
    const eliminarProductoDetalle = async (idPedido: number, idProducto: number) => {
        console.log(`Intentando eliminar el producto con ID: ${idProducto} del pedido con ID: ${idPedido}`);
        try {
            // Realiza la solicitud DELETE al endpoint correspondiente
            await axios.delete(`https://192.168.1.2:7096/api/mesa/${idPedido}/detalle/${idProducto}`);    
            // Actualiza el pedido después de eliminar el producto
            if (pedidoActual) {
                const nuevosDetalles = pedidoActual.detalles.map(detalle => {
                    if (detalle.id_producto === idProducto) {
                        if (detalle.cantidad > 1) {
                            // Si la cantidad es mayor que 1, reduce la cantidad
                            return { 
                                ...detalle, 
                                cantidad: detalle.cantidad - 1, 
                                subtotal: (detalle.cantidad - 1) * detalle.precio_unitario 
                            };
                        } else {
                            // Si la cantidad es 1, no lo incluyas en nuevosDetalles
                            return null;
                        }
                    }
                    return detalle;
                }).filter(detalle => detalle !== null); // Elimina los productos que son null
    
                const nuevoTotal = nuevosDetalles.reduce((acc, detalle) => acc + detalle.subtotal, 0);
    
                if (nuevosDetalles.length === 0) {
                    // Si no hay más detalles, libera la mesa y elimina el pedido en el frontend
                    alert("El pedido ha quedado vacío y la mesa está ahora disponible.");
    
                    // Aquí puedes actualizar el estado de la mesa, si tienes la función para hacerlo
                    await actualizarEstadoMesa(pedidoActual.id_mesa, "Disponible");
                    
                    // Elimina el pedido del estado
                    setPedidoActual(null); 
                } else {
                    // Si aún hay detalles, actualiza el estado del pedido
                    setPedidoActual({
                        ...pedidoActual,
                        detalles: nuevosDetalles,
                        total: nuevoTotal
                    });
                }
            }
        } catch (error) {
            console.error("Error al eliminar el producto del pedido", error);
            if (axios.isAxiosError(error)) {
                alert("No se pudo eliminar el producto del pedido: " + error.response?.data.message || "Error desconocido.");
            } else {
                alert("Ocurrió un error al eliminar el producto del pedido.");
            }
        }
    };
    // Función para actualizar el estado de la mesa
    const actualizarEstadoMesa = async (idMesa: number, nuevoEstado: string) => {
        try {
            const response = await axios.put(`https://192.168.1.2:7096/api/mesa/${idMesa}/estado`, { estado: nuevoEstado });
            console.log(`Estado de la mesa ${idMesa} actualizado a "${nuevoEstado}"`);
            console.log('Respuesta del servidor:', response);
        } catch (error) {
            console.error("Error al actualizar el estado de la mesa", error);
            alert("No se pudo actualizar el estado de la mesa.");
        }
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMesaId(null);
        setPedidoActual(null);
    };
    return (
        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-white">Mesas de la Sede {sedeId}</h2>
            <div className="flex flex-wrap gap-4">
            {mesas.length > 0 ? (
                mesas.map((mesa) => (
                <div
                    key={mesa.id}
                    className={`p-4 rounded shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105 ${mesa.estado === 'Ocupada' ? 'bg-red-600' : 'bg-green-600'} text-white`}
                    onClick={() => handleMesaClick(mesa)}
                >
                    <p className="text-lg font-semibold">Mesa {mesa.numero_mesa}</p>
                    <p className="text-sm">{mesa.estado}</p>
                </div>
                ))
            ) : (
                <p className="text-white">No se encontraron mesas.</p>
            )}
            <button
                onClick={() => navigate(-1)}
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors duration-300"
            >
                Regresar
            </button>

            {/* <input
                type="text"
                placeholder="Buscar producto por nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-4 p-2 border rounded"
            />
            <div className="mt-4">
                {filteredProductos.length > 0 ? (
                    filteredProductos.map((producto) => (
                        <div key={producto.id} className="p-4 border rounded shadow">
                            <h3 className="font-bold">{producto.nombre}</h3>
                            <p>Precio: ${producto.precio.toFixed(2)}</p>
                            <p>{producto.descripcion}</p>
                            <button
                                className="mt-2 p-2 bg-blue-500 text-white rounded"
                                onClick={() => agregarProductoPedido(producto)}
                            >
                                Agregar al pedido
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No se encontraron productos.</p>
                )}
            </div> */}
            </div>

            <EstadoMesas ocupadas={ocupadas} disponibles={disponibles} />

            {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full relative">
                <h2 className="text-xl font-bold mb-4">Mesa {selectedMesaId}</h2>
                <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-300">X</button>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <h3 className="font-bold mb-2">Menú</h3>
                    {/* Algoritmo de busqueda Binaria */}
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-4 p-2 border rounded w-full"
                    />
                    <div className="flex flex-col gap-4 max-h-80 overflow-y-auto mt-4">
                        {filteredProductos.length > 0 ? (
                        filteredProductos.map((producto) => (
                            <div key={producto.id} className="p-4 border rounded shadow hover:bg-gray-100 transition-colors duration-300">
                            <h3 className="font-bold">{producto.nombre}</h3>
                            <p>Precio: ${producto.precio.toFixed(2)}</p>
                            <p>{producto.descripcion}</p>
                            <button
                                className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
                                onClick={() => agregarProductoPedido(producto)}
                            >
                                Agregar al pedido
                            </button>
                            </div>
                        ))
                        ) : (
                        <p>No se encontraron productos.</p>
                        )}
                    </div>
                    {/* <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
                                    {productos.length > 0 ? (
                                        productos.map((producto) => (
                                            <div key={producto.id} className="p-4 border rounded shadow">
                                                <h3 className="font-bold">{producto.nombre}</h3>
                                                <p>Precio: ${producto.precio.toFixed(2)}</p>
                                                <p>{producto.descripcion}</p>
                                                <button
                                                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                                                    onClick={() => agregarProductoPedido(producto)}
                                                >
                                                    Agregar al pedido
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No se encontraron productos para esta sede.</p>
                                    )}
                                </div> */}
                    </div>
                    <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
                    {pedidoActual ? (
                        pedidoActual.detalles.length > 0 ? (
                        pedidoActual.detalles.map((detalle, index) => (
                            <div key={index} className="p-4 border rounded shadow hover:bg-gray-100 transition-colors duration-300">
                            <p>Producto ID: {detalle.id_producto}</p>
                            <p>Cantidad: {detalle.cantidad}</p>
                            <p>Subtotal: ${detalle.subtotal.toFixed(2)}</p>
                            <button
                                className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
                                onClick={() => {
                                // Primero, eliminamos el producto de la lista local
                                const nuevosDetalles = pedidoActual.detalles.filter(item => item.id_producto !== detalle.id_producto);
                                const nuevoTotal = nuevosDetalles.reduce((acc, item) => acc + item.subtotal, 0);
                                
                                setPedidoActual({
                                    ...pedidoActual,
                                    detalles: nuevosDetalles,
                                    total: nuevoTotal
                                });

                                // Luego, verificamos si hay un pedido y lo eliminamos de la base de datos si es necesario
                                if (pedidoActual && pedidoActual.id) {
                                    eliminarProductoDetalle(pedidoActual.id, detalle.id_producto)
                                    .catch((error) => {
                                        console.error("Error al eliminar el producto de la base de datos:", error);
                                        alert("No se pudo eliminar el producto de la base de datos.");
                                    });
                                } else {
                                    alert("El producto se ha eliminado de la lista. No se había registrado en un pedido.");
                                }
                                }}
                            >
                                Eliminar
                            </button>

                            <button
                                className="mt-2 ml-2 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors duration-300"
                                onClick={() => openDetalleModal(index)}
                            >
                                Agregar Detalles
                            </button>

                            </div>
                        ))
                        ) : (
                        <p>No hay productos en el pedido.</p>
                        )
                    ) : (
                        <p>No hay un pedido abierto.</p>
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
                    onClick={closeModal}
                    className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
                    >
                    Cerrar
                    </button>
                </div>
                </div>
            </div>
            )}
            {isDetalleModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
                <h3 className="text-xl font-bold mb-4">Agregar Detalles</h3>
                <textarea
                    className="w-full p-2 border rounded mb-4"
                    rows="5"
                    placeholder="Escribe los detalles del producto aquí..."
                    value={detalleTexto}
                    onChange={(e) => setDetalleTexto(e.target.value)}
                />
                <div className="flex justify-end gap-4">
                    <button
                    onClick={guardarDetalle}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
                    >
                    Guardar
                    </button>
                    <button
                    onClick={closeDetalleModal}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-300"
                    >
                    Cancelar
                    </button>
                </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default MesasView;