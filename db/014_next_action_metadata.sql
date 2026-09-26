ALTER TABLE velvet_professional_next_actions ADD COLUMN IF NOT EXISTS action_type TEXT;
ALTER TABLE velvet_professional_next_actions ADD COLUMN IF NOT EXISTS topic_id TEXT;
ALTER TABLE velvet_professional_next_actions ADD COLUMN IF NOT EXISTS timing TEXT;
ALTER TABLE velvet_professional_next_actions ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE velvet_professional_next_actions ADD COLUMN IF NOT EXISTS source_capture_id TEXT;
ALTER TABLE velvet_professional_next_actions ADD COLUMN IF NOT EXISTS source_topic_id TEXT;
ALTER TABLE velvet_professional_next_actions DROP CONSTRAINT IF EXISTS velvet_professional_next_actions_status_check;
ALTER TABLE velvet_professional_next_actions ADD CONSTRAINT velvet_professional_next_actions_status_check CHECK (status IN ('open','done','cancelled'));
