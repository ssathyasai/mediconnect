/**
 * lib/auth.js
 * JWT helpers — sign a token and verify it from the Authorization header.
 * Vercel serverless functions are stateless, so we use JWTs instead of sessions.
 */
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error('Please set the JWT_SECRET environment variable.');
}

/**
 * Creates a signed JWT that expires in 7 days.
 * @param {{ id: string, email: string, name: string }} payload
 */
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

/**
 * Verifies the JWT from the Authorization header.
 * Returns the decoded payload or null if invalid/missing.
 * @param {import('http').IncomingMessage} req
 */
function verifyToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

/**
 * Middleware-style helper for Vercel API functions.
 * Returns the decoded user or sends a 401 and returns null.
 */
function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated. Please log in.' });
    return null;
  }
  return user;
}

module.exports = { signToken, verifyToken, requireAuth };
