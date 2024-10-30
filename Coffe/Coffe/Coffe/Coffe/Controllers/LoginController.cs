using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Coffe.Classes;
using System;

namespace Coffe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.email) || string.IsNullOrWhiteSpace(request.password))
            {
                return BadRequest(new { message = "Email y contraseña son requeridos." });
            }

            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT * FROM Usuarios WHERE email = @Email";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Email", request.email);

                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                var storedPassword = reader.GetString("password");

                                if (storedPassword == request.password)
                                {
                                    // Usuario autenticado correctamente
                                    var usuario = new Usuario
                                    {
                                        id = reader.GetInt32("id"),
                                        nombre = reader.GetString("nombre"),
                                        email = reader.GetString("email"),
                                        rol_id = reader.GetInt32("rol_id"),
                                        sede_id = reader.IsDBNull(reader.GetOrdinal("sede_id")) ? (int?)null : reader.GetInt32("sede_id")
                                    };

                                    var token = GenerateToken();
                                    // Incluir sede_id en la respuesta
                                    return Ok(new { token, rol = usuario.rol_id, sedeId = usuario.sede_id, userId = usuario.id });
                                }
                            }
                        }
                    }
                }
                return Unauthorized(new { message = "Credenciales inválidas" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor: " + ex.Message });
            }
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] Usuario newUser)
        {
            if (newUser == null || string.IsNullOrWhiteSpace(newUser.email) || string.IsNullOrWhiteSpace(newUser.password))
            {
                return BadRequest(new { message = "Todos los campos son requeridos." });
            }

            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();

                    // Verificar si el usuario ya existe
                    string checkUserQuery = "SELECT COUNT(*) FROM Usuarios WHERE email = @Email";
                    using (var checkCommand = new MySqlCommand(checkUserQuery, connection))
                    {
                        checkCommand.Parameters.AddWithValue("@Email", newUser.email);
                        var userExists = Convert.ToInt32(checkCommand.ExecuteScalar());
                        if (userExists > 0)
                        {
                            return Conflict(new { message = "El correo electrónico ya está registrado." });
                        }
                    }

                    // Insertar nuevo usuario
                    string insertQuery = "INSERT INTO Usuarios (nombre, email, password, rol_id, sede_id) VALUES (@Nombre, @Email, @Password, @RolId, @SedeId)";
                    using (var command = new MySqlCommand(insertQuery, connection))
                    {
                        command.Parameters.AddWithValue("@Nombre", newUser.nombre);
                        command.Parameters.AddWithValue("@Email", newUser.email);
                        command.Parameters.AddWithValue("@Password", newUser.password);
                        command.Parameters.AddWithValue("@RolId", newUser.rol_id);

                        // Comprobar si el sede_id es nulo
                        if (newUser.sede_id.HasValue)
                        {
                            command.Parameters.AddWithValue("@SedeId", newUser.sede_id);
                        }
                        else
                        {
                            command.Parameters.AddWithValue("@SedeId", DBNull.Value); // Sede nulo
                        }

                        command.ExecuteNonQuery();
                    }
                }

                return Ok(new { message = "Usuario registrado exitosamente." });
            }
            catch (MySqlException mysqlEx)
            {
                // Excepciones específicas de MySQL
                return StatusCode(500, new { message = "Error de base de datos: " + mysqlEx.Message });
            }
            catch (Exception ex)
            {
                // Otras excepciones no manejadas
                return StatusCode(500, new { message = "Error interno del servidor: " + ex.Message });
            }
        }


        [HttpDelete("{id}")]
        public IActionResult DeleteUser(int id)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();

                    // Verificar si el usuario existe
                    string checkUserQuery = "SELECT COUNT(*) FROM Usuarios WHERE id = @Id";
                    using (var checkCommand = new MySqlCommand(checkUserQuery, connection))
                    {
                        checkCommand.Parameters.AddWithValue("@Id", id);
                        var userExists = Convert.ToInt32(checkCommand.ExecuteScalar());
                        if (userExists == 0)
                        {
                            return NotFound(new { message = "Usuario no encontrado." });
                        }
                    }

                    // Eliminar usuario
                    string deleteQuery = "DELETE FROM Usuarios WHERE id = @Id";
                    using (var command = new MySqlCommand(deleteQuery, connection))
                    {
                        command.Parameters.AddWithValue("@Id", id);
                        command.ExecuteNonQuery();
                    }
                }
                return Ok(new { message = "Usuario eliminado exitosamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor: " + ex.Message });
            }
        }
        [HttpPut("{id}")]
        public IActionResult UpdateUser(int id, [FromBody] Usuario updatedUser)
        {
            if (updatedUser == null || string.IsNullOrWhiteSpace(updatedUser.email) || string.IsNullOrWhiteSpace(updatedUser.password) || updatedUser.rol_id <= 0)
            {
                return BadRequest(new { message = "Todos los campos son requeridos excepto sede_id." });
            }

            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();

                    // Verificar si el usuario existe
                    string checkUserQuery = "SELECT COUNT(*) FROM Usuarios WHERE id = @Id";
                    using (var checkCommand = new MySqlCommand(checkUserQuery, connection))
                    {
                        checkCommand.Parameters.AddWithValue("@Id", id);
                        var userExists = Convert.ToInt32(checkCommand.ExecuteScalar());
                        if (userExists == 0)
                        {
                            return NotFound(new { message = "Usuario no encontrado." });
                        }
                    }

                    // Actualizar usuario
                    string updateQuery = "UPDATE Usuarios SET nombre = @Nombre, email = @Email, password = @Password, rol_id = @RolId, sede_id = @SedeId WHERE id = @Id";
                    using (var command = new MySqlCommand(updateQuery, connection))
                    {
                        command.Parameters.AddWithValue("@Nombre", updatedUser.nombre);
                        command.Parameters.AddWithValue("@Email", updatedUser.email);
                        command.Parameters.AddWithValue("@Password", updatedUser.password);
                        command.Parameters.AddWithValue("@RolId", updatedUser.rol_id);
                        command.Parameters.AddWithValue("@SedeId", updatedUser.sede_id ?? (object)DBNull.Value); // Permitir que sede_id sea nulo
                        command.Parameters.AddWithValue("@Id", id);

                        command.ExecuteNonQuery();
                    }
                }
                return Ok(new { message = "Usuario actualizado exitosamente." });
            }
            catch (Exception ex)
            {
                // Puedes registrar el error aquí para más detalles
                return StatusCode(500, new { message = "Error interno del servidor.", detail = ex.Message });
            }
        }



        private string GenerateToken()
        {
            // Generar un token simple. Para producción, considera usar JWT u otro método más seguro.
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        }
    }
}
