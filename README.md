# Proyecto de Login en React

Este proyecto demuestra un sistema de inicio de sesión simple con vistas basadas en roles utilizando React y TypeScript.

## Características

- Página de inicio de sesión que acepta un correo y contraseña del usuario
- Vistas basadas en roles para Admin, Cajero y Mesero
- Tailwind CSS para el estilo
- TypeScript para la seguridad de tipos
- Backend con Axios en cs

## Comenzando

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Ejecuta el servidor de desarrollo: `npm run dev`

## Uso

1. Ingresa uno de los correos registrados de usuario para iniciar sesión:
   - Admin
   - Cajero
   - Mesero
2. Se mostrará la vista correspondiente según el nombre de usuario ingresado.
3. Cualquier otro nombre de usuario resultará en un mensaje de "Acceso no autorizado o Usuario incorrecto".

## DB

Necesitaras la siguiente base de datos en MySQL para que funcione la conexion con los endpoints y el funcionamiento de la aplicacion:

```typescript
DROP DATABASE IF EXISTS Cafeteria;

CREATE DATABASE Cafeteria;

USE Cafeteria;

-- Tabla de Roles
CREATE TABLE roles (	
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Sedes
CREATE TABLE sedes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    direccion VARCHAR(255) NOT NULL
);

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL, -- Reemplazamos ENUM con una FK
    sede_id INT,
    FOREIGN KEY (rol_id) REFERENCES roles(id), -- FK a roles
    FOREIGN KEY (sede_id) REFERENCES sedes(id) -- FK a sedes
);


-- Tabla de Productos
CREATE TABLE Productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,  -- El precio sigue siendo un número decimal
    stock INT NOT NULL,
    sede_id INT NOT NULL,
    imagen VARCHAR(255) DEFAULT NULL, -- Columna para la ruta de la imagen
    FOREIGN KEY (sede_id) REFERENCES sedes(id) -- FK a la tabla sedes
);

-- Tabla de Mesas
CREATE TABLE Mesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_mesa INT NOT NULL,
    estado ENUM('Disponible', 'Ocupada') NOT NULL,
    sede_id INT NOT NULL,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) -- FK a sedes
);

-- Primero creamos la tabla de Pedidos
CREATE TABLE Pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_mesero INT,
    id_cajero INT,
    id_mesa INT NOT NULL,
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP,
    FOREIGN KEY (id_mesero) REFERENCES Usuarios(id),
    FOREIGN KEY (id_cajero) REFERENCES Usuarios(id),
    FOREIGN KEY (id_mesa) REFERENCES Mesas(id) -- FK a Mesas
);

-- Tabla de Detalles de Pedidos
CREATE TABLE Detalles_Pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT,
    id_producto INT,
    cantidad INT NOT NULL,
    detalles VARCHAR(255) DEFAULT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id),
    FOREIGN KEY (id_producto) REFERENCES Productos(id)
);

-- Tabla de Facturas
CREATE TABLE facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    
    fecha_apertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES Pedidos(id)
);
-- Insertar roles
INSERT INTO roles (nombre) VALUES ('Administrador');
INSERT INTO roles (nombre) VALUES ('Mesero');
INSERT INTO roles (nombre) VALUES ('Cajero');

-- Insertar sedes
INSERT INTO sedes (nombre, direccion) VALUES
('Sede Central', 'Avenida Principal 123, Bogotá'),
('Sede Norte', 'Calle Norte 456, Medellín'),
('Sede Sur', 'Calle Sur 789, Bucaramanga'),
('Sede Este', 'Avenida Este 101, Cali');

-- Cambios en los INSERTs de usuarios
INSERT INTO Usuarios (nombre, email, password, rol_id, sede_id) VALUES
('Jeyson Murcia', 'jeyson@gmail.com', '1234', 1, NULL),  -- Rol de Administrador
('Andres', 'andres@gmail.com', 'kiloymediolitrodehelado123456', 2, 2),            -- Rol de Mesero
('David', 'david@gmail.com', '1234', 3, 3),              -- Rol de Cajero
('Laura', 'laura@gmail.com', '1234', 2, 1),              -- Rol de Mesero
('Carlos', 'carlos@gmail.com', '1234', 3, 4),           -- Rol de Cajero
('Maria', 'maria@gmail.com', '1234', 2, 2);             -- Rol de Mesero

INSERT INTO Productos (nombre, descripcion, precio, stock, sede_id, imagen) VALUES
('Café Americano', 'Café negro servido en taza grande', 1500.00, 50, 1, '/images/productos/cafe_americano.jpg'),
('Latte', 'Café con leche vaporizada y espuma de leche', 3500.00, 30, 1, '/images/productos/latte.jpg'),
('Té Verde', 'Té verde natural en hoja', 2000.00, 40, 1, '/images/productos/te_verde.jpg'),
('Té Verde', 'Té verde natural en hoja', 2000.00, 40, 2, '/images/productos/te_verde.jpg');

-- Inserta mesas en diferentes sedes
INSERT INTO Mesas (numero_mesa, estado, sede_id) VALUES
(1, 'Disponible', 1),  -- Mesa en la Sede Central
(2, 'Ocupada', 1),     -- Otra mesa en la Sede Central
(3, 'Disponible', 2),  -- Mesa en la Sede Norte
(4, 'Ocupada', 3),     -- Mesa en la Sede Sur
(5, 'Disponible', 4);  -- Mesa en la Sede Este

-- Insertar pedidos en la tabla Pedidos
INSERT INTO Pedidos (id_mesero, id_cajero, id_mesa, total) VALUES
(2, 3, 1,  10000.00),   -- Pedido abierto en la Mesa 1 (Sede Central)
(2, 3, 2,  20000.00),   -- Pedido cerrado en la Mesa 2 (Sede Central)
(3, 4, 4,  15000.00);   -- Pedido abierto en la Mesa 4 (Sede Sur)

-- Insertar detalles del pedido para el pedido en la Mesa	 1
INSERT INTO Detalles_Pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(1, 1, 2, 1500.00),   -- 2x Café Americano
(1, 2, 1, 3500.00);   -- 1x Latte

-- Insertar detalles del pedido para el pedido en la Mesa 2
INSERT INTO Detalles_Pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(2, 3, 2, 2000.00);   -- 2x Té Verde

-- Insertar detalles del pedido para el pedido en la Mesa 4
INSERT INTO Detalles_Pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(3, 1, 3, 1500.00),   -- 3x Café Americano
(3, 2, 1, 3500.00);   -- 1x Latte

ALTER TABLE Pedidos ADD COLUMN estado VARCHAR(50);
ALTER TABLE Detalles_Pedido MODIFY COLUMN subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED;

use  Cafeteria;
select * from Productos;
select * from Usuarios;
SELECT * FROM sedes;
SELECT * FROM roles;
SELECT * FROM Pedidos;
SELECT * FROM Detalles_Pedido;
SELECT * FROM Mesas;
SELECT * FROM facturas;
```

