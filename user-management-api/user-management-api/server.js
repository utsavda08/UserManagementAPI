/**
 * User Management API
 * A RESTful API with CRUD operations, validation, and middleware
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { loggerMiddleware } = require('./middleware/logger');
const { authMiddleware } = require('./middleware/auth');
const { validateUser } = require('./utils/validation');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Built-in Middleware ───────────────────────────────────────────────────
app.use(express.json());         // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ─── Custom Middleware ─────────────────────────────────────────────────────
app.use(loggerMiddleware);       // Log every request
// Note: authMiddleware is applied per-route below (protects write operations)

// ─── In-Memory Data Store ──────────────────────────────────────────────────
// In a production app this would be replaced by a real database (e.g., MongoDB, PostgreSQL)
let users = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    createdAt: new Date('2024-02-20').toISOString(),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'User Management API is running',
    version: '1.0.0',
    endpoints: {
      'GET    /api/users':         'Get all users',
      'GET    /api/users/:id':     'Get a single user by ID',
      'POST   /api/users':         'Create a new user (requires auth)',
      'PUT    /api/users/:id':     'Update a user (requires auth)',
      'DELETE /api/users/:id':     'Delete a user (requires auth)',
    },
  });
});

// ─── GET /api/users ────────────────────────────────────────────────────────
// Returns all users. Supports optional ?role= query filter.
app.get('/api/users', (req, res) => {
  const { role } = req.query;

  let result = users;
  if (role) {
    result = users.filter(u => u.role === role);
  }

  res.json({
    success: true,
    count: result.length,
    data: result,
  });
});

// ─── GET /api/users/:id ────────────────────────────────────────────────────
// Returns a single user by ID.
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `User with id "${req.params.id}" not found`,
    });
  }

  res.json({ success: true, data: user });
});

// ─── POST /api/users ───────────────────────────────────────────────────────
// Creates a new user. Requires valid API key (auth middleware).
app.post('/api/users', authMiddleware, (req, res) => {
  const { errors, value } = validateUser(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Check for duplicate email
  const duplicate = users.find(u => u.email === value.email);
  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: `A user with email "${value.email}" already exists`,
    });
  }

  const newUser = {
    id: uuidv4(),
    ...value,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser,
  });
});

// ─── PUT /api/users/:id ────────────────────────────────────────────────────
// Updates an existing user. Requires valid API key (auth middleware).
app.put('/api/users/:id', authMiddleware, (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `User with id "${req.params.id}" not found`,
    });
  }

  // Validate only the fields provided (partial update allowed)
  const { errors, value } = validateUser(req.body, { partial: true });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // If email is being changed, ensure it's not already taken
  if (value.email) {
    const duplicate = users.find(
      u => u.email === value.email && u.id !== req.params.id
    );
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `A user with email "${value.email}" already exists`,
      });
    }
  }

  users[index] = {
    ...users[index],
    ...value,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: 'User updated successfully',
    data: users[index],
  });
});

// ─── DELETE /api/users/:id ─────────────────────────────────────────────────
// Deletes a user by ID. Requires valid API key (auth middleware).
app.delete('/api/users/:id', authMiddleware, (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `User with id "${req.params.id}" not found`,
    });
  }

  const deleted = users.splice(index, 1)[0];

  res.json({
    success: true,
    message: 'User deleted successfully',
    data: deleted,
  });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route "${req.method} ${req.originalUrl}" not found`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 User Management API running on http://localhost:${PORT}`);
  console.log(`   Use API key "my-secret-key" in the x-api-key header for write operations.\n`);
});

module.exports = app; // export for testing
