/**
 * POST /api/auth/register-citizen
 * Step 1: Citizen registration - Send OTP to phone
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
    const { name, email, phone } = body;
    
    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Full name and phone number are required' },
        { status: 400 }
      );
    }
    
    // Validate phone format
    if (!isValidIndianPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid Indian phone number. Must be 10 digits starting with 6-9' },
        { status: 400 }
      );
    }
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);
    
    // Check rate limiting (max 5 OTP per hour per phone)
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
    
    // Check if phone already registered
    const existingUser = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    });
    
    if (existingUser && existingUser.phoneVerified) {
      return NextResponse.json(
        { error: 'Phone number already registered. Please login instead' },
        { status: 409 }
      );
    }
    
    // Check if email already used (optional field)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    
    // Create or update user with pending OTP
    const user = await prisma.user.upsert({
      where: { phone: formattedPhone },
      update: {
        name,
        email: email || undefined,
        otpCode: otp,
        otpExpiresAt: otpExpiry,
        otpAttempts: 0,
        otpLastSentAt: new Date(),
      },
      create: {
        name,
        email: email || `citizen-${Date.now()}@survive.exe`, // Dummy email if not provided
        phone: formattedPhone,
        role: 'citizen',
        status: 'pending', // Will become 'active' after OTP verification
        phoneVerified: false,
        otpCode: otp,
        otpExpiresAt: otpExpiry,
        otpAttempts: 0,
        otpLastSentAt: new Date(),
      },
    });
    
    // Send OTP via SMS
    const smsResult = await sendOTPSMS(formattedPhone, otp, name);
    
    if (!smsResult.success) {
      console.error('Failed to send OTP SMS:', smsResult.error);
      // Continue anyway - OTP is saved in DB for demo mode
    }
    
    // Log OTP send for rate limiting
    await logOTPSend(formattedPhone, user.id);
    
    return NextResponse.json({
      message: 'OTP sent to your phone number',
      phone: formattedPhone,
      expiresIn: '5 minutes',
      otpSent: smsResult.success,
    });
    
  } catch (error: any) {
    console.error('Register citizen error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again' },
      { status: 500 }
    );
  }
}
