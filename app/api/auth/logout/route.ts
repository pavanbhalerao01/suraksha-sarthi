/**
 * POST /api/auth/logout
 * Logout user - Invalidate session and clear cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error } = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get token
    const authHeader = request.headers.get('authorization');
    let token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      token = request.cookies.get('auth_token')?.value || null;
    }
    
    // Delete session from database
    if (token) {
      const tokenHash = hashToken(token);
      
      await prisma.session.deleteMany({
        where: {
          userId: user.userId,
          tokenHash,
        },
      });
    }
    
    // Log logout
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'LOGOUT',
        entityType: 'user',
        entityId: user.userId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });
    
    // Clear auth cookie
    const response = NextResponse.json({
      message: 'Logged out successfully',
    });
    
    response.cookies.delete('auth_token');
    
    return response;
    
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
