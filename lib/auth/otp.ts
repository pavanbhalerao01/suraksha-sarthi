/**
 * OTP (One-Time Password) Generation & Validation
 * For citizen authentication via SMS
 */

import crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 3;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

// Demo mode OTP (for testing without Twilio)
const DEMO_OTP = '123456';
const DEMO_MODE = process.env.TWILIO_DEMO_MODE === 'true';

/**
 * Generate a random 6-digit OTP
 * @returns 6-digit OTP string
 */
export function generateOTP(): string {
  if (DEMO_MODE) {
    return DEMO_OTP;
  }
  
  // Generate cryptographically secure random number
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  
  // Convert to 6-digit code
  const otp = (randomNumber % 1000000).toString().padStart(6, '0');
  
  return otp;
}

/**
 * Get OTP expiry date (5 minutes from now)
 * @returns Date object for OTP expiry
 */
export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiry;
}

/**
 * Check if OTP has expired
 * @param expiryDate OTP expiry date from database
 * @returns True if expired, false if still valid
 */
export function isOTPExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

/**
 * Check if OTP attempts exceeded
 * @param attempts Current OTP attempt count
 * @returns True if exceeded max attempts
 */
export function isOTPAttemptsExceeded(attempts: number): boolean {
  return attempts >= OTP_MAX_ATTEMPTS;
}

/**
 * Check if OTP resend cooldown is active
 * @param lastSentAt Last OTP sent timestamp
 * @returns True if still in cooldown, false if can resend
 */
export function isOTPResendCooldownActive(lastSentAt: Date | null): boolean {
  if (!lastSentAt) return false;
  
  const cooldownEnd = new Date(lastSentAt);
  cooldownEnd.setSeconds(cooldownEnd.getSeconds() + OTP_RESEND_COOLDOWN_SECONDS);
  
  return new Date() < cooldownEnd;
}

/**
 * Get remaining cooldown seconds
 * @param lastSentAt Last OTP sent timestamp
 * @returns Remaining seconds, or 0 if cooldown expired
 */
export function getOTPResendCooldownSeconds(lastSentAt: Date | null): number {
  if (!lastSentAt) return 0;
  
  const cooldownEnd = new Date(lastSentAt);
  cooldownEnd.setSeconds(cooldownEnd.getSeconds() + OTP_RESEND_COOLDOWN_SECONDS);
  
  const remainingMs = cooldownEnd.getTime() - new Date().getTime();
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  
  return Math.max(0, remainingSeconds);
}

/**
 * Validate OTP input format
 * @param otp OTP string from user input
 * @returns True if valid format (6 digits), false otherwise
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Compare user-entered OTP with stored OTP
 * @param enteredOTP OTP entered by user
 * @param storedOTP OTP stored in database
 * @returns True if match, false otherwise
 */
export function verifyOTP(enteredOTP: string, storedOTP: string): boolean {
  // In demo mode, accept the demo OTP
  if (DEMO_MODE && enteredOTP === DEMO_OTP) {
    return true;
  }
  
  return enteredOTP === storedOTP;
}

/**
 * Format phone number to E.164 format (+91XXXXXXXXXX)
 * @param phone Phone number (10 digits or with +91)
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 91, add +
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  
  // If 10 digits, add +91
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // Return as-is if already formatted
  return digits;
}

/**
 * Validate Indian phone number format
 * @param phone Phone number to validate
 * @returns True if valid Indian mobile number
 */
export function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  
  // 10 digits starting with 6-9
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return true;
  }
  
  // 12 digits starting with 91 (E.164 format without +)
  if (digits.length === 12 && /^91[6-9]\d{9}$/.test(digits)) {
    return true;
  }
  
  return false;
}

export const OTP_CONFIG = {
  LENGTH: OTP_LENGTH,
  EXPIRY_MINUTES: OTP_EXPIRY_MINUTES,
  MAX_ATTEMPTS: OTP_MAX_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS: OTP_RESEND_COOLDOWN_SECONDS,
  DEMO_MODE,
  DEMO_OTP,
};
