-- Add missing auth tables without deleting existing data

-- 1. Create UserStatus enum if not exists
DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('pending', 'active', 'suspended', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add new columns to User table (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" DEFAULT 'active';
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otp_code" TEXT;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otp_expires_at" TIMESTAMP(3);
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otp_attempts" INTEGER DEFAULT 0;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otp_last_sent_at" TIMESTAMP(3);
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_validated" BOOLEAN DEFAULT false;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "validated_at" TIMESTAMP(3);
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "validated_by" TEXT;
END $$;

-- 3. Create team_profiles table
CREATE TABLE IF NOT EXISTS "team_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_type" TEXT NOT NULL,
    "team_id" TEXT,
    "badge_number" TEXT,
    "department" TEXT,
    "district" TEXT,
    "specializations" TEXT[],
    "on_duty" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_profiles_pkey" PRIMARY KEY ("id")
);

-- 4. Create validation_queue table
CREATE TABLE IF NOT EXISTS "validation_queue" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "documents" JSONB,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "rejection_reason" TEXT,

    CONSTRAINT "validation_queue_pkey" PRIMARY KEY ("id")
);

-- 5. Create audit_logs table
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- 6. Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "team_profiles_user_id_key" ON "team_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "team_profiles_team_type_idx" ON "team_profiles"("team_type");
CREATE INDEX IF NOT EXISTS "team_profiles_on_duty_idx" ON "team_profiles"("on_duty");

CREATE UNIQUE INDEX IF NOT EXISTS "validation_queue_user_id_key" ON "validation_queue"("user_id");
CREATE INDEX IF NOT EXISTS "validation_queue_status_idx" ON "validation_queue"("status");

CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- 7. Add foreign keys
DO $$ BEGIN
    ALTER TABLE "team_profiles" ADD CONSTRAINT "team_profiles_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "validation_queue" ADD CONSTRAINT "validation_queue_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
