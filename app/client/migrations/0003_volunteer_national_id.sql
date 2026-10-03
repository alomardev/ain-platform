-- national_id is now mandatory (enforced by the API) and must be unique.
-- SQLite allows multiple NULLs under a UNIQUE index, so legacy rows without an ID are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS idx_volunteers_national_id ON volunteers(national_id);
