namespace Coffe.Classes
{
    // DTOs
    public class RoleDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
    }

    public class UpdateUserRoleDto
    {
        public int UserId { get; set; }
        public int NewRoleId { get; set; }
    }

    public class UsuarioDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; } // Agregar el campo Email
        public int RolId { get; set; }
        public int? SedeId { get; set; } // Puede ser null, así que es un int? (nullable)
    }
}
