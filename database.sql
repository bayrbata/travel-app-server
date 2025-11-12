-- Travel Gallery Database Schema
-- PostgreSQL өгөгдлийн сангийн query

-- 1. Өгөгдлийн сан үүсгэх (хэрэв байхгүй бол)
-- CREATE DATABASE travel_gallery;

-- 2. Хүснэгт үүсгэх
CREATE TABLE IF NOT EXISTS travel_gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    image TEXT, -- Base64 encoded image
    travel_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Хүн болгоны сэдэв давхардахгүй байх (title + location хослол нь давхардахгүй)
    CONSTRAINT unique_travel UNIQUE(title, location)
);

-- 3. Index үүсгэх (хайлтыг хурдасгах)
CREATE INDEX IF NOT EXISTS idx_travel_title ON travel_gallery(title);
CREATE INDEX IF NOT EXISTS idx_travel_location ON travel_gallery(location);
CREATE INDEX IF NOT EXISTS idx_travel_country ON travel_gallery(country);
CREATE INDEX IF NOT EXISTS idx_travel_city ON travel_gallery(city);
CREATE INDEX IF NOT EXISTS idx_travel_date ON travel_gallery(travel_date);
CREATE INDEX IF NOT EXISTS idx_travel_created_at ON travel_gallery(created_at);

-- 4. Жишээ өгөгдөл оруулах (сонголт)
INSERT INTO travel_gallery (title, description, location, country, city, travel_date) VALUES
('Монголын говь', 'Говь нутагт аялсан зураг', 'Говь', 'Монгол', 'Далай', '2024-06-15'),
('Токио хот', 'Японы нийслэл Токио хотод аялсан зураг', 'Токио', 'Япон', 'Токио', '2024-07-20'),
('Парисын Эйфелийн цамхаг', 'Францын Парис хотод аялсан зураг', 'Эйфелийн цамхаг', 'Франц', 'Парис', '2024-08-10'),
('Нью-Йорк хот', 'Америкийн Нью-Йорк хотод аялсан зураг', 'Нью-Йорк', 'АНУ', 'Нью-Йорк', '2024-09-05')
ON CONFLICT (title, location) DO NOTHING;

-- 5. Хүснэгтийн бүтцийг харах
-- SELECT * FROM travel_gallery;

-- 6. Хүснэгтийг устгах (хэрэв дахин үүсгэх шаардлагатай бол)
-- DROP TABLE IF EXISTS travel_gallery CASCADE;

