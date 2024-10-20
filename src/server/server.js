import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { encryptPassword } from '../utils/encryption.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configura la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'Cafeteria'
});

// Conecta a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Endpoint para registrar usuarios
app.post('/register', (req, res) => {
  const { nombre, email, password, rol_id, sede_id } = req.body;
  const encryptedPassword = encryptPassword(password);

  const query = 'INSERT INTO Usuarios (nombre, email, password, rol_id, sede_id) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [nombre, email, encryptedPassword, rol_id, sede_id], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Busca el usuario por correo electrónico
  db.query('SELECT * FROM Usuarios WHERE LOWER(email) = LOWER(?)', [email], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = results[0];

    // Verifica la contraseña
    if (user.password !== encryptPassword(password)) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Busca el nombre de la sede usando el sede_id (puede ser NULL para administradores)
    db.query('SELECT nombre FROM sedes WHERE id = ?', [user.sede_id], (err, sedeResults) => {
      if (err) {
        console.error('Error al obtener la sede:', err);
        return res.status(500).json({ error: err.message });
      }

      const sedeNombre = sedeResults.length > 0 ? sedeResults[0].nombre : 'Sede desconocida';

      const token = jwt.sign({ id: user.id, rol: user.rol_id, sede_nombre: sedeNombre }, 'tu_clave_secreta');
      res.json({ token, rol: user.rol_id, sede_nombre: sedeNombre });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});