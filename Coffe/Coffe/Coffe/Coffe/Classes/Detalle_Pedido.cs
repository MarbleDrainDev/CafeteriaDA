namespace Coffe.Classes
{
    public class Detalle_Pedido
    {
        public int id { get; set; }
        public int id_pedido { get; set; }
        public int id_producto { get; set; }
        public int cantidad { get; set; }
        public string detalles { get; set; } 
        public decimal precio_unitario { get; set; }
        public decimal subtotal { get; set; }
    }
}
