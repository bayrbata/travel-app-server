# Travel Gallery API Documentation

## API Endpoints

### Base URL
```
http://localhost:2000
```

---

## 1. GET - Бүх аяллын зургуудыг авах

**Endpoint:** `GET /api/travels`

**Query Parameters:**
- `sortBy` (optional): Эрэмбэлэх талбар (`created_at`, `travel_date`, `title`, `location`)
- `order` (optional): Эрэмбэ (`ASC` эсвэл `DESC`) - Default: `DESC`
- `search` (optional): Хайлтын түлхүүр үг (title, description, location, country, city дээр хайна)

**Жишээ:**
```
GET /api/travels
GET /api/travels?sortBy=title&order=ASC
GET /api/travels?search=Токио
GET /api/travels?sortBy=travel_date&order=DESC&search=Монгол
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Монголын говь",
    "description": "Говь нутагт аялсан зураг",
    "location": "Говь",
    "country": "Монгол",
    "city": "Далай",
    "image": "base64_encoded_image_string",
    "travel_date": "2024-06-15",
    "created_at": "2024-06-15T10:00:00.000Z",
    "updated_at": "2024-06-15T10:00:00.000Z"
  }
]
```

---

## 2. GET - ID-аар нэг зургийг авах

**Endpoint:** `GET /api/travels/:id`

**Жишээ:**
```
GET /api/travels/1
```

**Response:**
```json
{
  "id": 1,
  "title": "Монголын говь",
  "description": "Говь нутагт аялсан зураг",
  "location": "Говь",
  "country": "Монгол",
  "city": "Далай",
  "image": "base64_encoded_image_string",
  "travel_date": "2024-06-15",
  "created_at": "2024-06-15T10:00:00.000Z",
  "updated_at": "2024-06-15T10:00:00.000Z"
}
```

---

## 3. GET - Тэмдэгтээр хайх

**Endpoint:** `GET /api/travels/search/:keyword`

**Жишээ:**
```
GET /api/travels/search/Токио
GET /api/travels/search/Монгол
```

**Response:**
```json
[
  {
    "id": 2,
    "title": "Токио хот",
    ...
  }
]
```

---

## 4. POST - Шинэ зургийн мэдээлэл нэмэх

**Endpoint:** `POST /api/travels`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Шинэ аялал",
  "description": "Аяллын тайлбар",
  "location": "Байршил",
  "country": "Улс",
  "city": "Хот",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "travelDate": "2024-10-15"
}
```

**Required Fields:**
- `title` (required)
- `location` (required)

**Response:**
```json
{
  "message": "Амжилттай бүртгэлээ...",
  "data": {
    "id": 5,
    "title": "Шинэ аялал",
    ...
  }
}
```

---

## 5. PUT - Зургийн мэдээлэл засах

**Endpoint:** `PUT /api/travels/:id`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Зассан гарчиг",
  "description": "Зассан тайлбар",
  "location": "Зассан байршил",
  "country": "Зассан улс",
  "city": "Зассан хот",
  "imageBase64": "data:image/jpeg;base64,...",
  "travelDate": "2024-11-20"
}
```

**Жишээ:**
```
PUT /api/travels/1
```

**Response:**
```json
{
  "message": "Амжилттай засагдлаа",
  "data": {
    "id": 1,
    "title": "Зассан гарчиг",
    ...
  }
}
```

---

## 6. DELETE - Зургийн мэдээлэл устгах

**Endpoint:** `DELETE /api/travels/:id`

**Жишээ:**
```
DELETE /api/travels/1
```

**Response:**
```json
{
  "message": "Амжилттай устгалаа.",
  "deleted": {
    "id": 1,
    "title": "Монголын говь",
    ...
  }
}
```

---

## Postman дээр турших заавар

### 1. Environment үүсгэх
- Postman дээр `Environments` → `+` → `Create Environment`
- Variable: `base_url`, Value: `http://localhost:2000`

### 2. Collection үүсгэх
- `Collections` → `+` → `New Collection`
- Нэр: "Travel Gallery API"

### 3. Request-ууд нэмэх

#### GET All Travels
- Method: `GET`
- URL: `{{base_url}}/api/travels`
- Params (optional):
  - `sortBy`: `title`
  - `order`: `ASC`
  - `search`: `Токио`

#### GET Travel by ID
- Method: `GET`
- URL: `{{base_url}}/api/travels/1`

#### Search Travels
- Method: `GET`
- URL: `{{base_url}}/api/travels/search/Токио`

#### POST New Travel
- Method: `POST`
- URL: `{{base_url}}/api/travels`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "title": "Парисын аялал",
  "description": "Францын нийслэлд аялсан",
  "location": "Парис",
  "country": "Франц",
  "city": "Парис",
  "travelDate": "2024-12-01"
}
```

#### PUT Update Travel
- Method: `PUT`
- URL: `{{base_url}}/api/travels/1`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "title": "Зассан гарчиг",
  "description": "Зассан тайлбар"
}
```

#### DELETE Travel
- Method: `DELETE`
- URL: `{{base_url}}/api/travels/1`

---

## Алдааны кодууд

- `200` - Амжилттай
- `201` - Амжилттай үүсгэсэн
- `400` - Буруу хүсэлт
- `404` - Олдсонгүй
- `500` - Серверийн алдаа

