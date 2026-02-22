/**
 * POST /api/auth/verify-otp
 * Step 2: Verify OTP and activate citizen account
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { 
  verifyOTP, 
  isOTPExpired, 
  isOTPAttemptsExceeded,
  isValidOTPFormat,
  formatPhoneNumber 
} from '@/lib/auth/otp';
import { signToken, hashToken, getExpiryDate } from '@/lib/auth/jwt';
import { sendWelcomeSMS } from '@/lib/auth/twilio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;
    
    // Validate input
    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }
    
    if (!isValidOTPFormat(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format. Must be 6 digits' },
        { status: 400 }
      );
    }
    
    const formattedPhone = formatPhoneNumber(phone);
    
    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    });
    
    if (!user || !user.otpCode) {
      return NextResponse.json(
        { error: 'No OTP request found for this phone number' },
        { status: 404 }
      );
    }
    
    // Check if OTP expired
    if (user.otpExpiresAt && isOTPExpired(user.otpExpiresAt)) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one' },
        { status: 400 }
      );
    }
    
    // Check if attempts exceeded
    if (isOTPAttemptsExceeded(user.otpAttempts || 0)) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP' },
        { status: 400 }
      );
    }
    
    // Verify OTP - DEMO MODE: Always accept 123456
    let isValid = false;
    
    if (otp === '123456') {
      // Demo OTP - always valid for testing
      isValid = true;
      console.log('✅ Demo OTP accepted: 123456');
    } else {
      // Real OTP - verify against stored hash
      isValid = verifyOTP(otp, user.otpCode);
    }
    
    if (!isValid) {
      // Increment failed attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpAttempts: (user.otpAttempts || 0) + 1,
        },
      });
      
      const remainingAttempts = 3 - (user.otpAttempts || 0) - 1;
      
      return NextResponse.json(
        { 
          error: 'Invalid OTP',
          remainingAttempts: Math.max(0, remainingAttempts),
        },
        { status: 400 }
      );
    }
    
    // OTP verified! Activate account and create session
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true, // Activate account
        status: 'active', // Set status to active
        otpCode: null, // Clear OTP
        otpExpiresAt: null,
        otpAttempts: 0,
        lastLogin: new Date(), // Update last login time
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
    
    // Generate JWT token
    const token = signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      fullName: updatedUser.name,
      phone: updatedUser.phone || undefined,
      status: updatedUser.status,
    });
    
    // Store session in database
    const tokenHash = hashToken(token);
    const expiresAt = getExpiryDate(8); // 8 hours
    
    await prisma.session.create({
      data: {
        userId: updatedUser.id,
        tokenHash,
        expiresAt,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });
    
    // Log successful registration
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: 'REGISTER_CITIZEN',
        entityType: 'user',
        entityId: updatedUser.id,
        details: {
          phone: formattedPhone,
          method: 'OTP',
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });
    
    // Send welcome SMS (non-blocking)
    sendWelcomeSMS(formattedPhone, updatedUser.name, 'citizen')
      .catch(err => console.error('Failed to send welcome SMS:', err));
    
    // Set auth cookie
    const response = NextResponse.json({
      message: 'Registration successful! Welcome to Survive.exe',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
      token,
    });
    
    // Set httpOnly cookie for web sessions
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: '/',
    });
    
    return response;
    
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again' },
      { status: 500 }
    );
  }
}
