CREATE TABLE IF NOT EXISTS velvet_owner_preferences (
  owner_user_id TEXT PRIMARY KEY,
  soon_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
