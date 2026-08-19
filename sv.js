const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Se utiliza la variable de entorno DATABASE_URL
// Si estás probando localmente, puedes usar la cadena por defecto
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_lmaijOoFZk94@ep-morning-pond-ax97krt9-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

app.get('/api/characters', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM characters');
    res.json(result.rows);
  } catch (err) {
    console.error("Error SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

// C - CREATE: Agregar un nuevo personaje
app.post('/api/characters', async (req, res) => {
  const { name, minder, avatar_url, sector, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO characters (name, minder, avatar_url, sector, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, minder, avatar_url, sector, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

// R - READ: leer los personajes

app.get('/api/characters/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM characters WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('No encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

// U - UPDATE: Actualizar un personaje existente
app.put('/api/characters/:id', async (req, res) => {
  const { id } = req.params;
  const { name, minder, avatar_url, sector, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE characters SET name = $1, minder = $2, avatar_url = $3, sector = $4, description = $5 WHERE id = $6 RETURNING *',
      [name, minder, avatar_url, sector, description, id]
    );
    if (result.rows.length === 0) return res.status(404).send('No encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

// D - DELETE: Eliminar un personaje
app.delete('/api/characters/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM characters WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('No encontrado');
    res.json({ message: 'Personaje eliminado exitosamente' });
  } catch (err) {
    console.error("Error SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

// Render o cualquier hosting asignará automáticamente el puerto a través de process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en el puerto ${PORT}`));
