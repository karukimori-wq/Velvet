CREATE TABLE IF NOT EXISTS velvet_conversation_episodes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  visit_id TEXT,
  capture_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  label TEXT NOT NULL,
  content TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'new' CHECK (state IN ('new','continued','changed','done')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_velvet_conversation_episodes_customer ON velvet_conversation_episodes(workspace_id,user_id,customer_id,occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_velvet_conversation_episodes_topic ON velvet_conversation_episodes(workspace_id,user_id,customer_id,topic_id,occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_velvet_conversation_episode_capture_topic ON velvet_conversation_episodes(capture_id,topic_id,label,content);
