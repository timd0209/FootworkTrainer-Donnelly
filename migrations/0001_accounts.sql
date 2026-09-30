-- Happy Feet Footwork account system.
-- Review before applying to any remote D1 database.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  "username" TEXT UNIQUE,
  "role" TEXT NOT NULL DEFAULT 'user' CHECK ("role" IN ('user','admin')),
  "banned" INTEGER NOT NULL DEFAULT 0,
  "banReason" TEXT,
  "banExpires" INTEGER,
  "lastLoginAt" INTEGER
);

CREATE INDEX IF NOT EXISTS "idx_user_role_banned" ON "user" ("role", "banned");
CREATE INDEX IF NOT EXISTS "idx_user_created" ON "user" ("createdAt");

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "impersonatedBy" TEXT
);
CREATE INDEX IF NOT EXISTS "idx_session_user" ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "idx_session_expires" ON "session" ("expiresAt");

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" INTEGER,
  "refreshTokenExpiresAt" INTEGER,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_account_user" ON "account" ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_account_provider_identity" ON "account" ("providerId", "accountId");

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "createdAt" INTEGER,
  "updatedAt" INTEGER
);
CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON "verification" ("identifier");

CREATE TABLE IF NOT EXISTS "rateLimit" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "key" TEXT NOT NULL UNIQUE,
  "count" INTEGER NOT NULL,
  "lastRequest" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "registration_codes" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "code_hash" TEXT NOT NULL UNIQUE,
  "created_at" INTEGER NOT NULL,
  "expires_at" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active','redeeming','used','revoked')),
  "created_by" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "redeemed_at" INTEGER,
  "redeemed_by" TEXT REFERENCES "user"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "idx_invite_status" ON "registration_codes" ("status", "expires_at");

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "admin_id" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT,
  "created_at" INTEGER NOT NULL,
  "details" TEXT
);
CREATE INDEX IF NOT EXISTS "idx_audit_created" ON "audit_log" ("created_at");

CREATE TABLE IF NOT EXISTS "workouts" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "completed_at" INTEGER NOT NULL,
  "rounds" INTEGER NOT NULL CHECK ("rounds" > 0),
  "active_seconds" INTEGER NOT NULL CHECK ("active_seconds" >= 0),
  "duration_seconds" INTEGER NOT NULL CHECK ("duration_seconds" >= 0),
  "commands" INTEGER NOT NULL DEFAULT 0 CHECK ("commands" >= 0),
  "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_workouts_user_completed" ON "workouts" ("user_id", "completed_at" DESC);
