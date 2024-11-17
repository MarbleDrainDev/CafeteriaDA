using Coffe.Classes; // Asegúrate de que esta ruta sea correcta
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;


namespace Cafeteria.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MesaController : ControllerBase
    {
        private readonly IHubContext<MesaHub> _hubContext;

        public MesaController(IHubContext<MesaHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpGet]
        public IActionResult GetMesas(int sedeId)
        {
            try
            {
                List<Mesa> mesas = new List<Mesa>();
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT * FROM Mesas WHERE sede_id = @sedeId";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@sedeId", sedeId);
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                mesas.Add(new Mesa
                                {
                                    id = reader.GetInt32("Id"),
                                    numero_mesa = reader.GetInt32("numero_mesa"),
                                    estado = reader.GetString("estado")
                                });
                            }
                        }
                    }
                }

                return Ok(mesas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("{mesaId}/pedido")]
        public IActionResult GetPedidoByMesa(int mesaId)
        {
            try
            {
                var pedidoConDetalles = new PedidoConDetalles();
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();

                    string queryPedido = "SELECT Id, id_mesero, id_cajero, id_mesa, estado, fecha_apertura FROM Pedidos WHERE id_mesa = @mesaId AND estado = 'Abierto'";
                    using (var command = new MySqlCommand(queryPedido, connection))
                    {
                        command.Parameters.AddWithValue("@mesaId", mesaId);
                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                pedidoConDetalles.Pedido = new Pedido
                                {
                                    id = reader.GetInt32("Id"),
                                    id_mesero = reader.GetInt32("id_mesero"),
                                    id_cajero = reader.IsDBNull(reader.GetOrdinal("id_cajero")) ? 0 : reader.GetInt32("id_cajero"),
                                    id_mesa = reader.GetInt32("id_mesa"),
                                    estado = reader.GetString("estado"),
                                    fecha_apertura = reader.GetDateTime("fecha_apertura")
                                };
                            }
                            else
                            {
                                return NotFound("No se encontró un pedido abierto para esta mesa.");
                            }
                        }
                    }

                    // Obtener los detalles del pedido
                    string queryDetalles = "SELECT id_producto, cantidad, precio_unitario FROM Detalles_Pedido WHERE id_pedido = @pedidoId";
                    using (var commandDetalles = new MySqlCommand(queryDetalles, connection))
                    {
                        commandDetalles.Parameters.AddWithValue("@pedidoId", pedidoConDetalles.Pedido.id);
                        using (var readerDetalles = commandDetalles.ExecuteReader())
                        {
                            while (readerDetalles.Read())
                            {
                                var detalle = new Detalle_Pedido
                                {
                                    id_producto = readerDetalles.GetInt32("id_producto"),
                                    cantidad = readerDetalles.GetInt32("cantidad"),
                                    precio_unitario = readerDetalles.GetDecimal("precio_unitario"),
                                    subtotal = readerDetalles.GetInt32("cantidad") * readerDetalles.GetDecimal("precio_unitario")
                                };
                                pedidoConDetalles.Detalles.Add(detalle);
                            }
                        }
                    }
                }

                return Ok(pedidoConDetalles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }



        // Nueva función para cerrar un pedido
        [HttpPut("{pedidoId}/cerrar")]
        public IActionResult CerrarPedido(int pedidoId)
        {
            try
            {
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "UPDATE Pedidos SET estado = 'Cerrado', fecha_cierre = NOW() WHERE Id = @pedidoId AND estado = 'Abierto'";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@pedidoId", pedidoId);
                        int affectedRows = command.ExecuteNonQuery();

                        if (affectedRows == 0)
                        {
                            return NotFound("Pedido no encontrado o ya está cerrado.");
                        }
                    }
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("{pedidoId}/factura")]
        public IActionResult GetFactura(int pedidoId)
        {
            try
            {
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    var factura = new Factura();

                    // Obtener la información del pedido, incluyendo la fecha de cierre
                    string queryPedido = "SELECT Id, total, fecha_apertura, fecha_cierre FROM Pedidos WHERE Id = @pedidoId";
                    using (var command = new MySqlCommand(queryPedido, connection))
                    {
                        command.Parameters.AddWithValue("@pedidoId", pedidoId);
                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                factura.Id = reader.GetInt32("Id");
                                factura.Total = reader.GetDecimal("total");
                                factura.FechaApertura = reader.GetDateTime("fecha_apertura");
                                // Leer la fecha de cierre, puedes ajustarlo si está en otro formato
                                factura.FechaCierre = reader.IsDBNull(reader.GetOrdinal("fecha_cierre"))
                                    ? DateTime.Now
                                    : reader.GetDateTime("fecha_cierre");
                            }
                            else
                            {
                                return NotFound("Pedido no encontrado.");
                            }
                        }
                    }

                    // Obtener los detalles del pedido
                    string queryDetalles = "SELECT p.Nombre AS Producto, dp.Cantidad, dp.Precio_Unitario " +
                                           "FROM Detalles_Pedido dp " +
                                           "JOIN Productos p ON dp.id_producto = p.Id " +
                                           "WHERE dp.id_pedido = @pedidoId";
                    using (var commandDetalles = new MySqlCommand(queryDetalles, connection))
                    {
                        commandDetalles.Parameters.AddWithValue("@pedidoId", pedidoId);
                        using (var readerDetalles = commandDetalles.ExecuteReader())
                        {
                            while (readerDetalles.Read())
                            {
                                var detalle = new DetalleFactura
                                {
                                    Producto = readerDetalles.GetString("Producto"),
                                    Cantidad = readerDetalles.GetInt32("Cantidad"),
                                    PrecioUnitario = readerDetalles.GetDecimal("Precio_Unitario")
                                };
                                factura.Detalles.Add(detalle);
                            }
                        }
                    }

                    // Actualizar la mesa a "disponible"
                    string queryActualizarMesa = "UPDATE Mesas SET estado = 'Disponible' WHERE id = (SELECT id_mesa FROM Pedidos WHERE id = @pedidoId)";
                    using (var commandActualizarMesa = new MySqlCommand(queryActualizarMesa, connection))
                    {
                        commandActualizarMesa.Parameters.AddWithValue("@pedidoId", pedidoId);
                        commandActualizarMesa.ExecuteNonQuery();
                    }

                    // Crear el contenido de la factura
                    var contenidoFactura = $"Factura ID: {factura.Id}\n" +
                                           $"Fecha de Apertura: {factura.FechaApertura}\n" +
                                           $"Fecha de Cierre: {factura.FechaCierre}\n" + // Agregar fecha de cierre
                                           $"Total: {factura.Total}\n" +
                                           "Detalles del Pedido:\n";

                    foreach (var detalle in factura.Detalles)
                    {
                        contenidoFactura += $"Producto: {detalle.Producto}, " +
                                            $"Cantidad: {detalle.Cantidad}, " +
                                            $"Precio Unitario: {detalle.PrecioUnitario}\n";
                    }

                    // Convertir el contenido a un byte array
                    var bytesFactura = System.Text.Encoding.UTF8.GetBytes(contenidoFactura);

                    // Retornar el archivo de texto
                    return File(bytesFactura, "text/plain", $"Factura_{factura.Id}.txt");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // Nueva función para agregar producto al pedido
        [HttpPost("{mesaId}/productos")]
        public IActionResult AgregarProductoAlPedido(int mesaId, Detalle_Pedido detallePedido)
        {
            try
            {
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();

                    // Verificar si hay un pedido abierto para la mesa
                    int pedidoId;
                    string queryVerificarPedido = "SELECT Id FROM Pedidos WHERE id_mesa = @mesaId AND estado = 'Abierto'";
                    using (var commandVerificar = new MySqlCommand(queryVerificarPedido, connection))
                    {
                        commandVerificar.Parameters.AddWithValue("@mesaId", mesaId);
                        var result = commandVerificar.ExecuteScalar();
                        if (result != null)
                        {
                            pedidoId = Convert.ToInt32(result);
                        }
                        else
                        {
                            // Crear un nuevo pedido si no existe uno abierto
                            string queryCrearPedido = "INSERT INTO Pedidos (id_mesa, estado, fecha_apertura) VALUES (@mesaId, 'Abierto', NOW()); SELECT LAST_INSERT_ID();";
                            using (var commandCrear = new MySqlCommand(queryCrearPedido, connection))
                            {
                                commandCrear.Parameters.AddWithValue("@mesaId", mesaId);
                                pedidoId = Convert.ToInt32(commandCrear.ExecuteScalar());
                            }
                        }
                    }

                    // Aquí estamos verificando si el producto ya está en los detalles del pedido
                    string queryVerificarDetalle = "SELECT cantidad FROM Detalles_Pedido WHERE id_pedido = @id_pedido AND id_producto = @id_producto";
                    using (var commandVerificarDetalle = new MySqlCommand(queryVerificarDetalle, connection))
                    {
                        commandVerificarDetalle.Parameters.AddWithValue("@id_pedido", pedidoId);
                        commandVerificarDetalle.Parameters.AddWithValue("@id_producto", detallePedido.id_producto);
                        var cantidadExistente = commandVerificarDetalle.ExecuteScalar();

                        if (cantidadExistente != null)
                        {
                            // Si ya existe, actualiza la cantidad
                            string queryActualizarDetalle = "UPDATE Detalles_Pedido SET cantidad = cantidad + @cantidad WHERE id_pedido = @id_pedido AND id_producto = @id_producto";
                            using (var commandActualizar = new MySqlCommand(queryActualizarDetalle, connection))
                            {
                                commandActualizar.Parameters.AddWithValue("@id_pedido", pedidoId);
                                commandActualizar.Parameters.AddWithValue("@id_producto", detallePedido.id_producto);
                                commandActualizar.Parameters.AddWithValue("@cantidad", detallePedido.cantidad);
                                commandActualizar.ExecuteNonQuery();
                            }
                        }
                        else
                        {
                            // Si no existe, inserta un nuevo detalle
                            string queryInsertarDetalle = "INSERT INTO Detalles_Pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (@id_pedido, @id_producto, @cantidad, @precio_unitario)";
                            using (var commandInsert = new MySqlCommand(queryInsertarDetalle, connection))
                            {
                                commandInsert.Parameters.AddWithValue("@id_pedido", pedidoId);
                                commandInsert.Parameters.AddWithValue("@id_producto", detallePedido.id_producto);
                                commandInsert.Parameters.AddWithValue("@cantidad", detallePedido.cantidad);
                                commandInsert.Parameters.AddWithValue("@precio_unitario", detallePedido.precio_unitario);
                                commandInsert.ExecuteNonQuery();
                            }
                        }
                    }

                    // Actualizar el total del pedido
                    string queryActualizarTotal = "UPDATE Pedidos SET total = (SELECT SUM(cantidad * precio_unitario) FROM Detalles_Pedido WHERE id_pedido = @id_pedido) WHERE Id = @id_pedido";

                    using (var commandActualizar = new MySqlCommand(queryActualizarTotal, connection))
                    {
                        commandActualizar.Parameters.AddWithValue("@id_pedido", pedidoId);
                        commandActualizar.ExecuteNonQuery();
                    }
                }

                // Emitir evento de actualización de mesas
                _hubContext.Clients.All.SendAsync("mesasActualizadas");

                return Ok("Producto agregado al pedido.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }





        [HttpGet("productos")]
        public IActionResult GetMeseroProductList(int meseroId)
        {
            try
            {
                List<Producto> productos = new List<Producto>();
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    // Consulta que obtiene los productos según la sede del mesero
                    string query = @"SELECT p.Id, p.Nombre, p.Precio 
                             FROM Productos p
                             JOIN Meseros m ON p.sede_id = m.sede_id
                             WHERE m.Id = @meseroId";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@meseroId", meseroId);
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                productos.Add(new Producto
                                {
                                    Id = reader.GetInt32("Id"),
                                    Nombre = reader.GetString("Nombre"),
                                    Precio = reader.GetDecimal("Precio")
                                });
                            }
                        }
                    }
                }

                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("pedido")]
        public IActionResult CrearPedido([FromBody] PedidoRequest pedidoRequest)
        {
            string connectionString = "server=localhost;database=Cafeteria;user=root;password=1234";

            using (var connection = new MySqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    MySqlTransaction transaction = connection.BeginTransaction();

                    // Crear el pedido
                    string queryPedido = @"INSERT INTO Pedidos (id_mesero, id_cajero, id_mesa, fecha_apertura, estado)
                                   VALUES (@id_mesero, @id_cajero, @id_mesa, NOW(), 'Abierto')";

                    using (var cmdPedido = new MySqlCommand(queryPedido, connection, transaction))
                    {
                        cmdPedido.Parameters.AddWithValue("@id_mesero", pedidoRequest.IdMesero);
                        cmdPedido.Parameters.AddWithValue("@id_cajero", pedidoRequest.IdCajero > 0 ? (object)pedidoRequest.IdCajero : DBNull.Value);
                        cmdPedido.Parameters.AddWithValue("@id_mesa", pedidoRequest.IdMesa);
                        cmdPedido.ExecuteNonQuery();

                        int pedidoId = (int)cmdPedido.LastInsertedId; // Obtener el ID del pedido recién creado

                        // Agregar detalles del pedido
                        foreach (var producto in pedidoRequest.Detalles)
                        {
                            string queryDetalle = @"INSERT INTO Detalles_Pedido (id_pedido, id_producto, cantidad, precio_unitario)
                                            VALUES (@id_pedido, @id_producto, @cantidad, @precio_unitario)";
                            using (var cmdDetalle = new MySqlCommand(queryDetalle, connection, transaction))
                            {
                                cmdDetalle.Parameters.AddWithValue("@id_pedido", pedidoId);
                                cmdDetalle.Parameters.AddWithValue("@id_producto", producto.IdProducto);
                                cmdDetalle.Parameters.AddWithValue("@cantidad", producto.Cantidad);
                                cmdDetalle.Parameters.AddWithValue("@precio_unitario", producto.PrecioUnitario);
                                cmdDetalle.ExecuteNonQuery();
                            }
                        }

                        // Actualizar el estado de la mesa a 'Ocupada'
                        string queryActualizarMesa = "UPDATE Mesas SET estado = 'Ocupada' WHERE id = @id_mesa";
                        using (var cmdActualizarMesa = new MySqlCommand(queryActualizarMesa, connection, transaction))
                        {
                            cmdActualizarMesa.Parameters.AddWithValue("@id_mesa", pedidoRequest.IdMesa);
                            cmdActualizarMesa.ExecuteNonQuery();
                        }

                        transaction.Commit();
                        return Ok(new { mensaje = "Pedido registrado exitosamente", pedidoId = pedidoId });
                    }
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Error al registrar el pedido: {ex.Message}");
                }
            }
        }
        [HttpPut("{mesaId}/actualizar")]
        public IActionResult ActualizarPedidoEnMesa(int mesaId, [FromBody] PedidoRequest pedidoRequest)
        {
            string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                
            using (var connection = new MySqlConnection(connectionString))
            {
                try
                {
                    connection.Open();

                    // Buscar el pedido abierto en la mesa especificada
                    string queryBuscarPedido = "SELECT Id FROM Pedidos WHERE id_mesa = @mesaId AND estado = 'Abierto'";
                    int pedidoId;

                    using (var commandBuscar = new MySqlCommand(queryBuscarPedido, connection))
                    {
                        commandBuscar.Parameters.AddWithValue("@mesaId", mesaId);
                        var result = commandBuscar.ExecuteScalar();

                        if (result == null)
                        {
                            return NotFound("No hay un pedido abierto para esta mesa.");
                        }

                        pedidoId = Convert.ToInt32(result);
                    }

                    // Actualizar la información del pedido
                    string queryActualizarPedido = @"UPDATE Pedidos 
                                              SET id_mesero = @id_mesero, 
                                                  id_cajero = IFNULL(NULLIF(@id_cajero, 0), id_cajero) 
                                              WHERE Id = @pedidoId";

                    using (var cmdActualizar = new MySqlCommand(queryActualizarPedido, connection))
                    {
                        cmdActualizar.Parameters.AddWithValue("@id_mesero", pedidoRequest.IdMesero);
                        cmdActualizar.Parameters.AddWithValue("@id_cajero", pedidoRequest.IdCajero > 0 ? (object)pedidoRequest.IdCajero : DBNull.Value);
                        cmdActualizar.Parameters.AddWithValue("@pedidoId", pedidoId);
                        cmdActualizar.ExecuteNonQuery();
                    }

                    // Actualizar o insertar detalles del pedido
                    foreach (var detalle in pedidoRequest.Detalles)
                    {
                        // Verificar si el detalle ya existe
                        string queryVerificarDetalle = "SELECT cantidad FROM Detalles_Pedido WHERE id_pedido = @id_pedido AND id_producto = @id_producto";
                        using (var commandVerificar = new MySqlCommand(queryVerificarDetalle, connection))
                        {
                            commandVerificar.Parameters.AddWithValue("@id_pedido", pedidoId);
                            commandVerificar.Parameters.AddWithValue("@id_producto", detalle.IdProducto);
                            var cantidadExistente = commandVerificar.ExecuteScalar();

                            if (cantidadExistente != null)
                            {
                                // Si existe, actualizar la cantidad
                                string queryActualizarDetalle = "UPDATE Detalles_Pedido SET cantidad = @cantidad WHERE id_pedido = @id_pedido AND id_producto = @id_producto";
                                using (var commandActualizar = new MySqlCommand(queryActualizarDetalle, connection))
                                {
                                    commandActualizar.Parameters.AddWithValue("@cantidad", detalle.Cantidad);
                                    commandActualizar.Parameters.AddWithValue("@id_pedido", pedidoId);
                                    commandActualizar.Parameters.AddWithValue("@id_producto", detalle.IdProducto);
                                    commandActualizar.ExecuteNonQuery();
                                }
                            }
                            else
                            {
                                // Si no existe, insertar un nuevo detalle
                                string queryInsertarDetalle = "INSERT INTO Detalles_Pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (@id_pedido, @id_producto, @cantidad, @precio_unitario)";
                                using (var commandInsertar = new MySqlCommand(queryInsertarDetalle, connection))
                                {
                                    commandInsertar.Parameters.AddWithValue("@id_pedido", pedidoId);
                                    commandInsertar.Parameters.AddWithValue("@id_producto", detalle.IdProducto);
                                    commandInsertar.Parameters.AddWithValue("@cantidad", detalle.Cantidad);
                                    commandInsertar.Parameters.AddWithValue("@precio_unitario", detalle.PrecioUnitario);
                                    commandInsertar.ExecuteNonQuery();
                                }
                            }
                        }
                    }

                    return Ok(new { mensaje = "Pedido y detalles actualizados exitosamente" });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Error al actualizar el pedido: {ex.Message}");
                }
            }

        }
        [HttpDelete("{idPedido}/detalle/{idProducto}")]
        public IActionResult EliminarProductoDetalle(int idPedido, int idProducto)
        {
            try
            {
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    using (var transaction = connection.BeginTransaction())
                    {
                        // Verifica si el producto existe en los detalles del pedido
                        string checkQuery = "SELECT cantidad FROM Detalles_Pedido WHERE id_pedido = @IdPedido AND id_producto = @IdProducto";
                        using (var checkCommand = new MySqlCommand(checkQuery, connection, transaction))
                        {
                            checkCommand.Parameters.AddWithValue("@IdPedido", idPedido);
                            checkCommand.Parameters.AddWithValue("@IdProducto", idProducto);

                            object result = checkCommand.ExecuteScalar();
                            if (result == null || Convert.ToInt32(result) == 0)
                            {
                                return NotFound("El producto no se encuentra en el pedido.");
                            }

                            int cantidad = Convert.ToInt32(result);

                            // Si la cantidad es mayor a 1, actualiza la cantidad
                            if (cantidad > 1)
                            {
                                string updateQuery = "UPDATE Detalles_Pedido SET cantidad = cantidad - 1 WHERE id_pedido = @IdPedido AND id_producto = @IdProducto";
                                using (var updateCommand = new MySqlCommand(updateQuery, connection, transaction))
                                {
                                    updateCommand.Parameters.AddWithValue("@IdPedido", idPedido);
                                    updateCommand.Parameters.AddWithValue("@IdProducto", idProducto);
                                    updateCommand.ExecuteNonQuery();
                                }
                                transaction.Commit();
                                return Ok("Se redujo la cantidad del producto en 1.");
                            }
                            else
                            {
                                // Si la cantidad es 1, procede a eliminarlo
                                string deleteQuery = "DELETE FROM Detalles_Pedido WHERE id_pedido = @IdPedido AND id_producto = @IdProducto";
                                using (var deleteCommand = new MySqlCommand(deleteQuery, connection, transaction))
                                {
                                    deleteCommand.Parameters.AddWithValue("@IdPedido", idPedido);
                                    deleteCommand.Parameters.AddWithValue("@IdProducto", idProducto);
                                    deleteCommand.ExecuteNonQuery();
                                }
                            }
                        }

                        // Verifica si quedan otros detalles en el pedido
                        string checkRemainingDetailsQuery = "SELECT COUNT(*) FROM Detalles_Pedido WHERE id_pedido = @IdPedido";
                        using (var checkRemainingCommand = new MySqlCommand(checkRemainingDetailsQuery, connection, transaction))
                        {
                            checkRemainingCommand.Parameters.AddWithValue("@IdPedido", idPedido);

                            int remainingCount = Convert.ToInt32(checkRemainingCommand.ExecuteScalar());

                            if (remainingCount == 0)
                            {
                                // Eliminar el pedido si no quedan detalles
                                string deletePedidoQuery = "DELETE FROM Pedidos WHERE id = @IdPedido";
                                using (var deletePedidoCommand = new MySqlCommand(deletePedidoQuery, connection, transaction))
                                {
                                    deletePedidoCommand.Parameters.AddWithValue("@IdPedido", idPedido);
                                    deletePedidoCommand.ExecuteNonQuery();
                                }

                                // Cambiar el estado de la mesa a "Disponible"
                                string updateMesaQuery = "UPDATE Mesas SET estado = 'Disponible' WHERE id = (SELECT id_mesa FROM Pedidos WHERE id = @IdPedido LIMIT 1)";
                                using (var updateMesaCommand = new MySqlCommand(updateMesaQuery, connection, transaction))
                                {
                                    updateMesaCommand.Parameters.AddWithValue("@IdPedido", idPedido);
                                    updateMesaCommand.ExecuteNonQuery();
                                }

                                transaction.Commit();
                                return Ok("El pedido se cerró ya que no quedan detalles. La mesa está ahora 'Disponible'.");
                            }
                        }

                        transaction.Commit();
                        return Ok("Producto eliminado del pedido correctamente.");
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
        [HttpPut("{id}/estado")]
        public IActionResult ActualizarEstadoMesa(int id, [FromBody] EstadoMesa estadoDto)
        {
            try
            {
                string connectionString = "Server=localhost;Database=Cafeteria;Uid=root;Pwd=1234;";
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "UPDATE Mesas SET estado = @nuevoEstado WHERE Id = @id";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@nuevoEstado", estadoDto.estado);
                        command.Parameters.AddWithValue("@id", id);
                        int affectedRows = command.ExecuteNonQuery();

                        if (affectedRows == 0)
                        {
                            return NotFound("Mesa no encontrada.");
                        }
                    }
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
    }
}