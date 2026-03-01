-- Add missing OTP columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otp" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otpExpires" TIMESTAMP(3);

-- Also add other potentially missing columns referenced in the app
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;

-- Add missing columns to team_profiles
ALTER TABLE "team_profiles" ADD COLUMN IF NOT EXISTS "state" TEXT NOT NULL DEFAULT 'Maharashtra';
ALTER TABLE "team_profiles" ADD COLUMN IF NOT EXISTS "verification_document_url" TEXT;
ALTER TABLE "team_profiles" ADD COLUMN IF NOT EXISTS "last_duty_toggle" TIMESTAMP(3);
