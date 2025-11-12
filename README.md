# Travel Gallery Server

Аяллын зураг хадгалах REST API сервер

## Суулгах

```bash
npm install
```

## Тохиргоо

`.env` файл үүсгэж дараах тохиргоонуудыг оруулна:

```env
PG_HOST=localhost
PG_USER=postgres
PG_PORT=5432
PG_PASSWORD=0907
PG_DATABASE=travel_gallery
PORT=2000
```

## Өгөгдлийн сан тохируулах

1. PostgreSQL дээр өгөгдлийн сан үүсгэх:
```sql
CREATE DATABASE travel_gallery;
```

2. `database.sql` файлыг ажиллуулах:
```bash
psql -U postgres -d travel_gallery -f database.sql
```

Эсвэл PostgreSQL дээр шууд:
```sql
\i database.sql
```

## Сервер ажиллуулах

```bash
npm start
```

Сервер `http://localhost:2000` дээр ажиллана.

## API Endpoints

Дэлгэрэнгүй мэдээллийг `API_DOCUMENTATION.md` файлаас харна уу.

### Үндсэн endpoint-ууд:

- `GET /api/travels` - Бүх аяллын зургууд
- `GET /api/travels/:id` - ID-аар нэг зургийг авах
- `GET /api/travels/search/:keyword` - Тэмдэгтээр хайх
- `POST /api/travels` - Шинэ зургийн мэдээлэл нэмэх
- `PUT /api/travels/:id` - Зургийн мэдээлэл засах
- `DELETE /api/travels/:id` - Зургийн мэдээлэл устгах

## Онцлог

✅ CRUD үйлдлүүд (Create, Read, Update, Delete)
✅ Хайлт - хот/улс/газрын нэрээр
✅ Эрэмбэлэх - он сар эсвэл нэрийн дарааллаар
✅ Зураг хадгалах (Base64 формат)
✅ Хүн болгоны сэдэв давхардахгүй (title + location unique)

## Postman дээр турших

`API_DOCUMENTATION.md` файлаас Postman дээр турших дэлгэрэнгүй заавар харна уу.

