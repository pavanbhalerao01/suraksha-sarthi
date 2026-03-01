/**
 * POST /api/auth/send-otp
 * Unified OTP sending for both registration and login
 * Checks if user exists and handles accordingly
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
    const { phone, name, email } = body;
    
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
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    });
    
    let user;
    let isNewUser = false;
    
    if (existingUser) {
      // EXISTING USER - Update with new OTP
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          otpCode: otp,
          otpExpiresAt: otpExpiry,
          otpAttempts: 0,
          otpLastSentAt: new Date(),
        },
      });
    } else {
      // NEW USER - Create with pending status
      if (!name) {
        return NextResponse.json(
          { error: 'Name is required for new registration' },
          { status: 400 }
        );
      }
      
      isNewUser = true;
      
      user = await prisma.user.create({
        data: {
          name,
          email: email || `${formattedPhone.replace('+', '')}@survive.exe`,
          phone: formattedPhone,
          passwordHash: 'otp-only', // Placeholder - citizens use OTP only
          role: 'CITIZEN', // Default role for new registrations
          isActive: false, // Will be activated after OTP verification
          status: 'pending',
          otpCode: otp,
          otpExpiresAt: otpExpiry,
          otpAttempts: 0,
          otpLastSentAt: new Date(),
        },
      });
    }
    
    // Send OTP via SMS
    const smsResult = await sendOTPSMS(formattedPhone, otp, name || user.name);
    
    if (!smsResult.success) {
      console.error('Failed to send OTP:', smsResult.error);
      // Continue anyway - OTP is saved in DB for demo mode
    }
    
    // Log OTP send
    await logOTPSend(formattedPhone, user.id);
    
    return NextResponse.json({
      message: isNewUser 
        ? 'OTP sent! Complete verification to activate your account' 
        : 'OTP sent to your registered phone number',
      phone: formattedPhone,
      expiresIn: '5 minutes',
      otpSent: smsResult.success,
      isNewUser,
    });
    
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again' },
      { status: 500 }
    );
  }
}
