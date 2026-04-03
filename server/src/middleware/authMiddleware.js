import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth check - Header received:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth failed: No Bearer token in header');
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.slice(7);
    console.log('Token found, verifying...');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('Auth successful for user:', decoded.id);
    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return res.status(401).json({ error: `Invalid token: ${error.message}` });
  }
}

export default authMiddleware;
