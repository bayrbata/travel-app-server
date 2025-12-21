# Database Setup Guide (Windows)

## Сонголт 1: pgAdmin ашиглах

1. pgAdmin нээх
2. PostgreSQL сервер дээр дарах (connect хийх)
3. `travel_gallery` database дээр right-click → Query Tool
4. Дараах SQL командуудыг ажиллуулах:

```sql
-- Хэрэглэгчдийн хүснэгт үүсгэх
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Аяллын зургуудын хүснэгт (хэрэв байхгүй бол)
CREATE TABLE IF NOT EXISTS travel_gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    image TEXT,
    travel_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_travel UNIQUE(title, location)
);

CREATE INDEX IF NOT EXISTS idx_travel_title ON travel_gallery(title);
CREATE INDEX IF NOT EXISTS idx_travel_location ON travel_gallery(location);
CREATE INDEX IF NOT EXISTS idx_travel_country ON travel_gallery(country);
CREATE INDEX IF NOT EXISTS idx_travel_city ON travel_gallery(city);
CREATE INDEX IF NOT EXISTS idx_travel_date ON travel_gallery(travel_date);
CREATE INDEX IF NOT EXISTS idx_travel_created_at ON travel_gallery(created_at);
```

## Сонголт 2: PostgreSQL bin folder-ийг PATH-д нэмэх

1. PostgreSQL суусан газрыг олох (ихэвчлэн: `C:\Program Files\PostgreSQL\<version>\bin`)
2. Environment Variables-ийг нээх:
   - Windows + R → `sysdm.cpl` → Advanced → Environment Variables
3. System Variables → Path → Edit → New
4. PostgreSQL bin folder path-ийг нэмэх (жишээ: `C:\Program Files\PostgreSQL\16\bin`)
5. PowerShell эсвэл Command Prompt-ийг дахин нээх
6. `psql --version` гэж туршиж үзэх

Дараа нь:
```bash
psql -U postgres -d travel_gallery -f database.sql
```

## Сонголт 3: Full path ашиглах

PostgreSQL суусан газрыг мэдэж байвал:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d travel_gallery -f database.sql
```

(16-ийг өөрийн PostgreSQL version-оор солих)

