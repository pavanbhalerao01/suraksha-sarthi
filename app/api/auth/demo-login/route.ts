/**
 * POST /api/auth/demo-login
 * DEMO MODE: Instant login bypass - no OTP verification
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { signToken } from '@/lib/auth/jwt';
import { formatPhoneNumber } from '@/lib/auth/otp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name } = body;
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }
    
    const formattedPhone = formatPhoneNumber(phone);
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        status: true,
      },
    });
    
    if (!user) {
      // Create new user instantly
      user = await prisma.user.create({
        data: {
          email: `${formattedPhone.replace(/\+/g, '')}@demo.survive.exe`,
          phone: formattedPhone,
          passwordHash: 'demo-bypass',
          password_hash: 'demo-bypass',
          name: name || 'Demo User',
          role: 'CITIZEN',
          isActive: true,
          status: 'active',
        },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          status: true,
        },
      });
      console.log(`✅ Demo user created: ${formattedPhone}`);
    } else {
      // Activate existing user if not active
      if (!user.status || user.status !== 'active') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            isActive: true,
            status: 'active',
            lastLogin: new Date(),
          },
          select: {
            id: true,
            email: true,
            phone: true,
            name: true,
            role: true,
            status: true,
          },
        });
      }
      console.log(`✅ Demo login for existing user: ${formattedPhone}`);
    }
    
    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.name,
      phone: user.phone || undefined,
      status: user.status,
    });
    
    // DEMO MODE: Skip session and audit log creation to avoid database column issues
    // In production, you would create session records here
    console.log(`🎯 Demo login successful for: ${user.name} (${user.phone})`);
    
    const response = NextResponse.json({
      message: 'Demo login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
    
    // Set auth cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    });
    
    return response;
    
  } catch (error: any) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: 'Demo login failed' },
      { status: 500 }
    );
  }
}
