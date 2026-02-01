import { Response, NextFunction } from 'express';
import { AdminAuthRequest, AdminJWTPayload } from '../types/admin.js';
import { verifyToken } from '../utils/jwt.js';

export const adminAuthMiddleware = (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token) as AdminJWTPayload | null;

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Verify this is an admin token
    if (!decoded.isAdmin) {
      res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      return;
    }

    // Attach admin data to request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      clinicId: decoded.clinicId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
