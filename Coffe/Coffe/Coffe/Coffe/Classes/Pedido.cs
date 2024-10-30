namespace Coffe.Classes
{
    public class Pedido
    {
        public int id { get; set; }
        public int id_mesero { get; set; }
        public int id_cajero { get; set; }
        public int id_mesa { get; set; }
        public Mesa mesa { get; set; }  // Relación con la mesa
        public string estado { get; set; }  // Abierto o Cerrado
        public decimal total { get; set; }
        public DateTime fecha_apertura { get; set; }
        public DateTime? fecha_cierre { get; set; }
    }

}
