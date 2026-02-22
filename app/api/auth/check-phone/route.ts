/**
 * POST /api/auth/check-phone
 * Check if phone number is registered
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { formatPhoneNumber, isValidIndianPhone } from '@/lib/auth/otp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    if (!isValidIndianPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid Indian phone number format' },
        { status: 400 }
      );
    }
    
    const formattedPhone = formatPhoneNumber(phone);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
      },
    });
    
    if (user) {
      return NextResponse.json({
        exists: true,
        isActive: user.isActive && (!user.status || user.status === 'active'),
        user: {
          name: user.name,
          role: user.role,
        },
      });
    }
    
    return NextResponse.json({
      exists: false,
      message: 'Phone number not registered. Please complete registration.',
    });
    
  } catch (error: any) {
    console.error('Check phone error:', error);
    return NextResponse.json(
      { error: 'Failed to check phone number' },
      { status: 500 }
    );
  }
}
