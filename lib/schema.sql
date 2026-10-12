CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
  password_hash text NOT NULL, settings jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_name_unique ON users (lower(name));
CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode text NOT NULL, mode2 integer NOT NULL, language text NOT NULL, wpm double precision NOT NULL,
  accuracy double precision NOT NULL, duration double precision NOT NULL,
  data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS results_user_created ON results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS results_leaderboard ON results(mode, mode2, language, wpm DESC);
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY, hits integer NOT NULL DEFAULT 1, expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS race_rooms (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('public','private')),
  open boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 0,
  state jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS race_one_public_queue ON race_rooms(kind) WHERE open AND kind='public';
CREATE INDEX IF NOT EXISTS race_rooms_created ON race_rooms(created_at);
