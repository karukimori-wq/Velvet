CREATE TABLE IF NOT EXISTS velvet_roundtrip_checks (id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL,user_id TEXT NOT NULL,request_id TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS velvet_customer_memories (id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL,user_id TEXT NOT NULL,customer_id TEXT NOT NULL,display_name_snapshot TEXT,personality_note TEXT,preference_note TEXT,caution_note TEXT,conversation_summary TEXT,last_interaction_summary TEXT,next_topic_hint TEXT,tags_json TEXT NOT NULL DEFAULT '[]',pinned INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),UNIQUE(workspace_id,user_id,customer_id));
CREATE INDEX IF NOT EXISTS idx_velvet_customer_memories_scope ON velvet_customer_memories(workspace_id,user_id,updated_at DESC);

CREATE TABLE IF NOT EXISTS velvet_professional_visits (id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL,user_id TEXT NOT NULL,customer_id TEXT NOT NULL,reservation_id TEXT,visit_schedule_id TEXT,visited_at TEXT NOT NULL,ended_at TEXT,duration_minutes INTEGER,service_context TEXT,seating_reason TEXT,conversation_memo TEXT,preference_memo TEXT,caution_memo TEXT,next_action_memo TEXT,summary TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_velvet_professional_visits_scope ON velvet_professional_visits(workspace_id,user_id,customer_id,visited_at DESC);

CREATE TABLE IF NOT EXISTS velvet_professional_timeline (id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL,user_id TEXT NOT NULL,customer_id TEXT NOT NULL,occurred_at TEXT NOT NULL,event_type TEXT NOT NULL,title TEXT NOT NULL,body TEXT,source_ref TEXT);
CREATE INDEX IF NOT EXISTS idx_velvet_timeline_scope ON velvet_professional_timeline(workspace_id,user_id,customer_id,occurred_at DESC);

CREATE TABLE IF NOT EXISTS velvet_professional_next_actions (id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL,user_id TEXT NOT NULL,customer_id TEXT NOT NULL,text TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open',created_at TEXT NOT NULL,completed_at TEXT);
CREATE INDEX IF NOT EXISTS idx_velvet_next_actions_scope ON velvet_professional_next_actions(workspace_id,user_id,customer_id,status,created_at DESC);

CREATE TABLE IF NOT EXISTS velvet_professional_captures (id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL,user_id TEXT NOT NULL,customer_id TEXT,kind TEXT NOT NULL,raw_text TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_velvet_captures_scope ON velvet_professional_captures(workspace_id,user_id,customer_id,created_at DESC);

CREATE TABLE IF NOT EXISTS velvet_notes (id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL,user_id TEXT NOT NULL,customer_id TEXT NOT NULL,visit_id TEXT,note_type TEXT NOT NULL DEFAULT 'professional_note',note_ref TEXT,body_preview TEXT,created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE INDEX IF NOT EXISTS idx_velvet_notes_scope ON velvet_notes(workspace_id,user_id,customer_id,created_at DESC);

CREATE TABLE IF NOT EXISTS velvet_professional_gifts (id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL,user_id TEXT NOT NULL,customer_id TEXT NOT NULL,direction TEXT NOT NULL,item TEXT NOT NULL,occasion TEXT,memo TEXT,occurred_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_velvet_professional_gifts_scope ON velvet_professional_gifts(workspace_id,user_id,customer_id,occurred_at DESC);
