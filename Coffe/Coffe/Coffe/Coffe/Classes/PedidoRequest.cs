public class PedidoRequest
{
    public int IdMesero { get; set; }
    public int IdCajero { get; set; } // Este puede ser nulo si no se asigna al crear el pedido
    public int IdMesa { get; set; }
    public List<DetallePedido> Detalles { get; set; } // Asegúrate de que el nombre sea 'Detalles'
}

public class DetallePedido
{
    public int IdProducto { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
}
