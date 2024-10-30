public class Factura
{
    public int Id { get; set; }
    public DateTime FechaApertura { get; set; }
    public DateTime FechaCierre { get; set; } // Nueva propiedad para la fecha de cierre
    public decimal Total { get; set; }
    public List<DetalleFactura> Detalles { get; set; }

    public Factura()
    {
        Detalles = new List<DetalleFactura>();
    }
}

public class DetalleFactura
{
    public string Producto { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
}
