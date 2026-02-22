/**
 * POST /api/auth/resend-otp
 * Resend OTP to phone number (with cooldown check)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { 
  generateOTP, 
  getOTPExpiry, 
  formatPhoneNumber,
  isOTPResendCooldownActive,
  getOTPResendCooldownSeconds 
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
    
    const formattedPhone = formatPhoneNumber(phone);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'No registration found for this phone number' },
        { status: 404 }
      );
    }
    
    // Already verified - redirect to login
    if (user.phoneVerified) {
      return NextResponse.json(
        { error: 'Phone already verified. Please login instead' },
        { status: 400 }
      );
    }
    
    // Check resend cooldown (60 seconds)
    if (isOTPResendCooldownActive(user.otpLastSentAt)) {
      const remainingSeconds = getOTPResendCooldownSeconds(user.otpLastSentAt);
      
      return NextResponse.json(
        { 
          error: `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
          remainingSeconds,
        },
        { status: 429 }
      );
    }
    
    // Check rate limiting (max 5 OTP per hour)
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
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    
    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: otpExpiry,
        otpAttempts: 0, // Reset attempts
        otpLastSentAt: new Date(),
      },
    });
    
    // Send OTP via SMS
    const smsResult = await sendOTPSMS(formattedPhone, otp, user.name);
    
    if (!smsResult.success) {
      console.error('Failed to resend OTP SMS:', smsResult.error);
    }
    
    // Log OTP send for rate limiting
    await logOTPSend(formattedPhone, user.id);
    
    return NextResponse.json({
      message: 'New OTP sent to your phone number',
      phone: formattedPhone,
      expiresIn: '5 minutes',
      otpSent: smsResult.success,
    });
    
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to resend OTP. Please try again' },
      { status: 500 }
    );
  }
}