# Método GetMesas con Algoritmo de Ordenamiento Burbuja

Descripción: Este método obtiene una lista de mesas de una sede específica y las ordena por el número de mesa utilizando el algoritmo de ordenamiento burbuja.

Partes del Código:

•	Conexión a la Base de Datos: Se establece una conexión a la base de datos y se ejecuta una consulta para obtener las mesas de una sede específica.

•	Lectura de Datos: Se leen los datos obtenidos de la consulta y se agregan a una lista de objetos Mesa.

•	Ordenamiento Burbuja: Se aplica el algoritmo de ordenamiento burbuja para ordenar las mesas por el número de mesa.

•	Retorno de Datos: Se retorna la lista de mesas ordenadas.


```typescript

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

                // Ordenar las mesas por número de mesa usando el algoritmo de burbuja
                for (int i = 0; i < mesas.Count - 1; i++)
                {
                    for (int j = 0; j < mesas.Count - i - 1; j++)
                    {
                        if (mesas[j].numero_mesa > mesas[j + 1].numero_mesa)
                        {
                            var temp = mesas[j];
                            mesas[j] = mesas[j + 1];
                            mesas[j + 1] = temp;
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

```
# Por qué es un Algoritmo Voraz
El algoritmo es voraz porque en cada paso selecciona el producto que maximiza el beneficio inmediato, definido como el precio del producto. Este enfoque asegura que se utilice el presupuesto de la manera más eficiente posible.
1.	Ordenar los productos por beneficio (precio) en orden descendente: El algoritmo primero ordena los productos disponibles por su precio en orden descendente. Esto significa que los productos más caros, que ofrecen el mayor beneficio por unidad, se consideran primero.
2.	Seleccionar los productos en ese orden y agregarlos al pedido hasta que se agote el presupuesto: Luego, el algoritmo recorre la lista de productos ordenados y selecciona tantos como sea posible sin exceder el presupuesto disponible. Para cada producto, calcula cuántas unidades se pueden comprar con el presupuesto restante. Si se puede comprar al menos una unidad, se crea un detalle de pedido para ese producto y se actualiza el presupuesto restante.
Este proceso se repite hasta que el presupuesto se agota o no se pueden comprar más productos. Al tomar decisiones basadas en el beneficio inmediato en cada paso, el algoritmo cumple con la definición de un algoritmo voraz.
```typescript
[HttpPost("{mesaId}/productos")]

```
         
> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.


