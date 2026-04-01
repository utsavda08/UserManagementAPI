# User Management API

A RESTful API built with **Node.js** and **Express** that supports full CRUD operations for managing users. The project includes input validation and two custom middleware layers: request logging and API-key authentication.

---

## Features

| Requirement | Implementation |
|---|---|
| CRUD endpoints | `GET`, `POST`, `PUT`, `DELETE` on `/api/users` |
| Input validation | `utils/validation.js` — checks name, email format, and role |
| Logging middleware | `middleware/logger.js` — logs method, URL, status code, and duration |
| Auth middleware | `middleware/auth.js` — API-key check on all write operations |
| Duplicate detection | Returns `409 Conflict` if email already exists |
| Partial updates | `PUT` supports updating only the fields you send |

---

## Project Structure

```
user-management-api/
├── server.js                  # Main Express app & routes
├── middleware/
│   ├── auth.js                # API-key authentication middleware
│   └── logger.js              # HTTP request logger middleware
├── utils/
│   └── validation.js          # User input validation helper
├── package.json
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 16

### Install & Run

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/user-management-api.git
cd user-management-api

# 2. Install dependencies
npm install

# 3. Start the server
npm start
# or for auto-restart on file changes:
npm run dev
```

The server starts at **http://localhost:3000**.

---

## API Reference

### Authentication

Write operations (`POST`, `PUT`, `DELETE`) require an API key passed in the request header:

```
x-api-key: my-secret-key
```

To use a custom key, set the `API_KEY` environment variable before starting the server.

---

### Endpoints

#### `GET /api/users`
Returns all users. Optionally filter by role.

**Query params:** `?role=admin|user|moderator`

```bash
curl http://localhost:3000/api/users
curl http://localhost:3000/api/users?role=admin
```

---

#### `GET /api/users/:id`
Returns a single user by ID.

```bash
curl http://localhost:3000/api/users/1
```

---

#### `POST /api/users`
Creates a new user. Requires authentication.

**Body (JSON):**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | ✅ | 2–100 characters |
| email | string | ✅ | Valid email format |
| role | string | ❌ | `admin`, `user`, or `moderator` (defaults to `user`) |

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "x-api-key: my-secret-key" \
  -d '{"name": "Carol White", "email": "carol@example.com", "role": "user"}'
```

---

#### `PUT /api/users/:id`
Updates an existing user (partial update supported). Requires authentication.

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: my-secret-key" \
  -d '{"name": "Alice Johnson-Smith"}'
```

---

#### `DELETE /api/users/:id`
Deletes a user by ID. Requires authentication.

```bash
curl -X DELETE http://localhost:3000/api/users/2 \
  -H "x-api-key: my-secret-key"
```

---

## Response Format

All responses follow a consistent shape:

```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": { ... }
}
```

Error responses include an `errors` array for validation issues:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["email must be a valid email address"]
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing API key) |
| 403 | Forbidden (invalid API key) |
| 404 | Not Found |
| 409 | Conflict (duplicate email) |
| 500 | Internal Server Error |

---

## Middleware Details

### Logger (`middleware/logger.js`)
Applied globally to every request. Outputs:
```
[2024-03-20T10:15:30.000Z] POST   /api/users                     201  12ms
```
Status codes are color-coded in the terminal (green = 2xx, yellow = 4xx, red = 5xx).

### Auth (`middleware/auth.js`)
Applied only to `POST`, `PUT`, and `DELETE` routes. Reads the `x-api-key` header and rejects requests with a `401` (missing) or `403` (invalid) response before the route handler runs.

---

## Notes

- This project uses an **in-memory array** as the data store for simplicity. Data resets when the server restarts. In a production project, replace it with a database (MongoDB, PostgreSQL, etc.).
- The API key is hardcoded to `my-secret-key` for demonstration. Set the `API_KEY` environment variable in production.
