namespace Coffe.Classes
{
    public class Usuario
    {
        public  int id { get; set; }
        public  string nombre { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public int rol_id { get; set; }
        public int? sede_id { get; set; }
    }
}
