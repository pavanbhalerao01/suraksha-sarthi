/**
 * Twilio SMS Service
 * Sends OTP codes via SMS for citizen authentication
 * Uses same credentials as volunteer panel
 */

import twilio from 'twilio';
import { formatPhoneNumber, OTP_CONFIG } from './otp';

// Twilio Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

// Initialize Twilio client (lazy loading)
let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!twilioClient) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
    }
    
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  
  return twilioClient;
}

/**
 * Send OTP via SMS to user's phone number
 * @param phone Phone number (will be formatted to E.164)
 * @param otp 6-digit OTP code
 * @param userName User's name for personalization
 * @returns Message SID if successful, error message if failed
 */
export async function sendOTPSMS(
  phone: string,
  otp: string,
  userName?: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    // Demo mode - don't actually send SMS
    if (OTP_CONFIG.DEMO_MODE) {
      console.log(`[DEMO MODE] OTP for ${phone}: ${otp}`);
      return {
        success: true,
        messageSid: 'demo-message-sid-' + Date.now(),
      };
    }
    
    // Format phone number to E.164
    const formattedPhone = formatPhoneNumber(phone);
    
    // Compose message
    const greeting = userName ? `Hello ${userName}` : 'Hello';
    const message = `${greeting},

Your OTP for Survive.exe Disaster Management Portal is: ${otp}

This code will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.

Do NOT share this code with anyone.

- Team Survive.exe`;
    
    // Send SMS via Twilio
    const client = getTwilioClient();
    const result = await client.messages.create({
      body: message,
      from: TWILIO_FROM_NUMBER,
      to: formattedPhone,
    });
    
    console.log(`OTP sent to ${formattedPhone}: ${result.sid}`);
    
    return {
      success: true,
      messageSid: result.sid,
    };
  } catch (error: any) {
    console.error('Twilio SMS error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to send OTP SMS',
    };
  }
}

/**
 * Send welcome SMS after successful registration
 * @param phone Phone number
 * @param userName User's full name
 * @param userRole User's role
 */
export async function sendWelcomeSMS(
  phone: string,
  userName: string,
  userRole: string
): Promise<void> {
  try {
    // Demo mode - don't send SMS
    if (OTP_CONFIG.DEMO_MODE) {
      console.log(`[DEMO MODE] Welcome SMS for ${phone}`);
      return;
    }
    
    const formattedPhone = formatPhoneNumber(phone);
    
    const roleDisplay = userRole === 'citizen' ? 'Citizen' : userRole.toUpperCase();
    const message = `Welcome to Survive.exe, ${userName}!

Your ${roleDisplay} account has been activated.

You can now report emergencies, track incidents, and stay updated on disaster alerts in Maharashtra.

Portal: https://survive.exe

Stay Safe!
- Team Survive.exe`;
    
    const client = getTwilioClient();
    await client.messages.create({
      body: message,
      from: TWILIO_FROM_NUMBER,
      to: formattedPhone,
    });
    
    console.log(`Welcome SMS sent to ${formattedPhone}`);
  } catch (error) {
    console.error('Failed to send welcome SMS:', error);
    // Don't throw error - welcome SMS is non-critical
  }
}

/**
 * Send emergency alert SMS (for SOS notifications)
 * @param phone Phone number
 * @param alertMessage Alert message
 */
export async function sendEmergencyAlertSMS(
  phone: string,
  alertMessage: string
): Promise<void> {
  try {
    if (OTP_CONFIG.DEMO_MODE) {
      console.log(`[DEMO MODE] Emergency alert to ${phone}: ${alertMessage}`);
      return;
    }
    
    const formattedPhone = formatPhoneNumber(phone);
    
    const client = getTwilioClient();
    await client.messages.create({
      body: `🚨 EMERGENCY ALERT 🚨\n\n${alertMessage}\n\nStay safe!\n- Survive.exe`,
      from: TWILIO_FROM_NUMBER,
      to: formattedPhone,
    });
    
    console.log(`Emergency alert sent to ${formattedPhone}`);
  } catch (error) {
    console.error('Failed to send emergency alert SMS:', error);
  }
}

/**
 * Validate that Twilio is properly configured
 * @returns True if configured, false otherwise
 */
export function isTwilioConfigured(): boolean {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
}
