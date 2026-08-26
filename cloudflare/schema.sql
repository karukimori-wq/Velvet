CREATE TABLE IF NOT EXISTS velvet_roundtrip_checks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS velvet_customer_memories (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  display_name_snapshot TEXT,
  personality_note TEXT,
  preference_note TEXT,
  caution_note TEXT,
  conversation_summary TEXT,
  last_interaction_summary TEXT,
  next_topic_hint TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(workspace_id, user_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_velvet_customer_memories_scope ON velvet_customer_memories(workspace_id, user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS velvet_visits (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  reservation_id TEXT,
  status TEXT NOT NULL DEFAULT 'started',
  visit_reason TEXT,
  summary_ref TEXT,
  started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_velvet_visits_scope ON velvet_visits(workspace_id, user_id, customer_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS velvet_notes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  visit_id TEXT,
  note_type TEXT NOT NULL DEFAULT 'professional_note',
  note_ref TEXT,
  body_preview TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_velvet_notes_scope ON velvet_notes(workspace_id, user_id, customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS velvet_next_actions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  action_ref TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  due_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_velvet_next_actions_scope ON velvet_next_actions(workspace_id, user_id, customer_id, updated_at DESC);
