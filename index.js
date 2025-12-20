require('dotenv').config();
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
  database: process.env.PG_DATABASE || 'travel_gallery',
});

con.connect()
  .then(() => console.log('✅ PostgreSQL холбогдлоо...'))
  .catch((err) => console.error('❌ PostgreSQL холболт алдаа:', err));

// --- CREATE (POST) - Зураг, гарчиг, тайлбар нэмэх ---
app.post('/api/travels', async (req, res) => {
  const { title, description, location, country, city, imageBase64, travelDate } = req.body;
  
  // Хоосон талбаруудыг шалгах
  if (!title || !location) {
    return res.status(400).json({ error: 'Гарчиг болон байршил заавал шаардлагатай' });
  }

  try {
    const insertQuery = `
      INSERT INTO travel_gallery (title, description, location, country, city, image, travel_date, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
      RETURNING *
    `;
    const result = await con.query(insertQuery, [
      title,
      description || null,
      location,
      country || null,
      city || null,
      imageBase64 || null,
      travelDate || null
    ]);
    res.status(201).json({ 
      message: 'Амжилттай бүртгэлээ...', 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('❌ Query алдаа:', error.message);
    res.status(500).json({ error: 'Өгөгдлийн сангийн алдаа: ' + error.message });
  }
});

// --- READ ALL (GET) - Бүх аяллын зургуудыг авах, эрэмбэлэх ---
app.get('/api/travels', async (req, res) => {
  try {
    const { sortBy = 'created_at', order = 'DESC', search } = req.query;
    
    let query = 'SELECT * FROM travel_gallery';
    const params = [];
    
    // Хайлт - хот/улс/газрын нэрээр
    if (search) {
      query += ' WHERE title ILIKE $1 OR description ILIKE $1 OR location ILIKE $1 OR country ILIKE $1 OR city ILIKE $1';
      params.push(`%${search}%`);
    }
    
    // Эрэмбэлэх - он сар эсвэл нэрийн дарааллаар
    const validSortFields = ['created_at', 'travel_date', 'title', 'location'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    if (params.length > 0) {
      query += ` ORDER BY ${sortField} ${sortOrder}`;
    } else {
      query += ` ORDER BY ${sortField} ${sortOrder}`;
    }
    
    const result = await con.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    res.status(500).json({ error: 'Өгөгдөл авахад алдаа гарлаа' });
  }
});

// --- READ BY ID (GET) - ID-аар нэг зургийг авах ---
app.get('/api/travels/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const searchQuery = 'SELECT * FROM travel_gallery WHERE id = $1';
    const result = await con.query(searchQuery, [id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Өгөгдөл олдсонгүй' });
    }
  } catch (error) {
    console.error('❌ Id-аар хайхад алдаа гарлаа:', error);
    res.status(500).json({ error: 'Id-аар хайхад алдаа гарлаа' });
  }
});

// --- SEARCH (GET) - Тэмдэгтээр хайх ---
app.get('/api/travels/search/:keyword', async (req, res) => {
  const { keyword } = req.params;
  try {
    const searchQuery = `
      SELECT * FROM travel_gallery 
      WHERE title ILIKE $1 
         OR description ILIKE $1 
         OR location ILIKE $1 
         OR country ILIKE $1 
         OR city ILIKE $1 
      ORDER BY created_at DESC
    `;
    const result = await con.query(searchQuery, [`%${keyword}%`]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Хайлтын алдаа:', error);
    res.status(500).json({ error: 'Хайлтын алдаа гарлаа' });
  }
});

// --- UPDATE (PUT) - Засах ---
app.put('/api/travels/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, location, country, city, imageBase64, travelDate } = req.body;
  
  try {
    const updateQuery = `
      UPDATE travel_gallery 
      SET title = COALESCE($2, title),
          description = COALESCE($3, description),
          location = COALESCE($4, location),
          country = COALESCE($5, country),
          city = COALESCE($6, city),
          image = COALESCE($7, image),
          travel_date = COALESCE($8, travel_date),
          updated_at = NOW()
      WHERE id = $1 
      RETURNING *
    `;
    const result = await con.query(updateQuery, [
      id,
      title,
      description,
      location,
      country,
      city,
      imageBase64,
      travelDate
    ]);
    
    if (result.rows.length > 0) {
      res.status(200).json({ 
        message: 'Амжилттай засагдлаа',
        data: result.rows[0] 
      });
    } else {
      res.status(404).json({ error: 'Засах өгөгдөл олдсонгүй' });
    }
  } catch (error) {
    console.error('❌ Засахад алдаа гарлаа:', error);
    res.status(500).json({ error: 'Засахад алдаа гарлаа: ' + error.message });
  }
});

// --- DELETE (DELETE) - Устгах ---
app.delete('/api/travels/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = 'DELETE FROM travel_gallery WHERE id = $1 RETURNING *';
    const result = await con.query(deleteQuery, [id]);
    if (result.rows.length > 0) {
      res.status(200).json({ 
        message: 'Амжилттай устгалаа.', 
        deleted: result.rows[0] 
      });
    } else {
      res.status(404).json({ error: 'Устгах өгөгдөл олдсонгүй' });
    }
  } catch (error) {
    console.error('❌ Устгах алдаа:', error);
    res.status(500).json({ error: 'Устгах алдаа гарлаа' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Gallery API', 
    endpoints: {
      'GET /api/travels': 'Бүх аяллын зургууд (query: ?sortBy=title&order=ASC&search=keyword)',
      'GET /api/travels/:id': 'ID-аар нэг зургийг авах',
      'GET /api/travels/search/:keyword': 'Тэмдэгтээр хайх',
      'POST /api/travels': 'Шинэ зургийн мэдээлэл нэмэх',
      'PUT /api/travels/:id': 'Зургийн мэдээлэл засах',
      'DELETE /api/travels/:id': 'Зургийн мэдээлэл устгах'
    }
  });
});

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`🚀 Travel Gallery API сервер ${PORT} порт дээр ажиллаж байна...`));
