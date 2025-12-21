require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// JWT Secret Key (production дээр .env файлд байх ёстой)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Токен байхгүй байна' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Хүчингүй токен' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTHENTICATION ENDPOINTS ====================

// --- REGISTER (POST) - Бүртгүүлэх ---
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Валидаци шалгах
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Бүх талбаруудыг бөглөнө үү' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой' });
  }

  try {
    // Имэйл эсвэл username давхардах эсэхийг шалгах
    const checkQuery = 'SELECT * FROM users WHERE email = $1 OR username = $2';
    const checkResult = await con.query(checkQuery, [email, username]);

    if (checkResult.rows.length > 0) {
      const existing = checkResult.rows[0];
      if (existing.email === email) {
        return res.status(400).json({ error: 'Энэ имэйл аль хэдийн бүртгэгдсэн байна' });
      }
      if (existing.username === username) {
        return res.status(400).json({ error: 'Энэ нэвтрэх нэр аль хэдийн бүртгэгдсэн байна' });
      }
    }

    // Нууц үг hash хийх
    const hashedPassword = await bcrypt.hash(password, 10);

    // Хэрэглэгч бүртгэх
    const insertQuery = `
      INSERT INTO users (username, email, password, created_at) 
      VALUES ($1, $2, $3, NOW()) 
      RETURNING id, username, email, created_at
    `;
    const result = await con.query(insertQuery, [username, email, hashedPassword]);
    const user = result.rows[0];

    // JWT Token үүсгэх
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Амжилттай бүртгэгдлээ',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Бүртгүүлэх алдаа:', error.message);
    res.status(500).json({ error: 'Бүртгүүлэхэд алдаа гарлаа: ' + error.message });
  }
});

// --- LOGIN (POST) - Нэвтрэх ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Валидаци шалгах
  if (!email || !password) {
    return res.status(400).json({ error: 'Имэйл болон нууц үг оруулна уу' });
  }

  try {
    // Хэрэглэгчийг олох
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await con.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Имэйл эсвэл нууц үг буруу байна' });
    }

    const user = result.rows[0];

    // Нууц үг шалгах
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Имэйл эсвэл нууц үг буруу байна' });
    }

    // JWT Token үүсгэх
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Амжилттай нэвтэрлээ',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Нэвтрэх алдаа:', error.message);
    res.status(500).json({ error: 'Нэвтрэхэд алдаа гарлаа: ' + error.message });
  }
});

// --- PROFILE (GET) - Профайл авах ---
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
    const result = await con.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Профайл авах алдаа:', error.message);
    res.status(500).json({ error: 'Профайл авахад алдаа гарлаа: ' + error.message });
  }
});

// ==================== TRAVEL ENDPOINTS ====================

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
      'POST /api/auth/register': 'Бүртгүүлэх (username, email, password)',
      'POST /api/auth/login': 'Нэвтрэх (email, password)',
      'GET /api/auth/profile': 'Профайл авах (Bearer token шаардлагатай)',
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
