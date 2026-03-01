/**
 * JWT Token Management
 * Handles JWT signing, verification, and user session tokens
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'survive-exe-secret-change-in-production';
const JWT_EXPIRY = '8h'; // 8 hours session expiry

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string;
  status: string;
}

/**
 * Sign a JWT token for authenticated user
 * @param payload User data to encode in token
 * @returns JWT token string
 */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'survive.exe',
    audience: 'survive.exe-users',
  });
}

/**
 * Verify and decode a JWT token
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'survive.exe',
      audience: 'survive.exe-users',
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Hash a token for database storage (prevent token theft from DB)
 * @param token JWT token string
 * @returns SHA-256 hash of token
 */
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Calculate expiry date from now
 * @param hours Number of hours until expiry
 * @returns Date object for expiry time
 */
export function getExpiryDate(hours: number = 8): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}
