import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import {Plus, Edit, Trash} from 'lucide-react';


interface Role {
    id: number;
    nombre: string;
}

interface Sede {
    id: number;
    nombre: string;
}

interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rolId: number;
    sedeId: number;
}

const RolesView = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [newRole, setNewRole] = useState<string>('');
    const [editRoleName, setEditRoleName] = useState<string>('');
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [newUser, setNewUser] = useState<{ nombre: string, email: string, password: string, rolId: number, sedeId: number }>({
        nombre: '',
        email: '',
        password: '',
        rolId: 0,
        sedeId: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchRoles();
        fetchUsuarios();
        fetchSedes();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await axios.get('https://localhost:7096/api/cafeteria/roles');
            setRoles(response.data);
        } catch (error) {
            console.error("Error al obtener roles", error);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get('https://localhost:7096/api/cafeteria/usuarios');
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al obtener usuarios", error);
        }
    };

    const fetchSedes = async () => {
        try {
            const response = await axios.get('https://localhost:7096/api/cafeteria/sedes');
            setSedes(response.data);
        } catch (error) {
            console.error("Error al obtener sedes", error);
        }
    };

    const handleAddRole = async () => {
        if (!newRole) {
            alert("Por favor, ingresa un nombre de rol.");
            return;
        }

        try {
            await axios.post('https://localhost:7096/api/cafeteria/roles', { nombre: newRole });
            setNewRole('');
            fetchRoles();
            alert("Rol agregado exitosamente.");
        } catch (error) {
            console.error("Error al agregar rol", error);
            alert("Ocurrió un error al agregar el rol.");
        }
    };
    const handleRegisterUser = async () => {
        const { nombre, email, password, rolId, sedeId } = newUser;
    
        // Verificar que los campos necesarios no estén vacíos
        if (!nombre || !email || !password || rolId === 0) {
            alert("Por favor, completa todos los campos.");
            return;
        }
    
        try {
            await axios.post('https://localhost:7096/api/Login/register', {
                nombre,
                email,
                password,
                rol_id: rolId,
                sede_id: rolId === 1 ? null : sedeId // Asignar null si es administrador (rolId = 1)
            });
            setNewUser({ nombre: '', email: '', password: '', rolId: 0, sedeId: 0 });
            fetchUsuarios();
            alert("Usuario registrado exitosamente.");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al registrar usuario:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado:", error);
            }
            alert("Ocurrió un error al registrar el usuario.");
        }
    };
    
    

    const handleEditUser = (usuario: Usuario) => {
        setEditingUser(usuario);
        setNewUser({ nombre: usuario.nombre, email: usuario.email, password: '', rolId: usuario.rolId, sedeId: usuario.sedeId });
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
    
        const { nombre, email, password, rolId, sedeId } = newUser;
    
        // Verifica que todos los campos requeridos estén presentes
        if (!nombre || !email || rolId === 0) {
            alert("Por favor, completa todos los campos.");
            return;
        }
    
        try {
            await axios.put(`https://localhost:7096/api/Login/${editingUser.id}`, {
                id: editingUser.id, // Asegúrate de enviar el ID del usuario que se está editando
                nombre,
                email,
                password,
                rol_id: rolId, // Cambiado de rolId a rol_id
                sede_id: sedeId === 0 ? 0 : sedeId // Enviar 0 si no hay sede seleccionada
            });
            
            fetchUsuarios(); // Refrescar la lista de usuarios
            setEditingUser(null); // Limpiar el estado de edición
            setNewUser({ nombre: '', email: '', password: '', rolId: 0, sedeId: 0 }); // Resetear formulario
            alert("Usuario actualizado exitosamente.");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al actualizar usuario:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado:", error);
            }
            alert("Ocurrió un error al actualizar el usuario.");
        }
    };
    

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            try {
                await axios.delete(`https://localhost:7096/api/Login/${userId}`);
                fetchUsuarios();
                alert("Usuario eliminado exitosamente.");
            } catch (error) {
                console.error("Error al eliminar usuario", error);
                alert("Ocurrió un error al eliminar el usuario.");
            }
        }
    };

    const handleDeleteRole = async (roleId: number) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este rol?")) {
            try {
                await axios.delete(`https://localhost:7096/api/cafeteria/roles/${roleId}`);
                fetchRoles();
                alert("Rol eliminado exitosamente.");
            } catch (error) {
                console.error("Error al eliminar rol", error);
                alert("Ocurrió un error al eliminar el rol.");
            }
        }
    };

    const handleEditRole = async (roleId: number) => {
        if (!editRoleName) {
            alert("Por favor, ingresa un nuevo nombre para el rol.");
            return;
        }

        try {
            await axios.put(`https://localhost:7096/api/cafeteria/roles/${roleId}`, { nombre: editRoleName });
            setEditRoleName('');
            fetchRoles();
            alert("Rol actualizado exitosamente.");
        } catch (error) {
            console.error("Error al actualizar rol", error);
            alert("Ocurrió un error al actualizar el rol.");
        }
    };

    const getRolNombre = (rolId: number): string => {
        const role = roles.find(r => r.id === rolId);
        return role ? role.nombre : 'Rol no asignado';
    };

    const getSedeNombre = (sedeId: number): string | undefined => {
        const sede = sedes.find(s => s.id === sedeId);
        return sede ? sede.nombre : undefined;
    };

    return (
        <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-300 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-blue-900">Gestión de Roles</h2>
            <div className="mb-6 flex items-center">
            <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Nombre del nuevo rol"
                className="border rounded p-2 mr-2 flex-grow"
            />
            <button
                onClick={handleAddRole}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
            >
            <Plus className="mr-2" /> Agregar Rol
            </button>
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
            {roles.length > 0 ? (
                roles.map((role) => (
                <div key={role.id} className="p-4 border rounded shadow bg-white w-64">
                    <h3 className="font-bold text-blue-800">{role.nombre}</h3>
                    <input
                    type="text"
                    placeholder="Nuevo nombre"
                    className="border rounded p-1 mr-2 mt-2 w-full"
                    onChange={(e) => setEditRoleName(e.target.value)}
                    />
                    <button
                    onClick={() => handleEditRole(role.id)}
                    className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full flex items-center justify-center"
                    >
                    <Edit className="mr-2" /> Editar
                    </button>
                    <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 w-full flex items-center justify-center"
                    >
                    <Trash className="mr-2" /> Eliminar
                    </button>
                </div>
                ))
            ) : (
                <p>No hay roles disponibles.</p>
            )}
            </div>

            <h2 className="text-3xl font-bold mb-6 text-blue-900">Gestión de Usuarios</h2>
            <div className="mb-6 flex flex-wrap items-center gap-2">
            <input
                type="text"
                value={newUser.nombre}
                onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                placeholder="Nombre"
                className="border rounded p-2 flex-grow"
            />
            <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Email"
                className="border rounded p-2 flex-grow"
            />
            <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Contraseña"
                className="border rounded p-2 flex-grow"
            />
            <select
                value={newUser.rolId}
                onChange={(e) => setNewUser({ ...newUser, rolId: Number(e.target.value) })}
                className="border rounded p-2 flex-grow"
            >
                <option value={0}>Selecciona un rol</option>
                {roles.map((role) => (
                <option key={role.id} value={role.id}>
                    {role.nombre}
                </option>
                ))}
            </select>
            {newUser.rolId !== 1 && (
                <select
                value={newUser.sedeId}
                onChange={(e) => setNewUser({ ...newUser, sedeId: Number(e.target.value) })}
                className="border rounded p-2 flex-grow"
                >
                <option value={0}>Selecciona una sede</option>
                {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                    </option>
                ))}
                </select>
            )}
            <button
                onClick={editingUser ? handleUpdateUser : handleRegisterUser}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
            >
                <i className={`lucide ${editingUser ? 'lucide-save' : 'lucide-user-plus'} mr-2`}></i>
                {editingUser ? 'Actualizar Usuario' : 'Registrar Usuario'}
            </button>
            </div>

            <div className="mb-6">
            {usuarios.length > 0 ? (
                <table className="table-auto w-full bg-white rounded shadow">
                <thead className="bg-blue-500 text-white">
                    <tr>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Rol</th>
                    <th className="px-4 py-2">Sede</th>
                    <th className="px-4 py-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-blue-100">
                        <td className="border px-4 py-2">{usuario.nombre}</td>
                        <td className="border px-4 py-2">{usuario.email}</td>
                        <td className="border px-4 py-2">{getRolNombre(usuario.rolId)}</td>
                        <td className="border px-4 py-2">{getSedeNombre(usuario.sedeId) || 'No asignada'}</td>
                        <td className="border px-4 py-2 flex justify-center">
                        <button
                            onClick={() => handleEditUser(usuario)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2 flex items-center"
                        >
                            <i className="lucide lucide-edit mr-2"></i> Editar
                        </button>
                        <button
                            onClick={() => handleDeleteUser(usuario.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                        >
                            <i className="lucide lucide-trash mr-2"></i> Eliminar
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            ) : (
                <p>No hay usuarios disponibles.</p>
            )}
            </div>
            <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4 flex items-center"
            >
            <i className="lucide lucide-arrow-left mr-2"></i> Regresar
            </button>
        </div>
    );
};

export default RolesView;
