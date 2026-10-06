ALTER TABLE workouts ADD COLUMN difficulty TEXT;
CREATE INDEX IF NOT EXISTS idx_workouts_difficulty ON workouts (difficulty);
