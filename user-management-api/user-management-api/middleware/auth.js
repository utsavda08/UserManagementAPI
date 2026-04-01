/**
 * Authentication Middleware
 * Protects write endpoints (POST, PUT, DELETE) using a simple API-key scheme.
 *
 * In a real application you would use JWT tokens, OAuth, or a dedicated
 * auth service. This keeps the example self-contained and easy to test.
 *
 * How to authenticate:
 *   Add the header  x-api-key: my-secret-key  to any protected request.
 */

// In production, load this from an environment variable: process.env.API_KEY
const VALID_API_KEY = process.env.API_KEY || 'my-secret-key';

const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing x-api-key header',
    });
  }

  if (apiKey !== VALID_API_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid API key',
    });
  }

  // Key is valid — continue to the route handler
  next();
};

module.exports = { authMiddleware };
