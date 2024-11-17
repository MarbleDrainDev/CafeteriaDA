using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Coffe.Classes; // Asegúrate de que esta ruta sea correcta
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Coffe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CafeteriaController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";

        // Obtener todos los roles
        [HttpGet("roles")]
        public IActionResult GetRoles()
        {
            try
            {
                List<RoleDto> roles = new List<RoleDto>();
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT * FROM Roles"; // Asegúrate de que la tabla se llama Roles
                    using (var command = new MySqlCommand(query, connection))
                    {
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                roles.Add(new RoleDto
                                {
                                    Id = reader.GetInt32("id"),
                                    Nombre = reader.GetString("nombre")
                                });
                            }
                        }
                    }
                }

                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor: " + ex.Messa/ge });
            }
        }

        // Agregar un nuevo rol
        [HttpPost("roles")]
        public IActionResult AddRole([FromBody] RoleDto newRole)
        {
            if (newRole == null || string.IsNullOrWhiteSpace(newRole.Nombre))
            {
                return BadRequest(new { message = "El nombre del rol es requerido." });
            }

            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "INSERT INTO Roles (nombre) VALUES (@Nombre)";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Nombre", newRole.Nombre);
                        command.ExecuteNonQuery();
                    }
                }

                return CreatedAtAction(nameof(GetRoles), new { id = newRole.Nombre }, newRole);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor: " + ex.Message });
            }
        }

        // Actualizar el rol de un usuario
        [HttpPut("users/{userId}/role")]
        public IActionResult UpdateUserRole(int userId, [FromBody] UpdateUserRoleDto updateUserRoleDto)
        {
            if (userId != updateUserRoleDto.UserId)
            {
                return BadRequest("El ID del usuario no coincide.");
            }

            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "UPDATE Usuarios SET rol_id = @newRoleId WHERE id = @userId";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@newRoleId", updateUserRoleDto.NewRoleId);
                        command.Parameters.AddWithValue("@userId", userId);

                        int rowsAffected = command.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Ok(new { message = "Rol actualizado exitosamente." });
                        }
                        else
                        {
                            return NotFound(new { message = "Usuario no encontrado." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor: " + ex.Message });
            }
        }

        // Obtener todos los usuarios
        [HttpGet("usuarios")]
        public IActionResult GetUsuarios()
        {
            try
            {
                List<UsuarioDto> usuarios = new List<UsuarioDto>();

                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT id, nombre, email, rol_id, sede_id FROM Usuarios"; // Asegúrate de que la columna sede_id exista

                    using (var command = new MySqlCommand(query, connection))
                    {
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                usuarios.Add(new UsuarioDto
                                {
                                    Id = reader.GetInt32("id"),
                                    Nombre = reader.GetString("nombre"),
                                    Email = reader.GetString("email"), // Leer el email
                                    RolId = reader.GetInt32("rol_id"),
                                    SedeId = reader.IsDBNull(reader.GetOrdinal("sede_id")) ? (int?)null : reader.GetInt32("sede_id") // Manejar el caso nullable
                                });
                            }
                        }
                    }
                }

                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }


        // Eliminar un rol
        [HttpDelete("roles/{roleId}")]
        public IActionResult DeleteRole(int roleId)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "DELETE FROM Roles WHERE id = @roleId";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@roleId", roleId);
                        int rowsAffected = command.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Ok(new { message = "Rol eliminado exitosamente." });
                        }
                        else
                        {
                            return NotFound(new { message = "Rol no encontrado." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor: " + ex.Message });
            }
        }
        // Actualizar un rol existente
        [HttpPut("roles/{roleId}")]
        public IActionResult UpdateRole(int roleId, [FromBody] RoleDto updatedRole)
        {
            if (updatedRole == null || string.IsNullOrWhiteSpace(updatedRole.Nombre))
            {
                return BadRequest(new { message = "El nombre del rol es requerido." });
            }

            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "UPDATE Roles SET nombre = @Nombre WHERE id = @roleId";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Nombre", updatedRole.Nombre);
                        command.Parameters.AddWithValue("@roleId", roleId);

                        int rowsAffected = command.ExecuteNonQuery();
                        if (rowsAffected > 0)
                        {
                            return Ok(new { message = "Rol actualizado exitosamente." });
                        }
                        else
                        {
                            return NotFound(new { message = "Rol no encontrado." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor: " + ex.Message });
            }
        }

        // Obtener todas las sedes
        [HttpGet("sedes")]
        public async Task<IActionResult> GetSedes()
        {
            var sedes = new List<Sede>();
            using var connection = new MySqlConnection(connectionString);
            await connection.OpenAsync();

            using var command = new MySqlCommand("SELECT * FROM sedes", connection);
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                sedes.Add(new Sede
                {
                    Id = reader.GetInt32("id"),
                    Nombre = reader.GetString("nombre"),
                    Direccion = reader.GetString("direccion"),
                });
            }
            return Ok(sedes);
        }

        // Crear una nueva sede
        [HttpPost("sedes")]
        public async Task<IActionResult> CreateSede([FromBody] Sede sede)
        {
            if (sede == null || string.IsNullOrWhiteSpace(sede.Nombre))
            {
                return BadRequest(new { message = "El nombre de la sede es requerido." });
            }

            using var connection = new MySqlConnection(connectionString);
            await connection.OpenAsync();

            using var command = new MySqlCommand("INSERT INTO sedes (nombre, direccion) VALUES (@nombre, @direccion)", connection);
            command.Parameters.AddWithValue("@nombre", sede.Nombre);
            command.Parameters.AddWithValue("@direccion", sede.Direccion);
            await command.ExecuteNonQueryAsync();
            return CreatedAtAction(nameof(GetSedes), new { id = sede.Id }, sede);
        }

        // Actualizar una sede
        [HttpPut("sedes/{id}")]
        public async Task<IActionResult> UpdateSede(int id, [FromBody] Sede sede)
        {
            if (sede == null || string.IsNullOrWhiteSpace(sede.Nombre))
            {
                return BadRequest(new { message = "El nombre de la sede es requerido." });
            }

            using var connection = new MySqlConnection(connectionString);
            await connection.OpenAsync();

            using var command = new MySqlCommand("UPDATE sedes SET nombre = @nombre, direccion = @direccion WHERE id = @id", connection);
            command.Parameters.AddWithValue("@nombre", sede.Nombre);
            command.Parameters.AddWithValue("@direccion", sede.Direccion);
            command.Parameters.AddWithValue("@id", id);
            await command.ExecuteNonQueryAsync();
            return NoContent();
        }

        // Eliminar una sede
        [HttpDelete("sedes/{id}")]
        public async Task<IActionResult> DeleteSede(int id)
        {
            using var connection = new MySqlConnection(connectionString);
            await connection.OpenAsync();

            using var command = new MySqlCommand("DELETE FROM sedes WHERE id = @id", connection);
            command.Parameters.AddWithValue("@id", id);
            await command.ExecuteNonQueryAsync();
            return NoContent();
        }
    }
}
