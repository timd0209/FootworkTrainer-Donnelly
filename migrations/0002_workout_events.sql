-- Track workout starts separately from completed workout records.
CREATE TABLE IF NOT EXISTS "workout_events" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "event_type" TEXT NOT NULL CHECK ("event_type" IN ('started')),
  "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_workout_events_type_created" ON "workout_events" ("event_type", "created_at");
CREATE INDEX IF NOT EXISTS "idx_workout_events_user" ON "workout_events" ("user_id", "created_at" DESC);
