/**
 * Authentication Middleware
 * Protects API routes and pages, validates JWT tokens
 */

import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt';
import prisma from '@/lib/db';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Extract and verify JWT from request
 * Checks both Authorization header and cookies
 */
export async function authenticate(
  request: NextRequest
): Promise<{ user: JWTPayload | null; error: string | null }> {
  try {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = extractTokenFromHeader(authHeader);
    
    // Fallback to cookie
    if (!token) {
      token = request.cookies.get('auth_token')?.value || null;
    }
    
    if (!token) {
      return { user: null, error: 'No authentication token provided' };
    }
    
    // Verify JWT
    const payload = verifyToken(token);
    
    if (!payload) {
      return { user: null, error: 'Invalid or expired token' };
    }
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        name: true,
      },
    });
    
    if (!user) {
      return { user: null, error: 'User not found' };
    }
    
    if (user.status !== 'active') {
      return { user: null, error: `Account is ${user.status}` };
    }
    
    return { user: payload, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: JWTPayload; error: null } | { user: null; error: string }> {
  const { user, error } = await authenticate(request);
  
  if (!user || error) {
    return { user: null, error: error || 'Unauthorized' };
  }
  
  return { user, error: null };
}

/**
 * Require specific role(s) - returns 403 if role doesn't match
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ user: JWTPayload; error: null } | { user: null; error: string }> {
  const { user, error } = await requireAuth(request);
  
  if (!user) {
    return { user: null, error: error || 'Unauthorized' };
  }
  
  if (!allowedRoles.includes(user.role)) {
    return { 
      user: null, 
      error: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
    };
  }
  
  return { user, error: null };
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(role: string): boolean {
  return ['super_admin', 'ndrf_admin'].includes(role);
}

/**
 * Check if user is an action team member
 */
export function isActionTeam(role: string): boolean {
  return [
    'ndrf',
    'sdrf',
    'fire',
    'police',
    'medical',
    'ambulance',
    'civil_defense',
    'relief_camp',
  ].includes(role);
}

/**
 * Check if user is a citizen
 */
export function isCitizen(role: string): boolean {
  return role === 'citizen';
}

/**
 * Rate limiting check for OTP requests
 * Maximum 5 OTP requests per phone number per hour
 */
export async function checkOTPRateLimit(phone: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}> {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    // Count OTP logs in last hour
    const otpLogs = await prisma.auditLog.count({
      where: {
        action: 'SEND_OTP',
        details: {
          path: ['phone'],
          equals: phone,
        },
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });
    
    const MAX_OTP_PER_HOUR = 5;
    const remaining = Math.max(0, MAX_OTP_PER_HOUR - otpLogs);
    
    // Reset at next hour
    const resetAt = new Date();
    resetAt.setHours(resetAt.getHours() + 1);
    resetAt.setMinutes(0);
    resetAt.setSeconds(0);
    
    return {
      allowed: otpLogs < MAX_OTP_PER_HOUR,
      remaining,
      resetAt,
    };
  } catch (error) {
    // If rate limit check fails, allow the request but log the error
    console.warn('Rate limit check failed, allowing request:', error);
    const resetAt = new Date();
    resetAt.setHours(resetAt.getHours() + 1);
    return {
      allowed: true,
      remaining: 5,
      resetAt,
    };
  }
}

/**
 * Log OTP send action for rate limiting
 */
export async function logOTPSend(phone: string, userId?: string): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action: 'SEND_OTP',
        details: {
          phone,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging is non-critical
    console.warn('Failed to log OTP send:', error);
  }
}
