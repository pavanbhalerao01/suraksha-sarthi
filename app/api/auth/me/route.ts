/**
 * GET /api/auth/me
 * Get current authenticated user details
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch full user details from database
    const userDetails = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        teamProfile: {
          select: {
            teamType: true,
            teamId: true,
            badgeNumber: true,
            department: true,
            district: true,
            state: true,
            specializations: true,
            onDuty: true,
          },
        },
      },
    });
    
    if (!userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      user: userDetails,
    });
    
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
