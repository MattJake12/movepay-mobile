## 🔗 Endpoints da API Backend (Obrigatórios)

### 📝 Autenticação

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}

Response 200:
{
  "user": {
    "id": "123",
    "name": "Delcio Félix",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Delcio Félix",
  "email": "user@example.com",
  "password": "senha123"
}

Response 201:
{
  "user": { ... },
  "token": "..."
}
```

---

### 🚌 Viagens

#### Listar Viagens
```http
GET /api/trips?origin=São Paulo&destination=Rio de Janeiro&date=2025-12-15
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "trip-1",
    "origin": "São Paulo",
    "destination": "Rio de Janeiro",
    "date": "2025-12-15",
    "departureTime": "14:00",
    "arrivalTime": "20:30",
    "duration": "6h 30m",
    "busType": "Executivo",
    "price": 150.00,
    "availableSeats": 20,
    "totalSeats": 48
  }
]
```

#### Detalhes da Viagem
```http
GET /api/trips/{id}
Authorization: Bearer {token}

Response 200:
{
  "id": "trip-1",
  "origin": "São Paulo",
  "destination": "Rio de Janeiro",
  "date": "2025-12-15",
  "departureTime": "14:00",
  "arrivalTime": "20:30",
  "duration": "6h 30m",
  "busType": "Executivo",
  "description": "Ônibus com ar-condicionado, WiFi e tomadas USB",
  "price": 150.00,
  "availableSeats": 20,
  "seatMap": {
    "totalRows": 12,
    "seatsPerRow": 4,
    "occupiedSeats": ["2B", "3C", "5A"]
  }
}
```

---

### 🍔 Lanches

#### Listar Lanches
```http
GET /api/snacks
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "snack-1",
    "name": "Água Mineral 500ml",
    "description": "Água mineral gelada",
    "price": 5.00,
    "category": "bebidas"
  },
  {
    "id": "snack-2",
    "name": "Salgado Variado",
    "description": "Pacote com salgadinhos",
    "price": 12.00,
    "category": "comida"
  }
]
```

---

### 🎫 Reservas

#### Criar Reserva
```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "tripId": "trip-1",
  "seats": ["12A", "12B"],
  "snacks": [
    { "id": "snack-1", "quantity": 2 },
    { "id": "snack-2", "quantity": 1 }
  ],
  "paymentMethod": "credit_card"
}

Response 201:
{
  "id": "booking-123",
  "tripId": "trip-1",
  "userId": "user-1",
  "seats": ["12A", "12B"],
  "snacks": [...],
  "total": 320.00,
  "status": "confirmed",
  "paymentMethod": "credit_card",
  "createdAt": "2025-12-13T16:00:00Z",
  "qrCode": "booking-123-abc"
}
```

#### Detalhes da Reserva
```http
GET /api/bookings/{id}
Authorization: Bearer {token}

Response 200:
{
  "id": "booking-123",
  "tripOrigin": "São Paulo",
  "tripDestination": "Rio de Janeiro",
  "tripDate": "2025-12-15",
  "seats": ["12A", "12B"],
  "departureTime": "14:00",
  "total": 320.00,
  "status": "confirmed",
  "qrCode": "booking-123-abc"
}
```

---

### 🎫 Bilhetes do Usuário

#### Listar Bilhetes
```http
GET /api/tickets/user
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "ticket-1",
    "bookingId": "booking-123",
    "tripOrigin": "São Paulo",
    "tripDestination": "Rio de Janeiro",
    "tripDate": "2025-12-15",
    "seatNumber": "12A",
    "departureTime": "14:00",
    "status": "confirmed"
  }
]
```

#### Detalhes do Bilhete
```http
GET /api/tickets/{id}
Authorization: Bearer {token}

Response 200:
{
  "id": "ticket-1",
  "bookingId": "booking-123",
  "passengerName": "Delcio Félix",
  "tripOrigin": "São Paulo",
  "tripDestination": "Rio de Janeiro",
  "tripDate": "2025-12-15",
  "seatNumber": "12A",
  "departureTime": "14:00",
  "arrivalTime": "20:30",
  "confirmationCode": "MOV-2024-123456",
  "status": "confirmed",
  "qrCode": "ticket-1-qr-data"
}
```

---

## 🔐 Headers Obrigatórios

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## ❌ Tratamento de Erros

```json
{
  "error": "Erro ao buscar viagens",
  "code": "TRIPS_NOT_FOUND",
  "status": 404
}
```

---

**Integrada em:** `src/services/api.js`
