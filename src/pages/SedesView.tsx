import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Sede {
    id: number;
    nombre: string;
    direccion: string;
}

const SedesView: React.FC = () => {
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [nombre, setNombre] = useState<string>('');
    const [direccion, setDireccion] = useState<string>('');
    const [editingSedeId, setEditingSedeId] = useState<number | null>(null);
    const navigate = useNavigate();

    const fetchSedes = async () => {
        try {
            const response = await axios.get<Sede[]>('https://localhost:7096/api/Cafeteria/Sedes');
            setSedes(response.data);
        } catch (error) {
            console.error('Error fetching sedes:', error);
        }
    };

    const handleAddSede = async () => {
        if (!nombre || !direccion) return;

        try {
            const newSede = { nombre, direccion };
            await axios.post('https://localhost:7096/api/Cafeteria/Sedes', newSede);
            fetchSedes(); // Refetch sedes after adding
            setNombre('');
            setDireccion('');
        } catch (error) {
            console.error('Error adding sede:', error);
        }
    };

    const handleEditSede = (sede: Sede) => {
        setEditingSedeId(sede.id);
        setNombre(sede.nombre);
        setDireccion(sede.direccion);
    };

    const handleUpdateSede = async () => {
        if (editingSedeId === null || !nombre || !direccion) return;

        try {
            const updatedSede = { nombre, direccion };
            await axios.put(`https://localhost:7096/api/Cafeteria/Sedes/${editingSedeId}`, updatedSede);
            fetchSedes(); // Refetch sedes after updating
            setNombre('');
            setDireccion('');
            setEditingSedeId(null);
        } catch (error) {
            console.error('Error updating sede:', error);
        }
    };

    const handleDeleteSede = async (id: number) => {
        // Mostrar un mensaje de confirmación
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta sede?");
        
        if (confirmDelete) {
            try {
                await axios.delete(`https://localhost:7096/api/Cafeteria/Sedes/${id}`);
                fetchSedes(); // Refetch sedes after deleting
            } catch (error) {
                console.error('Error deleting sede:', error);
            }
        }
    };

    useEffect(() => {
        fetchSedes();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Gestión de Sedes</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="border rounded p-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Dirección"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="border rounded p-2 mr-2"
                />
                {editingSedeId ? (
                    <button onClick={handleUpdateSede} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Actualizar Sede
                    </button>
                ) : (
                    <button onClick={handleAddSede} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Agregar Sede
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
                {sedes.length > 0 ? (
                    sedes.map((sede) => (
                        <div key={sede.id} className="p-4 border rounded shadow flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{sede.nombre}</h3>
                                <p>{sede.direccion}</p>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleEditSede(sede)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDeleteSede(sede.id)}
                                    className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No se encontraron sedes.</p>
                )}
            </div>
            <button
                onClick={() => navigate(-1)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
            >
                Regresar
            </button>
        </div>
    );
};

export default SedesView;
