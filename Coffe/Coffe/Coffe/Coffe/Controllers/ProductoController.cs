using Coffe.Classes;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data.SqlClient;

namespace Cafeteria.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class ProductoController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetProduct()
        {
            try
            {
                List<Producto> productos = new List<Producto>();
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT * FROM productos"; // MySQL usa LIMIT, no TOP
                    using (var command = new MySqlCommand(query, connection))
                    {
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                productos.Add(new Producto
                                {
                                    Id = reader.GetInt32("Id"),
                                    Nombre = reader.GetString("Nombre"),
                                    Stock = reader.GetInt32("Stock"),
                                    Descripcion = reader.GetString("Descripcion"),
                                    Precio = reader.GetDecimal("Precio")
                                    // Agrega aquí otras propiedades según tu esquema de base de datos
                                });
                            }
                        }
                    }
                }

                return Ok(productos);
            }
            catch (Exception ex)
            {

                throw;
            }
        }
        [HttpGet("sede/{sedeId}")]
        public IActionResult GetProductosBySede(int sedeId)
        {
            try
            {
                List<Producto> productos = new List<Producto>();
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";

                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT * FROM productos WHERE sede_id = @SedeId"; // Filtrar por sede_id
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@SedeId", sedeId); // Agregar el parámetro

                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                productos.Add(new Producto
                                {
                                    Id = reader.GetInt32("Id"),
                                    Nombre = reader.GetString("Nombre"),
                                    Stock = reader.GetInt32("Stock"),
                                    Descripcion = reader.GetString("Descripcion"),
                                    Precio = reader.GetDecimal("Precio"),
                                    SedeId = reader.GetInt32("sede_id") // Asegúrate de que la propiedad SedeId esté en tu clase Producto
                                });
                            }
                        }
                    }
                }

                return Ok(productos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Error al obtener los productos.");
            }
        }


        [HttpPost]
        public IActionResult AddProduct([FromBody] Producto producto)
        {
            try
            {
                if (producto.SedeId == 0)
                {
                    return BadRequest("El campo sede_id es obligatorio.");
                }

                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "INSERT INTO productos (Nombre, Descripcion, Precio, Stock, sede_id) " +
                                   "VALUES (@Nombre, @Descripcion, @Precio, @Stock, @SedeId)";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Nombre", producto.Nombre);
                        command.Parameters.AddWithValue("@Descripcion", producto.Descripcion);
                        command.Parameters.AddWithValue("@Precio", producto.Precio);
                        command.Parameters.AddWithValue("@Stock", producto.Stock);
                        command.Parameters.AddWithValue("@SedeId", producto.SedeId);

                        int rowsAffected = command.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Ok("Producto agregado correctamente.");
                        }
                        else
                        {
                            return BadRequest("Error al agregar el producto.");
                        }
                    }
                }
            }
            catch (MySqlException ex)
            {
                Console.WriteLine($"Error de MySQL: {ex.Message}");
                return StatusCode(500, $"Error en la base de datos: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error general: {ex.Message}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(int id)
        {
            try
            {
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "DELETE FROM productos WHERE Id = @Id";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Id", id);
                        int rowsAffected = command.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Ok("Producto eliminado correctamente.");
                        }
                        else
                        {
                            return NotFound("Producto no encontrado.");
                        }
                    }
                }
            }
            catch (MySqlException ex)
            {
                Console.WriteLine($"Error de MySQL: {ex.Message}");
                return StatusCode(500, $"Error en la base de datos: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error general: {ex.Message}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
        [HttpPut("{id}")]
        public IActionResult UpdateProduct(int id, [FromBody] Producto producto)
        {
            try
            {
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();

                    // Generar el query dinámicamente según los campos que se van a actualizar
                    List<string> updates = new List<string>();
                    if (!string.IsNullOrEmpty(producto.Nombre)) updates.Add("Nombre = @Nombre");
                    if (!string.IsNullOrEmpty(producto.Descripcion)) updates.Add("Descripcion = @Descripcion");
                    if (producto.Precio > 0) updates.Add("Precio = @Precio");
                    if (producto.Stock > 0) updates.Add("Stock = @Stock");
                    if (producto.SedeId > 0) updates.Add("sede_id = @SedeId");

                    if (updates.Count == 0)
                    {
                        return BadRequest("No se enviaron datos para actualizar.");
                    }

                    string query = $"UPDATE productos SET {string.Join(", ", updates)} WHERE Id = @Id";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Id", id);
                        if (!string.IsNullOrEmpty(producto.Nombre)) command.Parameters.AddWithValue("@Nombre", producto.Nombre);
                        if (!string.IsNullOrEmpty(producto.Descripcion)) command.Parameters.AddWithValue("@Descripcion", producto.Descripcion);
                        if (producto.Precio > 0) command.Parameters.AddWithValue("@Precio", producto.Precio);
                        if (producto.Stock > 0) command.Parameters.AddWithValue("@Stock", producto.Stock);
                        if (producto.SedeId > 0) command.Parameters.AddWithValue("@SedeId", producto.SedeId);

                        int rowsAffected = command.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Ok("Producto actualizado correctamente.");
                        }
                        else
                        {
                            return NotFound("Producto no encontrado.");
                        }
                    }
                }
            }
            catch (MySqlException ex)
            {
                Console.WriteLine($"Error de MySQL: {ex.Message}");
                return StatusCode(500, $"Error en la base de datos: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error general: {ex.Message}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
    }
}