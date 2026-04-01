/**
 * User Validation Utility
 * Validates and sanitizes user input before it reaches the database layer.
 */

const ALLOWED_ROLES = ['admin', 'user', 'moderator'];

/**
 * Validates a user payload.
 *
 * @param {object} data        - Raw request body
 * @param {object} options
 * @param {boolean} options.partial - When true (PUT), only validates fields that are present
 * @returns {{ errors: string[], value: object }}
 */
const validateUser = (data, { partial = false } = {}) => {
  const errors = [];
  const value = {};

  // ── name ────────────────────────────────────────────────────────────────
  if (!partial || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('name is required and must be a non-empty string');
    } else if (data.name.trim().length < 2) {
      errors.push('name must be at least 2 characters long');
    } else if (data.name.trim().length > 100) {
      errors.push('name must be 100 characters or fewer');
    } else {
      value.name = data.name.trim();
    }
  }

  // ── email ────────────────────────────────────────────────────────────────
  if (!partial || data.email !== undefined) {
    if (!data.email || typeof data.email !== 'string') {
      errors.push('email is required and must be a string');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.push('email must be a valid email address (e.g. user@example.com)');
      } else {
        value.email = data.email.trim().toLowerCase();
      }
    }
  }

  // ── role ─────────────────────────────────────────────────────────────────
  if (!partial || data.role !== undefined) {
    if (!data.role) {
      // Default to 'user' when creating (non-partial)
      if (!partial) value.role = 'user';
    } else if (!ALLOWED_ROLES.includes(data.role)) {
      errors.push(`role must be one of: ${ALLOWED_ROLES.join(', ')}`);
    } else {
      value.role = data.role;
    }
  }

  return { errors, value };
};

module.exports = { validateUser, ALLOWED_ROLES };
