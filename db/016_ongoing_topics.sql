CREATE TABLE IF NOT EXISTS velvet_ongoing_topics (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  label TEXT NOT NULL,
  latest_content TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'new' CHECK (state IN ('new','continued','changed','done')),
  first_episode_id TEXT NOT NULL,
  latest_episode_id TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id,user_id,customer_id,topic_id)
);
CREATE INDEX IF NOT EXISTS idx_velvet_ongoing_topics_customer ON velvet_ongoing_topics(workspace_id,user_id,customer_id,state,last_seen_at DESC);
