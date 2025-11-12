require('dotenv').config(); // if using .env
const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // increase limit for base64 images

// PostgreSQL connection
const con = new Client({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
  password: process.env.PG_PASSWORD || '0907',
  database: process.env.PG_DATABASE || 'news',
});

con.connect()
  .then(() => console.log('✅ PostgreSQL холбогдлоо...'))
  .catch((err) => console.error('❌ PostgreSQL холболт алдаа:', err));

// --- CREATE (POST) ---
app.post('/postNews', async (req, res) => {
  const { type, imageBase64 } = req.body;
  try {
    const insertQuery = 'INSERT INTO newsturul (typename, image) VALUES ($1, $2) RETURNING *';
    const result = await con.query(insertQuery, [type, imageBase64 || null]);
    res.status(200).json({ message: 'Амжилттай бүртгэлээ...', data: result.rows[0] });
  } catch (error) {
    console.error('❌ Query алдаа:', error.message);
    res.status(500).json({ error: 'Өгөгдлийн сангийн алдаа' });
  }
});

// --- READ ALL (GET) ---
app.get('/', async (req, res) => {
  try {
    const fetchQuery = 'SELECT * FROM newsturul ORDER BY id';
    const result = await con.query(fetchQuery);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// --- READ BY ID (GET) ---
app.get('/search/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const searchQuery = 'SELECT * FROM newsturul WHERE id = $1';
    const result = await con.query(searchQuery, [id]);
    if (result.rows.length > 0) res.status(200).json(result.rows[0]);
    else res.status(404).send('Өгөгдөл олдсонгүй');
  } catch (error) {
    console.error('❌ Id-аар хайхад алдаа гарлаа:', error);
    res.status(500).send('Id-аар хайхад алдаа гарлаа');
  }
});

// --- UPDATE (PUT) ---
app.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { type, imageBase64 } = req.body;
  try {
    const updateQuery = 'UPDATE newsturul SET typename = $2, image = $3 WHERE id = $1 RETURNING *';
    const result = await con.query(updateQuery, [id, type, imageBase64 || null]);
    if (result.rows.length > 0) res.status(200).json(result.rows[0]);
    else res.status(404).send('Засах өгөгдөл олдсонгүй');
  } catch (error) {
    console.error('❌ Засахад алдаа гарлаа:', error);
    res.status(500).send('Засахад алдаа гарлаа');
  }
});

// --- DELETE (DELETE) ---
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = 'DELETE FROM newsturul WHERE id = $1 RETURNING *';
    const result = await con.query(deleteQuery, [id]);
    if (result.rows.length > 0)
      res.status(200).json({ message: 'Амжилттай устгалаа.', deleted: result.rows[0] });
    else res.status(404).send('Устгах өгөгдөл олдсонгүй');
  } catch (error) {
    console.error('❌ Устгах алдаа:', error);
    res.status(500).send('Устгах алдаа гарлаа');
  }
});

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`🚀 Express сервер ${PORT} порт дээр ажиллаж байна...`));
