import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'pokeapp-secret-key-change-in-production';

export function verifyAuth(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.userId;
  } catch {
    return null;
  }
}
