/**
 * POST /api/auth/login
 * Action team & admin login - Email/Password authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { signToken, hashToken, getExpiryDate } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Citizens use OTP login, not password
    if (user.role === 'citizen') {
      return NextResponse.json(
        { error: 'Citizens please use phone number login' },
        { status: 403 }
      );
    }
    
    // Check if user has password (should always have for non-citizens)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Account not configured for password login' },
        { status: 403 }
      );
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      // Log failed login attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          entityType: 'user',
          entityId: user.id,
          details: {
            reason: 'Invalid password',
            email,
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null,
        },
      });
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check account status
    if (user.status === 'pending') {
      return NextResponse.json(
        { 
          error: 'Your account is pending NDRF validation. You will be notified once approved',
          status: 'pending',
        },
        { status: 403 }
      );
    }
    
    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support' },
        { status: 403 }
      );
    }
    
    if (user.status === 'rejected') {
      return NextResponse.json(
        { error: 'Your registration was rejected. Please contact support' },
        { status: 403 }
      );
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
    
    // Store session
    const tokenHash = hashToken(token);
    const expiresAt = getExpiryDate(8);
    
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });
    
    // Log successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'user',
        entityId: user.id,
        details: {
          email,
          role: user.role,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });
    
    // Fetch team profile if exists
    const teamProfile = await prisma.teamProfile.findUnique({
      where: { userId: user.id },
    });
    
    // Prepare response
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        teamProfile: teamProfile ? {
          teamType: teamProfile.teamType,
          teamId: teamProfile.teamId,
          department: teamProfile.department,
          district: teamProfile.district,
          onDuty: teamProfile.onDuty,
        } : null,
      },
      token,
    });
    
    // Set httpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    });
    
    return response;
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again' },
      { status: 500 }
    );
  }
}
