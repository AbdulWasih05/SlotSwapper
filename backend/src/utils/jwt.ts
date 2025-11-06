import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/index.js';

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    console.warn('⚠️  Using default JWT_SECRET - DO NOT USE IN PRODUCTION');
    return 'default-secret-for-dev-mode-only';
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  return secret;
})();
const JWT_EXPIRES_IN = '7d';

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
