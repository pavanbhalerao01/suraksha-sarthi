/**
 * POST /api/auth/login-citizen
 * Citizen login - Send OTP to registered phone
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { 
  generateOTP, 
  getOTPExpiry, 
  formatPhoneNumber,
  isValidIndianPhone 
} from '@/lib/auth/otp';
import { sendOTPSMS } from '@/lib/auth/twilio';
import { checkOTPRateLimit, logOTPSend } from '@/lib/auth/middleware';

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
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    const formattedPhone = formatPhoneNumber(phone);
    
    // Check rate limiting
    const rateLimit = await checkOTPRateLimit(formattedPhone);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many OTP requests. Please try again later',
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Phone number not registered. Please sign up first' },
        { status: 404 }
      );
    }
    
    if (user.role !== 'citizen') {
      return NextResponse.json(
        { error: 'This login is for citizens only. Team members please use email/password login' },
        { status: 403 }
      );
    }
    
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: `Account is ${user.status}. Please contact support` },
        { status: 403 }
      );
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    
    // Update user with OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: otpExpiry,
        otpAttempts: 0,
        otpLastSentAt: new Date(),
      },
    });
    
    // Send OTP via SMS
    const smsResult = await sendOTPSMS(formattedPhone, otp, user.name);
    
    if (!smsResult.success) {
      console.error('Failed to send login OTP:', smsResult.error);
    }
    
    // Log OTP send
    await logOTPSend(formattedPhone, user.id);
    
    return NextResponse.json({
      message: 'OTP sent to your registered phone number',
      phone: formattedPhone,
      expiresIn: '5 minutes',
      otpSent: smsResult.success,
    });
    
  } catch (error: any) {
    console.error('Login citizen error:', error);
    return NextResponse.json(
      { error: 'Failed to send login OTP. Please try again' },
      { status: 500 }
    );
  }
}
