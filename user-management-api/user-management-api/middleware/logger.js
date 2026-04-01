/**
 * Logger Middleware
 * Logs every incoming HTTP request with method, URL, status, and response time.
 */

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  // Hook into the response "finish" event so we can log the status code
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const statusColor = getStatusColor(res.statusCode);

    console.log(
      `[${timestamp}] ${req.method.padEnd(6)} ${req.originalUrl.padEnd(30)} ` +
      `${statusColor}${res.statusCode}\x1b[0m  ${duration}ms`
    );
  });

  next();
};

/**
 * Returns an ANSI color code based on HTTP status code for pretty terminal output.
 * @param {number} status
 * @returns {string} ANSI escape code
 */
const getStatusColor = (status) => {
  if (status >= 500) return '\x1b[31m'; // red   — server errors
  if (status >= 400) return '\x1b[33m'; // yellow — client errors
  if (status >= 300) return '\x1b[36m'; // cyan   — redirects
  if (status >= 200) return '\x1b[32m'; // green  — success
  return '\x1b[0m';                      // reset  — informational
};

module.exports = { loggerMiddleware };
