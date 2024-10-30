namespace Coffe.Classes
{
    public class PedidoConDetalles
    {
        public Pedido Pedido { get; set; }
        public List<Detalle_Pedido> Detalles { get; set; } = new List<Detalle_Pedido>();
    }
}
