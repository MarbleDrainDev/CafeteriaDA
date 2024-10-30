namespace Coffe.Classes
{
    public class Mesa
    {
        public int id { get; set; }
        public int numero_mesa { get; set; }
        public string estado { get; set; } // "Disponible" o "Ocupada"
    }
    public class EstadoMesa
    {
        public string estado { get; set; } // Debe coincidir con la propiedad que estás intentando actualizar
    }
}

